'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useActiveAccount } from "thirdweb/react"
// Removed Reown AppKit - using Thirdweb

/**
 * Robust authentication hook that consolidates all auth systems
 * Prioritizes wallet connection while maintaining backward compatibility
 */
export function useRobustAuth() {
  const unifiedAuth = useUnifiedAuth()
  const { address, isConnected, chainId } = useAccount()
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()

  // Wallet connection methods
  const connectWallet = async () => {
    try {
      await open()
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      await disconnect()
      await unifiedAuth.signOut()
    } catch (error) {
      console.error('Wallet disconnection failed:', error)
    }
  }

  // Authentication state
  const isWalletConnected = isConnected && !!address
  const isAuthenticated = unifiedAuth.isAuthenticated || isWalletConnected
  const user = unifiedAuth.user

  // Role and permission checks
  const hasRole = (role: string) => unifiedAuth.hasRole(role)
  const hasPermission = (permission: string) => unifiedAuth.hasPermission(permission)
  const hasAnyRole = (roles: string[]) => unifiedAuth.hasAnyRole(roles)

  // Admin checks
  const isAdmin = hasAnyRole(['admin', 'super_admin'])
  const isSuperAdmin = hasRole('super_admin')
  const isProducer = hasAnyRole(['producer', 'admin', 'super_admin'])

  // Permission shortcuts
  const canUpload = hasPermission('upload')
  const canAccessDashboard = hasAnyRole(['producer', 'admin', 'super_admin'])
  const canAccessAdmin = hasAnyRole(['admin', 'super_admin'])

  return {
    // User state
    user,
    isAuthenticated,
    loading: unifiedAuth.loading,
    
    // Wallet state
    wallet: {
      address,
      isConnected: isWalletConnected,
      chainId
    },
    
    // Connection methods
    connectWallet,
    disconnectWallet,
    signIn: unifiedAuth.signIn,
    signOut: disconnectWallet,
    
    // Role checks
    hasRole,
    hasPermission,
    hasAnyRole,
    isAdmin,
    isSuperAdmin,
    isProducer,
    
    // Permission shortcuts
    canUpload,
    canAccessDashboard,
    canAccessAdmin
  }
}