'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

export interface Web3Profile {
  address: string
  displayName: string
  bio: string
  profileImage?: string
  email?: string
  socialLinks?: {
    twitter?: string
    instagram?: string
    website?: string
  }
  isVerified: boolean
  role: 'user' | 'producer' | 'admin'
  createdAt: Date
  updatedAt: Date
}

export interface ProfileSettings {
  emailNotifications: boolean
  marketingEmails: boolean
  twoFactorAuth: boolean
  publicProfile: boolean
}

export function useWeb3Profile() {
  const [profile, setProfile] = useState<Web3Profile | null>(null)
  const [settings, setSettings] = useState<ProfileSettings>({
    emailNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    publicProfile: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { address, isConnected } = useAccount()

  useEffect(() => {
    if (typeof window === 'undefined') {
      setLoading(false)
      return
    }
    
    if (isConnected && address) {
      loadProfile()
    } else {
      setProfile(null)
      setLoading(false)
    }
  }, [address, isConnected])

  const loadProfile = async () => {
    if (!address || typeof window === 'undefined') return

    try {
      setLoading(true)
      setError(null)

      // Try to load from localStorage
      const stored = localStorage.getItem(`web3_profile_${address}`)
      if (stored) {
        const profileData = JSON.parse(stored)
        setProfile({
          ...profileData,
          createdAt: new Date(profileData.createdAt),
          updatedAt: new Date(profileData.updatedAt)
        })
      } else {
        // Create default profile for new users
        const defaultProfile: Web3Profile = {
          address,
          displayName: `User ${address.slice(0, 6)}...${address.slice(-4)}`,
          bio: '',
          isVerified: false,
          role: 'user',
          createdAt: new Date(),
          updatedAt: new Date()
        }
        setProfile(defaultProfile)
      }

      // Load settings
      const storedSettings = localStorage.getItem(`web3_settings_${address}`)
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings))
      }

    } catch (err: any) {
      console.error('Failed to load profile:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Web3Profile>): Promise<boolean> => {
    if (!address || !profile) return false

    try {
      setSaving(true)
      setError(null)

      const updatedProfile = {
        ...profile,
        ...updates,
        updatedAt: new Date()
      }

      // Save to localStorage
      localStorage.setItem(`web3_profile_${address}`, JSON.stringify(updatedProfile))
      setProfile(updatedProfile)
      
      // Sync to MCP server
      try {
        await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'}/api/profiles/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, profile: updatedProfile })
        })
      } catch (syncError) {
        console.warn('Profile sync failed:', syncError)
      }
      
      return true

    } catch (err: any) {
      console.error('Failed to update profile:', err)
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const updateSettings = async (newSettings: Partial<ProfileSettings>): Promise<boolean> => {
    if (!address) return false

    try {
      const updatedSettings = { ...settings, ...newSettings }
      localStorage.setItem(`web3_settings_${address}`, JSON.stringify(updatedSettings))
      setSettings(updatedSettings)
      return true
    } catch (err: any) {
      console.error('Failed to update settings:', err)
      setError(err.message)
      return false
    }
  }

  const uploadProfileImage = async (file: File): Promise<string | null> => {
    if (!address) return null

    try {
      setSaving(true)
      setError(null)

      // Convert file to base64 for localStorage storage
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      
      await updateProfile({ profileImage: base64 })
      return base64
    } catch (err: any) {
      console.error('Failed to upload profile image:', err)
      setError(err.message)
      return null
    } finally {
      setSaving(false)
    }
  }

  const removeProfileImage = async (): Promise<boolean> => {
    return await updateProfile({ profileImage: undefined })
  }

  // Get profile by address (for viewing other users)
  const getProfileByAddress = async (userAddress: string): Promise<Web3Profile | null> => {
    try {
      const stored = localStorage.getItem(`web3_profile_${userAddress}`)
      if (stored) {
        const profileData = JSON.parse(stored)
        return {
          ...profileData,
          createdAt: new Date(profileData.createdAt),
          updatedAt: new Date(profileData.updatedAt)
        }
      }
      return null
    } catch (error) {
      console.error('Failed to get profile:', error)
      return null
    }
  }

  return {
    profile,
    settings,
    loading,
    saving,
    error,
    updateProfile,
    updateSettings,
    uploadProfileImage,
    removeProfileImage,
    getProfileByAddress,
    isConnected: isConnected && !!address
  }
}