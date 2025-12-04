'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useActiveAccount, useActiveWallet } from "thirdweb/react"

/**
 * Robust authentication hook that consolidates all auth systems
 * Prioritizes wallet connection while maintaining backward compatibility
 */
export function useRobustAuth() {
  const unifiedAuth = useUnifiedAuth()
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  
  const address = account?.address
  const isConnected = !!account && !!wallet
  const chainId = account?.chainId

  // Wallet connection methods
  const connectWallet = async () => {
    try {
      // ThirdWeb wallet connection handled by ConnectButton component
      console.log('Use ConnectButton component for wallet connection')
    } catch (error) {
      console.error('Wallet connection failed:', error)
    }
  }

  const disconnectWallet = async () => {
    try {
      if (wallet) {
        await wallet.disconnect()
      }
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