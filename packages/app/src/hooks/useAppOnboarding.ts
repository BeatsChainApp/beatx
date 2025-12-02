'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface OnboardingState {
  isOpen: boolean
  completed: boolean
  progress: number
  currentStep: number
  userChoices: Record<string, any>
}

interface OnboardingManager {
  initialize: () => Promise<boolean>
  startOnboarding: () => Promise<void>
  handleStepCompletion: (stepName: string, stepData: any) => Promise<void>
  completeOnboarding: () => Promise<void>
  getOnboardingProgress: () => any
  resetOnboarding: () => void
}

export function useAppOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isOpen: false,
    completed: false,
    progress: 0,
    currentStep: 0,
    userChoices: {}
  })
  
  const [manager, setManager] = useState<OnboardingManager | null>(null)
  const { user } = useUnifiedAuth()

  // Initialize onboarding manager
  useEffect(() => {
    const initializeManager = async () => {
      // Load the onboarding manager script
      if (typeof window !== 'undefined' && !window.AppOnboardingManager) {
        const script = document.createElement('script')
        script.src = '/lib/app-onboarding-manager.js'
        script.onload = async () => {
          if (window.AppOnboardingManager) {
            const onboardingManager = new window.AppOnboardingManager()
            const shouldStart = await onboardingManager.initialize()
            
            setManager(onboardingManager)
            
            // Update state from stored progress
            const progress = onboardingManager.getOnboardingProgress()
            setState(prev => ({
              ...prev,
              completed: progress.completed,
              progress: progress.progress,
              userChoices: progress.choices
            }))

            // Auto-start onboarding for new users
            if (shouldStart && !progress.completed) {
              setState(prev => ({ ...prev, isOpen: true }))
            }
          }
        }
        document.head.appendChild(script)
      } else if (window.AppOnboardingManager) {
        const onboardingManager = new window.AppOnboardingManager()
        const shouldStart = await onboardingManager.initialize()
        
        setManager(onboardingManager)
        
        const progress = onboardingManager.getOnboardingProgress()
        setState(prev => ({
          ...prev,
          completed: progress.completed,
          progress: progress.progress,
          userChoices: progress.choices
        }))

        if (shouldStart && !progress.completed) {
          setState(prev => ({ ...prev, isOpen: true }))
        }
      }
    }

    initializeManager()
  }, [])

  // Listen for onboarding events
  useEffect(() => {
    const handleOnboardingEvent = (event: CustomEvent) => {
      const { type, data } = event.detail

      switch (type) {
        case 'start':
          setState(prev => ({ ...prev, isOpen: true }))
          break
        case 'show-guidance':
          // Handle first action guidance
          console.log('Onboarding guidance:', data)
          break
        case 'update-recommendations':
          // Handle real-time recommendations
          console.log('Onboarding recommendations:', data)
          break
      }
    }

    window.addEventListener('app-onboarding', handleOnboardingEvent as EventListener)
    
    return () => {
      window.removeEventListener('app-onboarding', handleOnboardingEvent as EventListener)
    }
  }, [])

  const startOnboarding = useCallback(async () => {
    if (manager) {
      await manager.startOnboarding()
      setState(prev => ({ ...prev, isOpen: true }))
    }
  }, [manager])

  const completeStep = useCallback(async (stepName: string, stepData: any) => {
    if (manager) {
      await manager.handleStepCompletion(stepName, stepData)
      
      // Update local state
      const progress = manager.getOnboardingProgress()
      setState(prev => ({
        ...prev,
        progress: progress.progress,
        userChoices: { ...prev.userChoices, ...stepData }
      }))
    }
  }, [manager])

  const completeOnboarding = useCallback(async () => {
    if (manager) {
      await manager.completeOnboarding()
      setState(prev => ({
        ...prev,
        isOpen: false,
        completed: true,
        progress: 1
      }))
    }
  }, [manager])

  const closeOnboarding = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }))
  }, [])

  const resetOnboarding = useCallback(() => {
    if (manager) {
      manager.resetOnboarding()
      setState({
        isOpen: false,
        completed: false,
        progress: 0,
        currentStep: 0,
        userChoices: {}
      })
    }
  }, [manager])

  // Check if user should see onboarding
  const shouldShowOnboarding = useCallback(() => {
    // Don't show if already completed
    if (state.completed) return false
    
    // Don't show if user explicitly dismissed
    const dismissed = localStorage.getItem('beatx_onboarding_dismissed')
    if (dismissed === 'true') return false
    
    // Show for new users or users who haven't completed
    return true
  }, [state.completed])

  // Get personalized recommendations
  const getRecommendations = useCallback(() => {
    const stored = localStorage.getItem('beatx_ai_recommendations')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('Failed to parse recommendations:', error)
      }
    }
    return null
  }, [])

  // Get user preferences from onboarding
  const getUserPreferences = useCallback(() => {
    const stored = localStorage.getItem('beatx_user_preferences')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (error) {
        console.warn('Failed to parse preferences:', error)
      }
    }
    return null
  }, [])

  return {
    // State
    isOpen: state.isOpen,
    completed: state.completed,
    progress: state.progress,
    currentStep: state.currentStep,
    userChoices: state.userChoices,
    
    // Actions
    startOnboarding,
    completeStep,
    completeOnboarding,
    closeOnboarding,
    resetOnboarding,
    
    // Utilities
    shouldShowOnboarding,
    getRecommendations,
    getUserPreferences,
    
    // Manager instance (for advanced usage)
    manager
  }
}

// Type declarations for global window object
declare global {
  interface Window {
    AppOnboardingManager: any
  }
}