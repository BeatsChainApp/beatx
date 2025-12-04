'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"

export interface AdminConfig {
  adminWallets: string[]
  setupComplete: boolean
  createdAt: Date
}

export function useAdminSetup() {
  const [config, setConfig] = useState<AdminConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    loadAdminConfig()
  }, [])

  const loadAdminConfig = () => {
    try {
      const stored = localStorage.getItem('admin_config')
      if (stored) {
        const parsedConfig = JSON.parse(stored)
        setConfig({
          ...parsedConfig,
          createdAt: new Date(parsedConfig.createdAt)
        })
      }
    } catch (error) {
      console.warn('Failed to load admin config:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupAdmin = (walletAddress: string): boolean => {
    try {
      const newConfig: AdminConfig = {
        adminWallets: [walletAddress.toLowerCase()],
        setupComplete: true,
        createdAt: new Date()
      }
      
      localStorage.setItem('admin_config', JSON.stringify(newConfig))
      setConfig(newConfig)
      
      // Create admin profile
      const adminProfile = {
        address: walletAddress,
        displayName: 'Admin User',
        bio: 'Platform administrator',
        isVerified: true,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      localStorage.setItem(`web3_profile_${walletAddress.toLowerCase()}`, JSON.stringify(adminProfile))
      
      return true
    } catch (error) {
      console.error('Failed to setup admin:', error)
      return false
    }
  }

  const addAdmin = (walletAddress: string): boolean => {
    if (!config || !isAdmin(address)) return false
    
    try {
      const updatedConfig = {
        ...config,
        adminWallets: [...config.adminWallets, walletAddress.toLowerCase()]
      }
      
      localStorage.setItem('admin_config', JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      return true
    } catch (error) {
      console.error('Failed to add admin:', error)
      return false
    }
  }

  const removeAdmin = (walletAddress: string): boolean => {
    if (!config || !isAdmin(address) || config.adminWallets.length <= 1) return false
    
    try {
      const updatedConfig = {
        ...config,
        adminWallets: config.adminWallets.filter(addr => addr !== walletAddress.toLowerCase())
      }
      
      localStorage.setItem('admin_config', JSON.stringify(updatedConfig))
      setConfig(updatedConfig)
      return true
    } catch (error) {
      console.error('Failed to remove admin:', error)
      return false
    }
  }

  const isAdmin = (walletAddress?: string): boolean => {
    if (!config || !walletAddress) return false
    return config.adminWallets.includes(walletAddress.toLowerCase())
  }

  const isSetupComplete = (): boolean => {
    return config?.setupComplete || false
  }

  const needsSetup = (): boolean => {
    return !loading && !config?.setupComplete
  }

  return {
    config,
    loading,
    setupAdmin,
    addAdmin,
    removeAdmin,
    isAdmin,
    isSetupComplete,
    needsSetup,
    currentUserIsAdmin: isAdmin(address)
  }
}