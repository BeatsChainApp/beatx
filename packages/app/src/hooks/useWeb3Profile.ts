import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

export function useWeb3Profile() {
  const { user, isConnected } = useUnifiedAuth()
  
  return {
    profile: user,
    isConnected
  }
}