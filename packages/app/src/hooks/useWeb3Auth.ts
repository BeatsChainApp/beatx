'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

export function useWeb3Auth() {
  const auth = useUnifiedAuth()
  
  return {
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    loading: auth.loading,
    signIn: auth.signIn,
    signOut: auth.signOut,
    wallet: auth.wallet
  }
}