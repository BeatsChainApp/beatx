'use client'

import React, { createContext, useContext, useEffect } from 'react'
import { useAppOnboarding } from '@/hooks/useAppOnboarding'
import AppOnboardingModal from '@/components/auth/AppOnboardingModal'

interface OnboardingContextType {
  isOpen: boolean
  completed: boolean
  progress: number
  userChoices: Record<string, any>
  startOnboarding: () => Promise<void>
  completeStep: (stepName: string, stepData: any) => Promise<void>
  completeOnboarding: () => Promise<void>
  closeOnboarding: () => void
  resetOnboarding: () => void
  shouldShowOnboarding: () => boolean
  getRecommendations: () => any
  getUserPreferences: () => any
}

const OnboardingContext = createContext<OnboardingContextType | null>(null)

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider')
  }
  return context
}

interface OnboardingProviderProps {
  children: React.ReactNode
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const onboarding = useAppOnboarding()

  // Auto-trigger onboarding for new users
  useEffect(() => {
    const checkAutoStart = () => {
      // Check if this is a new user (no previous onboarding data) - check both keys
      const hasCompletedOnboarding = localStorage.getItem('beatx_onboarding_completed') || localStorage.getItem('onboarding_completed')
      const hasUserPreferences = localStorage.getItem('beatx_user_preferences')
      
      // If no onboarding data exists and user should see onboarding
      if (!hasCompletedOnboarding && !hasUserPreferences && onboarding.shouldShowOnboarding()) {
        // Delay to ensure page is loaded
        setTimeout(() => {
          onboarding.startOnboarding()
        }, 2000)
      }
    }

    // Only run on client side
    if (typeof window !== 'undefined') {
      checkAutoStart()
    }
  }, [onboarding])

  // Provide context value
  const contextValue: OnboardingContextType = {
    isOpen: onboarding.isOpen,
    completed: onboarding.completed,
    progress: onboarding.progress,
    userChoices: onboarding.userChoices,
    startOnboarding: onboarding.startOnboarding,
    completeStep: onboarding.completeStep,
    completeOnboarding: onboarding.completeOnboarding,
    closeOnboarding: onboarding.closeOnboarding,
    resetOnboarding: onboarding.resetOnboarding,
    shouldShowOnboarding: onboarding.shouldShowOnboarding,
    getRecommendations: onboarding.getRecommendations,
    getUserPreferences: onboarding.getUserPreferences
  }

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
      
      {/* Render onboarding modal */}
      <AppOnboardingModal
        isOpen={onboarding.isOpen}
        onClose={onboarding.closeOnboarding}
      />
    </OnboardingContext.Provider>
  )
}