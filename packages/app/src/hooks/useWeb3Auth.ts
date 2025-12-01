'use client'

import { useAccount } from 'wagmi'
import { useSIWE } from '@/context/SIWEContext'

// Super admin wallets for role-based access
const SUPER_ADMIN_WALLETS = [
  '0xc84799A904EeB5C57aBBBc40176E7dB8be202C10', // Admin wallet from extension
  '0xC84799A904EeB5C57aBBBc40176E7dB8be202C10', // Same wallet (case variation)
]

interface Web3User {
  address: string
  displayName: string
  role: 'user' | 'producer' | 'admin' | 'super_admin'
  permissions: string[]
  isVerified: boolean
}

const ROLE_PERMISSIONS = {
  user: ['browse', 'purchase', 'profile'],
  producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics'],
  admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management'],
  super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'admin_panel', 'user_management', 'system_settings', 'role_management']
}

export function useWeb3Auth() {
  const { address, isConnected } = useAccount()
  const { isAuthenticated, signIn, signOut } = useSIWE()
  
  // Determine role from wallet address
  const getRole = (walletAddress: string): Web3User['role'] => {
    if (typeof window === 'undefined') return 'user'
    
    // Check if wallet is super admin (case insensitive)
    const normalizedAddress = walletAddress.toLowerCase()
    const isAdmin = SUPER_ADMIN_WALLETS.some(addr => addr.toLowerCase() === normalizedAddress)
    
    if (isAdmin) {
      console.log('🔑 Admin wallet detected:', walletAddress)
      return 'super_admin'
    }
    
    try {
      const profileKey = `web3_profile_${normalizedAddress}`
      const profile = localStorage.getItem(profileKey)
      if (profile) {
        const parsed = JSON.parse(profile)
        return parsed.role || 'user'
      }
    } catch (error) {
      console.warn('Error reading profile:', error)
    }
    
    return 'user'
  }
  
  // Build Web3 user
  const user: Web3User | null = isConnected && address ? {
    address,
    displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
    role: getRole(address),
    permissions: ROLE_PERMISSIONS[getRole(address)],
    isVerified: isAuthenticated
  } : null
  
  // Permission checks
  const hasPermission = (permission: string): boolean => {
    return user?.permissions.includes(permission) || false
  }
  
  const hasRole = (role: string): boolean => {
    return user?.role === role || false
  }
  
  const hasAnyRole = (roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false
  }
  
  return {
    user,
    isConnected,
    isAuthenticated,
    signIn,
    signOut,
    hasPermission,
    hasRole,
    hasAnyRole,
    wallet: {
      address,
      isConnected
    }
  }
}