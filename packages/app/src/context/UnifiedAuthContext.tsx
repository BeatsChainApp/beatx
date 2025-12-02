'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useAccount } from 'wagmi'
import { useSIWE } from './SIWEContext'
import { useWeb3Profile } from '@/hooks/useWeb3Profile'
import { isClientSide, safeLocalStorage, isAdminEmail } from '@/lib/auth-utils'
import { rbacInvestigator } from '@/lib/rbac-investigation'

// Super admin wallets and emails
const SUPER_ADMIN_WALLETS = [
  process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase(),
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10', // Your wallet address
].filter(Boolean) as string[]

const ADMIN_EMAILS = [
  'info@unamifoundation.org',
  'admin@beatschain.app',
  'support@beatschain.app'
]

interface UnifiedUser {
  address: string
  displayName: string
  email?: string
  role: 'user' | 'producer' | 'admin' | 'super_admin'
  permissions: string[]
  isVerified: boolean
  profileImage?: string
  createdAt: Date
}

interface UnifiedAuthContextType {
  user: UnifiedUser | null
  loading: boolean
  isAuthenticated: boolean
  
  // Permission checks
  hasPermission: (permission: string) => boolean
  hasRole: (role: string) => boolean
  hasAnyRole: (roles: string[]) => boolean
  
  // Authentication methods
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  
  // Wallet info
  wallet: {
    address?: string
    isConnected: boolean
  }
}

const ROLE_PERMISSIONS = {
  user: ['browse', 'purchase', 'profile'],
  producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats'],
  admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation'],
  super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation', 'system_settings', 'role_management']
}

const UnifiedAuthContext = createContext<UnifiedAuthContextType | undefined>(undefined)

