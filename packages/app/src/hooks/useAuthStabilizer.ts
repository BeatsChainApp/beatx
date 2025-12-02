'use client'

import { useRef, useEffect } from 'react'
import { useEnhancedToast } from './useToast.enhanced'

interface AuthStabilizerOptions {
  maxToastsPerMinute?: number
  cooldownMs?: number
}

export function useUnifiedAuthStabilizer(options: AuthStabilizerOptions = {}) {
  const { maxToastsPerMinute = 3, cooldownMs = 60000 } = options
  const { error } = useEnhancedToast()
  const toastHistory = useRef<number[]>([])
  const lastAuthError = useRef<string | null>(null)
  
  const showAuthError = (message: string) => {
    const now = Date.now()
    
    // Clean old entries
    toastHistory.current = toastHistory.current.filter(
      timestamp => now - timestamp < cooldownMs
    )
    
    // Check if we've hit the limit
    if (toastHistory.current.length >= maxToastsPerMinute) {
      console.warn('Auth error toast rate limit reached:', message)
      return
    }
    
    // Check if it's the same error as last time
    if (lastAuthError.current === message) {
      console.warn('Duplicate auth error suppressed:', message)
      return
    }
    
    // Show the error
    error(message, {
      throttleKey: 'auth-error',
      throttleMs: 30000, // 30 second throttle for auth errors
      once: true
    })
    
    // Track this toast
    toastHistory.current.push(now)
    lastAuthError.current = message
  }
  
  // Clear error history when component unmounts
  useEffect(() => {
    return () => {
      toastHistory.current = []
      lastAuthError.current = null
    }
  }, [])
  
  return { showAuthError }
}