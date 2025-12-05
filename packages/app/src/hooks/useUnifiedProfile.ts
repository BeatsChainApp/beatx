'use client'

import { useState, useEffect, useCallback } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface UnifiedProfile {
  user_id: string
  email?: string
  wallet_address?: string
  google_id?: string
  whatsapp_id?: string
  display_name: string
  profile_image?: string
  bio: string
  app_role: string
  extension_role: string
  is_verified: boolean
  email_verified: boolean
  wallet_verified: boolean
  platforms: {
    app: { active: boolean; preferences: any }
    extension: { active: boolean; preferences: any }
    whatsapp: { active: boolean; profile: any }
  }
  created_at: string
  updated_at: string
  last_sync: string
}

interface UseUnifiedProfileReturn {
  profile: UnifiedProfile | null
  loading: boolean
  error: string | null
  
  // Actions
  updateProfile: (updates: Partial<UnifiedProfile>) => Promise<boolean>
  syncProfile: () => Promise<boolean>
  addWallet: (walletAddress: string, platform: string) => Promise<boolean>
  
  // Status
  isProfileComplete: boolean
  syncStatus: 'idle' | 'syncing' | 'success' | 'error'
}

export function useUnifiedProfile(): UseUnifiedProfileReturn {
  const [profile, setProfile] = useState<UnifiedProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')
  
  const account = useActiveAccount()
  const address = account?.address
  const { user, isAuthenticated } = useUnifiedAuth()

  const getMcpUrl = () => {
    return process.env.NEXT_PUBLIC_MCP_SERVER_URL || 
           'https://beatschain-mcp-server-production.up.railway.app'
  }

  const authenticateUser = useCallback(async () => {
    // PRIORITY: Allow authentication with email even without wallet
    if (!isAuthenticated) {
      setProfile(null)
      setLoading(false)
      return
    }
    
    // Continue if user exists (email auth) even without wallet
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get Google auth data if available
      let googleData = null
      try {
        const googleAuth = localStorage.getItem('google_auth_result')
        if (googleAuth) {
          googleData = JSON.parse(googleAuth)
        }
      } catch (e) {
        // Ignore parsing errors
      }

      const userData = {
        email: user.email || googleData?.email,
        wallet_address: address || null, // Allow null wallet
        google_id: googleData?.sub,
        display_name: user.displayName || googleData?.name,
        profile_image: user.profileImage || googleData?.picture,
        verified_email: googleData?.verified_email || user.isVerified,
        app_role: user.role?.toUpperCase(),
        platform: 'app',
        auth_method: googleData ? 'google' : (address ? 'wallet' : 'email') // Support email-only auth
      }

      const response = await fetch(`${getMcpUrl()}/api/profiles/authenticate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.profile) {
        setProfile(result.profile)
        
        // Store profile locally for offline access
        localStorage.setItem(`unified_profile_${result.profile.user_id}`, JSON.stringify(result.profile))
      } else {
        throw new Error(result.error || 'Authentication failed')
      }
    } catch (err) {
      console.error('Profile authentication error:', err)
      setError(err instanceof Error ? err.message : 'Authentication failed')
      
      // Try to load from local storage as fallback
      try {
        const localProfile = localStorage.getItem(`unified_profile_${user?.address}`)
        if (localProfile) {
          setProfile(JSON.parse(localProfile))
        }
      } catch (e) {
        // Ignore local storage errors
      }
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user, address])

  const updateProfile = useCallback(async (updates: Partial<UnifiedProfile>): Promise<boolean> => {
    if (!profile) return false

    try {
      setSyncStatus('syncing')
      
      const response = await fetch(`${getMcpUrl()}/api/profiles/${profile.user_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...updates,
          platform: 'app'
        })
      })

      if (!response.ok) {
        throw new Error(`Update failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success && result.profile) {
        setProfile(result.profile)
        
        // Update local storage
        localStorage.setItem(`unified_profile_${result.profile.user_id}`, JSON.stringify(result.profile))
        
        setSyncStatus('success')
        return true
      } else {
        throw new Error(result.error || 'Update failed')
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError(err instanceof Error ? err.message : 'Update failed')
      setSyncStatus('error')
      return false
    }
  }, [profile])

  const syncProfile = useCallback(async (): Promise<boolean> => {
    if (!profile) return false

    try {
      setSyncStatus('syncing')
      
      const response = await fetch(`${getMcpUrl()}/api/profiles/${profile.user_id}/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform: 'app'
        })
      })

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setSyncStatus('success')
        
        // Refresh profile after sync
        setTimeout(() => {
          authenticateUser()
        }, 1000)
        
        return true
      } else {
        throw new Error(result.error || 'Sync failed')
      }
    } catch (err) {
      console.error('Profile sync error:', err)
      setError(err instanceof Error ? err.message : 'Sync failed')
      setSyncStatus('error')
      return false
    }
  }, [profile, authenticateUser])

  const addWallet = useCallback(async (walletAddress: string, platform: string): Promise<boolean> => {
    if (!profile) return false

    try {
      const response = await fetch(`${getMcpUrl()}/api/profiles/${profile.user_id}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          platform,
          wallet_address: walletAddress,
          wallet_type: 'connected',
          is_primary: !profile.wallet_address // Set as primary if no existing wallet
        })
      })

      if (!response.ok) {
        throw new Error(`Add wallet failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh profile to get updated wallet info
        await authenticateUser()
        return true
      } else {
        throw new Error(result.error || 'Add wallet failed')
      }
    } catch (err) {
      console.error('Add wallet error:', err)
      setError(err instanceof Error ? err.message : 'Add wallet failed')
      return false
    }
  }, [profile, authenticateUser])

  // Calculate if profile is complete
  const isProfileComplete = profile ? !!(
    profile.display_name &&
    profile.email &&
    (profile.wallet_address || profile.google_id) &&
    profile.is_verified
  ) : false

  // Initialize profile on mount and when auth changes
  useEffect(() => {
    authenticateUser()
  }, [authenticateUser])

  // Auto-sync profile periodically
  useEffect(() => {
    if (!profile) return

    const syncInterval = setInterval(() => {
      if (syncStatus === 'idle') {
        syncProfile()
      }
    }, 5 * 60 * 1000) // Sync every 5 minutes

    return () => clearInterval(syncInterval)
  }, [profile, syncStatus, syncProfile])

  // Reset sync status after success/error
  useEffect(() => {
    if (syncStatus === 'success' || syncStatus === 'error') {
      const timer = setTimeout(() => {
        setSyncStatus('idle')
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [syncStatus])

  return {
    profile,
    loading,
    error,
    updateProfile,
    syncProfile,
    addWallet,
    isProfileComplete,
    syncStatus
  }
}