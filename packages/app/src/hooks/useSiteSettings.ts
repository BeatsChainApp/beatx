'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { getSiteSettings as getSanitySiteSettings } from '@/lib/sanity'

export interface SiteSettings {
  platformName: string
  platformDescription: string
  platformFee: number
  featuredGenres: string[]
  maxUploadSize: number
  allowedFileTypes: string[]
  socialLinks: {
    twitter?: string
    instagram?: string
    discord?: string
    telegram?: string
  }
  contactEmail: string
  supportEmail: string
  maintenanceMode: boolean
  registrationOpen: boolean
  minimumPrice: number
  maximumPrice: number
  defaultRoyalty: number
}

const DEFAULT_SETTINGS: SiteSettings = {
  platformName: 'BeatsChain',
  platformDescription: 'Decentralized marketplace for music producers and artists',
  platformFee: 15,
  featuredGenres: ['Hip Hop', 'Trap', 'R&B', 'Afrobeats', 'House', 'Amapiano'],
  maxUploadSize: 50, // MB
  allowedFileTypes: ['mp3', 'wav', 'flac'],
  socialLinks: {
    twitter: 'https://twitter.com/beatschain',
    instagram: 'https://instagram.com/beatschain',
    discord: 'https://discord.gg/beatschain'
  },
  contactEmail: 'hello@beatschain.app',
  supportEmail: 'support@beatschain.app',
  maintenanceMode: false,
  registrationOpen: true,
  minimumPrice: 0.001, // ETH
  maximumPrice: 10.0, // ETH
  defaultRoyalty: 5 // %
}

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const account = useActiveAccount()
  const address = account?.address

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      // First try to load from Sanity
      const sanitySiteSettings = await getSanitySiteSettings()
      
      // Then load from localStorage
      const stored = localStorage.getItem('site_settings')
      let localSettings = {}
      if (stored) {
        localSettings = JSON.parse(stored)
      }
      
      // Merge settings with priority to local settings
      const mergedSettings = { 
        ...DEFAULT_SETTINGS, 
        ...sanitySiteSettings, 
        ...localSettings,
        // IMPORTANT: Always enforce 15% platform fee to match smart contract
        platformFee: 15 
      }
      
      setSettings(mergedSettings)
    } catch (err: any) {
      console.error('Failed to load site settings:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<SiteSettings>): Promise<boolean> => {
    try {
      setSaving(true)
      setError(null)

      // Ensure platform fee is always 15% to match smart contract
      const updatedSettings = { 
        ...settings, 
        ...updates,
        platformFee: 15 
      }
      
      // Save to localStorage (temporary storage)
      localStorage.setItem('site_settings', JSON.stringify(updatedSettings))
      
      setSettings(updatedSettings)
      return true
    } catch (err: any) {
      console.error('Failed to update site settings:', err)
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const resetToDefaults = async (): Promise<boolean> => {
    try {
      setSaving(true)
      localStorage.removeItem('site_settings')
      setSettings(DEFAULT_SETTINGS)
      return true
    } catch (err: any) {
      console.error('Failed to reset settings:', err)
      setError(err.message)
      return false
    } finally {
      setSaving(false)
    }
  }

  const addFeaturedGenre = async (genre: string): Promise<boolean> => {
    if (settings.featuredGenres.includes(genre)) return false
    
    return await updateSettings({
      featuredGenres: [...settings.featuredGenres, genre]
    })
  }

  const removeFeaturedGenre = async (genre: string): Promise<boolean> => {
    return await updateSettings({
      featuredGenres: settings.featuredGenres.filter(g => g !== genre)
    })
  }

  const updateSocialLink = async (platform: keyof SiteSettings['socialLinks'], url: string): Promise<boolean> => {
    return await updateSettings({
      socialLinks: {
        ...settings.socialLinks,
        [platform]: url
      }
    })
  }

  const toggleMaintenanceMode = async (): Promise<boolean> => {
    return await updateSettings({
      maintenanceMode: !settings.maintenanceMode
    })
  }

  const toggleRegistration = async (): Promise<boolean> => {
    return await updateSettings({
      registrationOpen: !settings.registrationOpen
    })
  }

  // Validation helpers
  const validateSettings = (settingsToValidate: Partial<SiteSettings>): string[] => {
    const errors: string[] = []

    if (settingsToValidate.platformFee !== undefined) {
      if (settingsToValidate.platformFee < 0 || settingsToValidate.platformFee > 15) {
        errors.push('Platform fee must be between 0% and 15%')
      }
    }

    if (settingsToValidate.minimumPrice !== undefined) {
      if (settingsToValidate.minimumPrice < 0) {
        errors.push('Minimum price cannot be negative')
      }
    }

    if (settingsToValidate.maximumPrice !== undefined) {
      if (settingsToValidate.maximumPrice < (settingsToValidate.minimumPrice || settings.minimumPrice)) {
        errors.push('Maximum price must be greater than minimum price')
      }
    }

    if (settingsToValidate.defaultRoyalty !== undefined) {
      if (settingsToValidate.defaultRoyalty < 0 || settingsToValidate.defaultRoyalty > 50) {
        errors.push('Default royalty must be between 0% and 50%')
      }
    }

    return errors
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    resetToDefaults,
    addFeaturedGenre,
    removeFeaturedGenre,
    updateSocialLink,
    toggleMaintenanceMode,
    toggleRegistration,
    validateSettings,
    isValidEmail,
    isValidUrl,
    canEdit: address && settings.registrationOpen // Only allow editing if user is connected
  }
}