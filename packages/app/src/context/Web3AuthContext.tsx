'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { SiweMessage } from 'siwe'

// Super admin wallets
const SUPER_ADMIN_WALLETS = [
  '0x1234567890123456789012345678901234567890', // Replace with your actual wallet
]

interface Web3User {
  address: string
  displayName: string
  role: 'user' | 'producer' | 'admin' | 'super_admin'
  permissions: string[]
  isVerified: boolean
  profileImage?: string
  createdAt: Date
}

interface Web3AuthContextType {
  user: Web3User | null
  loading: boolean
  isAuthenticated: boolean
  signIn: () => Promise<void>
  signOut: () => void
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
}

const ROLE_PERMISSIONS = {
  user: ['browse', 'purchase', 'profile'],
  producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics'],
  admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management'],
  super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management', 'system_settings', 'role_management']
}

const Web3AuthContext = createContext<Web3AuthContextType | undefined>(undefined)

export function Web3AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Web3User | null>(null)
  const [loading, setLoading] = useState(false)
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account
  const { signMessageAsync } = useSignMessage()

  const signIn = async () => {
    if (!address || !isConnected) return
    
    setLoading(true)
    try {
      // Get nonce
      const nonceRes = await fetch('/api/auth/nonce')
      const { nonce } = await nonceRes.json()

      // Create SIWE message
      const message = new SiweMessage({
        domain: typeof window !== 'undefined' ? window.location.host : 'beatschain.app',
        address,
        statement: 'Sign in to BeatsChain',
        uri: typeof window !== 'undefined' ? window.location.origin : 'https://beatschain.app',
        version: '1',
        chainId: 1,
        nonce
      })

      // Sign message
      const signature = await signMessageAsync({
        message: message.prepareMessage()
      })

      // Verify signature
      const verifyRes = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, signature })
      })

      if (verifyRes.ok) {
        // Load or create user profile
        const profile = loadUserProfile(address)
        setUser(profile)
        
        // Store session
        localStorage.setItem('web3_session', JSON.stringify({
          address,
          signature,
          timestamp: Date.now()
        }))
      }
    } catch (error) {
      console.error('Sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem('web3_session')
  }

  const loadUserProfile = (walletAddress: string): Web3User => {
    const profileKey = `web3_profile_${walletAddress.toLowerCase()}`
    const stored = localStorage.getItem(profileKey)
    
    if (stored) {
      const profile = JSON.parse(stored)
      return {
        ...profile,
        createdAt: new Date(profile.createdAt)
      }
    }

    // Determine role
    let role: Web3User['role'] = 'user'
    if (SUPER_ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
      role = 'super_admin'
    }

    // Create new profile
    const newProfile: Web3User = {
      address: walletAddress,
      displayName: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      role,
      permissions: ROLE_PERMISSIONS[role],
      isVerified: role === 'super_admin' || role === 'admin',
      createdAt: new Date()
    }

    // Save profile
    localStorage.setItem(profileKey, JSON.stringify(newProfile))
    return newProfile
  }

  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }

  const hasRole = (role: string): boolean => {
    return user?.role === role || false
  }

  // Auto-load session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const session = localStorage.getItem('web3_session')
    if (session && isConnected && address) {
      const { address: sessionAddress, timestamp } = JSON.parse(session)
      
      // Check if session is valid (24 hours)
      if (sessionAddress === address && Date.now() - timestamp < 24 * 60 * 60 * 1000) {
        const profile = loadUserProfile(address)
        setUser(profile)
      } else {
        localStorage.removeItem('web3_session')
      }
    }
  }, [address, isConnected])

  const isAuthenticated = Boolean(user && isConnected && address)

  return (
    <Web3AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated,
      signIn,
      signOut,
      hasPermission,
      hasRole
    }}>
      {children}
    </Web3AuthContext.Provider>
  )
}

export function useWeb3Auth() {
  const context = useContext(Web3AuthContext)
  if (!context) {
    throw new Error('useWeb3Auth must be used within Web3AuthProvider')
  }
  return context
}