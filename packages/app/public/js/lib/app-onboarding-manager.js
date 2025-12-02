// App Onboarding Manager - Minimal version to prevent 404 errors
class AppOnboardingManager {
  constructor() {
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      // Check if user needs onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
      if (!hasCompletedOnboarding) {
        this.showWelcomeMessage()
      }
      
      this.initialized = true
    } catch (error) {
      console.warn('Onboarding manager initialization failed:', error)
    }
  }

  showWelcomeMessage() {
    // Simple welcome message for new users
    setTimeout(() => {
      if (!localStorage.getItem('welcome_shown')) {
        console.log('Welcome to BeatsChain! 🎵')
        localStorage.setItem('welcome_shown', 'true')
      }
    }, 2000)
  }

  completeOnboarding() {
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('onboarding_completed_at', new Date().toISOString())
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.AppOnboardingManager = new AppOnboardingManager()
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.AppOnboardingManager.initialize()
    })
  } else {
    window.AppOnboardingManager.initialize()
  }
}