'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAccount } from 'wagmi'

interface User {
  id: string
  email: string
  name: string
  picture?: string
  wallet_address?: string
  role: 'user' | 'producer' | 'creator' | 'admin' | 'super_admin'
  is_verified: boolean
  created_at: string
}

interface SimpleAuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  
  // Permission checks
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  
  // Authentication methods
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  
  // Wallet info
  wallet: {
    address?: string
    isConnected: boolean
  }
}

const ROLE_PERMISSIONS = {
  user: ['browse', 'purchase', 'profile'],
  producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics'],
  creator: ['browse', 'purchase', 'profile', 'license', 'creator_dashboard'],
  admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management'],
  super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management', 'system_settings']
}

const SUPER_ADMIN_WALLETS = [
  process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase(),
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
].filter(Boolean) as string[]

const SimpleAuthContext = createContext<SimpleAuthContextType | undefined>(undefined)

export function SimpleAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const { address, isConnected } = useAccount()

  // Check for stored session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('beatschain_user')
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Failed to parse stored user:', error)
        localStorage.removeItem('beatschain_user')
      }
    }
  }, [])

  // Update user role if wallet is super admin
  useEffect(() => {
    if (user && address && SUPER_ADMIN_WALLETS.includes(address.toLowerCase())) {
      if (user.role !== 'super_admin') {
        const updatedUser = { ...user, role: 'super_admin' as const, is_verified: true }
        setUser(updatedUser)
        localStorage.setItem('beatschain_user', JSON.stringify(updatedUser))
      }
    }
  }, [user, address])

  const signInWithGoogle = async () => {
    setLoading(true)
    try {
      // Load Google Identity Services
      if (!window.google) {
        throw new Error('Google Identity Services not loaded')
      }

      const clientId = '239753403483-re3akggqub93apgm4t5nnabbbrcp0q1p.apps.googleusercontent.com'
      
      // Initialize Google OAuth
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            // Decode JWT token
            const payload = JSON.parse(atob(response.credential.split('.')[1]))
            
            // Create user object
            const user: User = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              wallet_address: address,
              role: payload.email === 'info@unamifoundation.org' ? 'super_admin' : 'user',
              is_verified: payload.email_verified || false,
              created_at: new Date().toISOString()
            }
            
            // Exchange token with MCP server (use configured MCP URL)
            const mcpBase = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'http://localhost:4000'
            const mcpResponse = await fetch(`${mcpBase}/api/token-exchange`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ idToken: response.credential })
            })
            
            if (mcpResponse.ok) {
              const session = await mcpResponse.json()
              console.log('MCP session created:', session)
            }
            
            setUser(user)
            localStorage.setItem('beatschain_user', JSON.stringify(user))
            setLoading(false)
          } catch (error) {
            console.error('OAuth callback error:', error)
            setLoading(false)
          }
        }
      })

      // Trigger sign-in popup
      window.google.accounts.id.prompt()
      
    } catch (error) {
      console.error('Google sign in failed:', error)
      setLoading(false)
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem('beatschain_user')
    localStorage.removeItem('google_auth_result')
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return ROLE_PERMISSIONS[user.role].includes(permission)
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    return user.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false
    if (user.role === 'super_admin') return true
    return roles.includes(user.role)
  }

  const isAuthenticated = Boolean(user)

  const value: SimpleAuthContextType = {
    user,
    loading,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyRole,
    signInWithGoogle,
    signOut,
    wallet: {
      address,
      isConnected
    }
  }

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  )
}

export function useSimpleAuth() {
  const context = useContext(SimpleAuthContext)
  if (!context) {
    throw new Error('useSimpleAuth must be used within SimpleAuthProvider')
  }
  return context
}