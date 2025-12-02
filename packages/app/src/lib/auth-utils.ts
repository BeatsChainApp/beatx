'use client'

import React from 'react'

// Authentication utilities to prevent hydration mismatches
export function isClientSide(): boolean {
  return typeof window !== 'undefined'
}

export function safeLocalStorage() {
  if (!isClientSide()) {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    }
  }
  return localStorage
}

export function getStoredAuth() {
  if (!isClientSide()) return null
  
  try {
    return safeLocalStorage().getItem('google_auth_result')
  } catch {
    return null
  }
}

export function clearAuthData() {
  if (!isClientSide()) return
  
  try {
    const storage = safeLocalStorage()
    storage.removeItem('google_auth_result')
    
    // Clear all Google profiles
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('web3_profile_google_')) {
        storage.removeItem(key)
      }
    })
  } catch (error) {
    console.warn('Error clearing auth data:', error)
  }
}

export function isAdminEmail(email: string): boolean {
  const adminEmails = [
    'info@unamifoundation.org',
    'admin@beatschain.app',
    'support@beatschain.app'
  ]
  
  return adminEmails.some(adminEmail => 
    adminEmail.toLowerCase() === email.toLowerCase()
  )
}

// Prevent React hydration errors by ensuring consistent state
export function useHydrationSafeState<T>(initialValue: T, clientValue?: T) {
  const [isHydrated, setIsHydrated] = React.useState(false)
  
  React.useEffect(() => {
    setIsHydrated(true)
  }, [])
  
  return isHydrated ? (clientValue ?? initialValue) : initialValue
}