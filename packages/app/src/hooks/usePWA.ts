'use client'

import { useState, useEffect } from 'react'

interface PWAState {
  isInstallable: boolean
  isInstalled: boolean
  isOnline: boolean
  showInstallPrompt: boolean
}

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isOnline: true,
    showInstallPrompt: false
  })
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true

    // Check online status
    const isOnline = navigator.onLine

    setState(prev => ({ ...prev, isInstalled, isOnline }))

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setState(prev => ({ ...prev, isInstallable: true }))
      
      // Show install prompt after user interaction, but respect dismissal and mobile viewport
      const dismissed = localStorage.getItem('pwa_install_dismissed')
      const dismissedTime = dismissed ? parseInt(dismissed) : 0
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
      
      // Only show if not dismissed recently (7 days) and not on very small screens
      if (daysSinceDismissed > 7 && window.innerWidth > 320) {
        setTimeout(() => {
          setState(prev => ({ ...prev, showInstallPrompt: true }))
        }, 8000) // Increased delay for better UX
      }
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setState(prev => ({ ...prev, isInstalled: true, isInstallable: false, showInstallPrompt: false }))
      setDeferredPrompt(null)
    }

    // Listen for online/offline
    const handleOnline = () => setState(prev => ({ ...prev, isOnline: true }))
    const handleOffline = () => setState(prev => ({ ...prev, isOnline: false }))

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const installApp = async () => {
    if (!deferredPrompt) return false

    try {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setState(prev => ({ ...prev, showInstallPrompt: false }))
        return true
      }
      return false
    } catch (error) {
      console.error('Install failed:', error)
      return false
    }
  }

  const dismissInstallPrompt = () => {
    setState(prev => ({ ...prev, showInstallPrompt: false }))
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
    
    // Also dismiss for this session to prevent re-showing
    sessionStorage.setItem('pwa_dismissed_this_session', 'true')
  }

  return {
    ...state,
    installApp,
    dismissInstallPrompt
  }
}