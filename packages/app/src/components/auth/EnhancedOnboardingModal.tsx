'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/UnifiedAuthContext'

interface EnhancedOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: (choices: any) => void
}

export default function EnhancedOnboardingModal({ isOpen, onClose, onComplete }: EnhancedOnboardingModalProps) {
  const { user } = useAuth()
  const [onboardingManager, setOnboardingManager] = useState<any>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (isOpen && !isInitialized) {
      initializeOnboarding()
    }
  }, [isOpen, isInitialized])

  const initializeOnboarding = async () => {
    try {
      // Load the enhanced onboarding manager
      if (typeof window !== 'undefined') {
        // Dynamically import the onboarding manager
        const script = document.createElement('script')
        script.src = '/js/enhanced-onboarding-manager.js'
        script.onload = async () => {
          if (window.EnhancedOnboardingManager) {
            const manager = new window.EnhancedOnboardingManager()
            const shouldShow = await manager.initialize()
            
            if (shouldShow) {
              setOnboardingManager(manager)
              setIsInitialized(true)
              
              // Start the onboarding process
              await manager.startOnboarding()
              
              // Listen for completion
              window.addEventListener('enhanced-app-onboarding', handleOnboardingEvent)
            } else {
              // Already completed
              onClose()
            }
          }
        }
        document.head.appendChild(script)
      }
    } catch (error) {
      console.error('Failed to initialize enhanced onboarding:', error)
      onClose()
    }
  }

  const handleOnboardingEvent = (event: any) => {
    const { type, data } = event.detail
    
    switch (type) {
      case 'enhanced-complete':
        // Onboarding completed
        onComplete(data.userChoices)
        onClose()
        break
        
      case 'show-guidance':
        // Show first action guidance
        showFirstActionGuidance(data)
        break
        
      case 'update-recommendations':
        // Handle real-time recommendation updates
        console.log('Recommendations updated:', data)
        break
    }
  }

  const showFirstActionGuidance = (data: any) => {
    // The enhanced onboarding manager handles this automatically
    console.log('First action guidance shown:', data)
  }

  useEffect(() => {
    return () => {
      // Cleanup event listener
      if (typeof window !== 'undefined') {
        window.removeEventListener('enhanced-app-onboarding', handleOnboardingEvent)
      }
    }
  }, [])

  // The enhanced onboarding manager creates its own overlay
  // This component just manages the initialization
  if (!isOpen || !isInitialized) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* The enhanced onboarding manager will create its own UI */}
      <div className="absolute top-4 right-4 z-[21000]">
        <button
          onClick={() => {
            if (onboardingManager) {
              onboardingManager.skipOnboarding()
            }
            onClose()
          }}
          className="bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
          title="Skip onboarding"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// Extend window interface for TypeScript
declare global {
  interface Window {
    EnhancedOnboardingManager: any
    SponsorContentManager: any
    EnhancedCampaignManager: any
    EnhancedAnalyticsManager: any
  }
}