export function UnifiedAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UnifiedUser | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { address, isConnected } = useAccount()
  const siweContext = useSIWE()
  const { profile: web3Profile, loading: profileLoading } = useWeb3Profile()
  
  const { user: siweUser, signIn: siweSignIn, signOut: siweSignOut, isAuthenticated: siweAuth } = siweContext || {
    user: null, signIn: async () => {}, signOut: async () => {}, isAuthenticated: false
  }

  const buildUnifiedUser = useCallback(() => {
    if (!isClientSide()) {
      setUser(null)
      setLoading(false)
      return
    }
    
    // Prevent execution if hooks failed to initialize
    if (!address) {
      setUser(null)
      setLoading(false)
      return
    }
    
    // Prevent loops by checking if user data actually changed
    const currentUserKey = `${address}-${web3Profile?.role}`
    const lastUserKey = user ? `${user.address}-${user.role}` : null
    
    if (currentUserKey === lastUserKey && user) {
      setLoading(false)
      return // No change, skip rebuild
    }
    
    setLoading(true)
    
    try {
      // Check for Google auth even without wallet
      const hasGoogleAuth = safeLocalStorage().getItem('google_auth_result')
      
      // No wallet connected and no Google auth
      if ((!address || !isConnected) && !hasGoogleAuth) {
        setUser(null)
        setLoading(false)
        return
      }
      
      // Handle Google-only auth (no wallet)
      if (!address && hasGoogleAuth) {
        try {
          const googleData = JSON.parse(hasGoogleAuth)
          const role = ADMIN_EMAILS.includes(googleData.email?.toLowerCase()) ? 'super_admin' : 'user'
          
          const googleUser: UnifiedUser = {
            address: `google:${googleData.sub}`,
            displayName: googleData.name,
            email: googleData.email,
            role,
            permissions: ROLE_PERMISSIONS[role],
            isVerified: googleData.verified_email,
            profileImage: googleData.picture,
            createdAt: new Date()
          }
          
          setUser(googleUser)
          setLoading(false)
          return
        } catch (error) {
          console.error('Error processing Google auth:', error)
        }
      }

      // Determine role with super admin priority
      let role: UnifiedUser['role'] = 'user'
      
      // HIGHEST PRIORITY: Check if wallet is in super admin list
      if (SUPER_ADMIN_WALLETS.includes(address.toLowerCase())) {
        role = 'super_admin'
      }
      // Check if email is admin (from Google OAuth or Reown AppKit social login)
      else if (web3Profile?.email && ADMIN_EMAILS.some(email => email.toLowerCase() === web3Profile.email.toLowerCase())) {
        role = 'super_admin'
      }
      // Check Google Auth user email
      else if (typeof window !== 'undefined') {
        try {
          const googleUser = localStorage.getItem('google_auth_result')
          if (googleUser) {
            const parsed = JSON.parse(googleUser)
            if (parsed.email && ADMIN_EMAILS.includes(parsed.email.toLowerCase())) {
              role = 'super_admin'
            }
          }
          
          // Also check Google profile data
          const googleProfileKey = `web3_profile_google_${address?.toLowerCase() || ''}`
          const googleProfile = localStorage.getItem(googleProfileKey)
          if (googleProfile) {
            const parsedProfile = JSON.parse(googleProfile)
            if (parsedProfile.email && ADMIN_EMAILS.includes(parsedProfile.email.toLowerCase())) {
              role = 'super_admin'
            }
          }
        } catch (error) {
          console.warn('Error checking Google auth:', error)
        }
      }
      // Then check Web3 profile
      else if (web3Profile?.role === 'admin' || web3Profile?.role === 'producer') {
        role = web3Profile.role as UnifiedUser['role']
      }
      else if (web3Profile?.role) {
        role = web3Profile.role as UnifiedUser['role']
      }
      
      // Get Google user data if available
      let googleUser = null
      try {
        const googleData = localStorage.getItem('google_auth_result')
        if (googleData) {
          googleUser = JSON.parse(googleData)
        }
      } catch (error) {
        console.warn('Error parsing Google user data:', error)
      }
      
      // Build unified user from available data
      const unifiedUser: UnifiedUser = {
        address,
        displayName: web3Profile?.displayName || googleUser?.name || `User ${address.slice(0, 6)}...${address.slice(-4)}`,
        email: web3Profile?.email || googleUser?.email,
        role,
        permissions: ROLE_PERMISSIONS[role],
        isVerified: web3Profile?.isVerified || googleUser?.verified_email || role === 'super_admin' || role === 'admin',
        profileImage: web3Profile?.profileImage || googleUser?.picture,
        createdAt: web3Profile?.createdAt || new Date()
      }

      setUser(unifiedUser)
      
      // Auto-upgrade profile if needed
      if (role === 'super_admin' || role === 'admin') {
        upgradeProfileRole(address, role)
      }
      

      
    } catch (error) {
      console.error('Error building unified user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [address, isConnected, web3Profile?.role])

  useEffect(() => {
    if (typeof window === 'undefined') {
      setUser(null)
      setLoading(false)
      return
    }
    
    // Safe initialization - don't wait for profileLoading if hooks failed
    if (profileLoading === false || profileLoading === undefined) {
      buildUnifiedUser()
    }
  }, [profileLoading, buildUnifiedUser])
  
  // Listen for admin setup completion and run RBAC investigation
  useEffect(() => {
    const handleAdminSetup = () => {
      setTimeout(() => {
        buildUnifiedUser()
        // Run comprehensive RBAC investigation
        if (process.env.NODE_ENV === 'development') {
          rbacInvestigator.investigateDataPipelines()
        }
      }, 100)
    }
    
    window.addEventListener('admin-setup-complete', handleAdminSetup)
    return () => window.removeEventListener('admin-setup-complete', handleAdminSetup)
  }, [buildUnifiedUser])



  const upgradeProfileRole = async (walletAddress: string, role: string) => {
    if (typeof window === 'undefined') return
    
    try {
      // Force create/update super admin profile
      const profileKey = `web3_profile_${walletAddress.toLowerCase()}`
      const newProfile = {
        address: walletAddress,
        displayName: role === 'super_admin' ? 'Super Admin' : 'Admin',
        bio: 'Platform administrator',
        role,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      localStorage.setItem(profileKey, JSON.stringify(newProfile))
      
      // Update admin config
      const adminConfig = {
        adminWallets: [walletAddress.toLowerCase()],
        setupComplete: true,
        createdAt: new Date()
      }
      localStorage.setItem('admin_config', JSON.stringify(adminConfig))
      
      // No automatic refresh to prevent loops
      
    } catch (error) {
      console.error('Error upgrading profile role:', error)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false
    return user.permissions.includes(permission)
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    // Super admin can access any role
    if (user.role === 'super_admin') return true
    return user.role === role
  }

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false
    // Super admin can access any role
    if (user.role === 'super_admin') return true
    return roles.includes(user.role)
  }

  const signIn = async () => {
    if (isConnected && address) {
      try {
        if (siweSignIn) {
          await siweSignIn()
        } else {
          console.warn('SIWE sign in not available')
        }
      } catch (error) {
        console.error('Sign in failed:', error)
      }
    }
  }

  const signOut = async () => {
    try {
      if (siweSignOut) {
        await siweSignOut()
      }
      
      // Clear Google auth data
      if (typeof window !== 'undefined') {
        localStorage.removeItem('google_auth_result')
        // Clear Google profiles
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('web3_profile_google_')) {
            localStorage.removeItem(key)
          }
        })
      }
      
      setUser(null)
    } catch (error) {
      console.error('Sign out failed:', error)
      setUser(null)
    }
  }

  // Check if user is authenticated via Google or Web3
  const hasGoogleAuth = typeof window !== 'undefined' && localStorage.getItem('google_auth_result')
  
  const isAuthenticated = Boolean(
    (isConnected && address && (siweAuth || SUPER_ADMIN_WALLETS.includes(address.toLowerCase()))) || // Web3 auth
    hasGoogleAuth // Google auth
  ) && typeof window !== 'undefined'

  const value: UnifiedAuthContextType = {
    user,
    loading,
    isAuthenticated,
    hasPermission,
    hasRole,
    hasAnyRole,
    signIn,
    signOut,
    wallet: {
      address,
      isConnected
    }
  }

  return (
    <UnifiedAuthContext.Provider value={value}>
      {children}
    </UnifiedAuthContext.Provider>
  )
}

export function useUnifiedAuth() {
  const context = useContext(UnifiedAuthContext)
  if (!context) {
    // Return safe fallback instead of throwing error
    console.warn('useUnifiedAuth used outside provider, returning fallback')
    return {
      user: null,
      loading: false,
      isAuthenticated: false,
      hasPermission: () => false,
      hasRole: () => false,
      hasAnyRole: () => false,
      signIn: async () => {},
      signOut: async () => {},
      wallet: { address: undefined, isConnected: false }
    }
  }
  return context
}