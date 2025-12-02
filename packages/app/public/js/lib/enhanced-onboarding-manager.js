// Enhanced Onboarding Manager - Complete System
class EnhancedOnboardingManager {
  constructor() {
    this.currentStep = 0
    this.totalSteps = 6
    this.userData = {}
    this.sponsorData = {}
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      // Check if user needs onboarding
      const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
      if (!hasCompletedOnboarding) {
        this.loadUserData()
        this.initializeSponsorSystem()
      }
      
      this.initialized = true
      console.log('Enhanced Onboarding Manager initialized')
    } catch (error) {
      console.error('Onboarding manager initialization failed:', error)
    }
  }

  loadUserData() {
    try {
      const stored = localStorage.getItem('onboarding_user_data')
      if (stored) {
        this.userData = JSON.parse(stored)
      }
    } catch (error) {
      console.warn('Error loading user data:', error)
    }
  }

  saveUserData() {
    try {
      localStorage.setItem('onboarding_user_data', JSON.stringify(this.userData))
    } catch (error) {
      console.warn('Error saving user data:', error)
    }
  }

  initializeSponsorSystem() {
    this.sponsorData = {
      campaigns: [
        {
          id: 'welcome_campaign',
          name: 'Welcome to BeatsChain',
          type: 'onboarding',
          active: true,
          placements: ['step_1', 'step_6'],
          content: {
            title: 'Start Your Music Journey',
            description: 'Join thousands of producers and music lovers',
            cta: 'Get Started'
          }
        },
        {
          id: 'producer_tools',
          name: 'Producer Tools Spotlight',
          type: 'feature_highlight',
          active: true,
          placements: ['step_3', 'step_4'],
          content: {
            title: 'Professional Producer Tools',
            description: 'Upload, mint, and sell your beats as NFTs',
            cta: 'Learn More'
          }
        }
      ],
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0
      }
    }
  }

  // 6-Step Onboarding Process
  async startOnboarding() {
    this.currentStep = 1
    return this.renderStep(1)
  }

  async nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++
      return this.renderStep(this.currentStep)
    } else {
      return this.completeOnboarding()
    }
  }

  async renderStep(step) {
    const stepData = {
      1: {
        title: 'Welcome to BeatsChain',
        content: 'The future of music ownership starts here',
        type: 'welcome',
        sponsor: this.getSponsorContent('step_1')
      },
      2: {
        title: 'Connect Your Account',
        content: 'Choose how you want to sign in',
        type: 'account_setup',
        options: ['google', 'wallet']
      },
      3: {
        title: 'Choose Your Role',
        content: 'What brings you to BeatsChain?',
        type: 'role_selection',
        roles: ['producer', 'creator', 'music_lover'],
        sponsor: this.getSponsorContent('step_3')
      },
      4: {
        title: 'Set Up Your Profile',
        content: 'Tell us about yourself',
        type: 'profile_setup',
        sponsor: this.getSponsorContent('step_4')
      },
      5: {
        title: 'Explore Features',
        content: 'Discover what you can do',
        type: 'feature_tour',
        features: ['nft_minting', 'marketplace', 'analytics']
      },
      6: {
        title: 'You\'re Ready!',
        content: 'Welcome to the BeatsChain community',
        type: 'completion',
        sponsor: this.getSponsorContent('step_6')
      }
    }

    const currentStepData = stepData[step]
    this.trackAnalytics('step_view', { step, title: currentStepData.title })
    
    return currentStepData
  }

  getSponsorContent(placement) {
    const campaign = this.sponsorData.campaigns.find(c => 
      c.active && c.placements.includes(placement)
    )
    
    if (campaign) {
      this.sponsorData.analytics.impressions++
      return campaign.content
    }
    
    return null
  }

  async setUserRole(role) {
    this.userData.role = role
    this.userData.selectedAt = new Date().toISOString()
    this.saveUserData()
    
    // Role-specific onboarding paths
    const rolePaths = {
      producer: {
        features: ['upload_beats', 'nft_minting', 'analytics_dashboard'],
        nextSteps: ['upload_first_beat', 'setup_profile', 'explore_marketplace']
      },
      creator: {
        features: ['license_beats', 'content_creation', 'collaboration'],
        nextSteps: ['browse_beats', 'setup_profile', 'create_content']
      },
      music_lover: {
        features: ['discover_beats', 'collect_nfts', 'support_artists'],
        nextSteps: ['explore_marketplace', 'setup_profile', 'follow_artists']
      }
    }
    
    this.userData.rolePath = rolePaths[role] || rolePaths.music_lover
    this.saveUserData()
    
    return this.userData.rolePath
  }

  async setupProfile(profileData) {
    this.userData.profile = {
      ...profileData,
      createdAt: new Date().toISOString(),
      isComplete: true
    }
    this.saveUserData()
    
    return this.userData.profile
  }

  async completeOnboarding() {
    const completionData = {
      completedAt: new Date().toISOString(),
      totalSteps: this.totalSteps,
      userData: this.userData,
      sponsorAnalytics: this.sponsorData.analytics
    }
    
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('onboarding_completion_data', JSON.stringify(completionData))
    
    // Track completion analytics
    this.trackAnalytics('onboarding_complete', completionData)
    
    // Trigger completion event
    window.dispatchEvent(new CustomEvent('onboarding-complete', { 
      detail: completionData 
    }))
    
    return completionData
  }

  trackAnalytics(event, data) {
    const analyticsData = {
      event,
      timestamp: new Date().toISOString(),
      data,
      sessionId: this.getSessionId()
    }
    
    // Store analytics
    const analytics = JSON.parse(localStorage.getItem('onboarding_analytics') || '[]')
    analytics.push(analyticsData)
    localStorage.setItem('onboarding_analytics', JSON.stringify(analytics))
    
    console.log('Onboarding Analytics:', analyticsData)
  }

  getSessionId() {
    let sessionId = localStorage.getItem('onboarding_session_id')
    if (!sessionId) {
      sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      localStorage.setItem('onboarding_session_id', sessionId)
    }
    return sessionId
  }

  // Campaign Management
  createCampaign(campaignData) {
    const campaign = {
      id: 'campaign_' + Date.now(),
      ...campaignData,
      createdAt: new Date().toISOString(),
      active: true
    }
    
    this.sponsorData.campaigns.push(campaign)
    return campaign
  }

  // Data Pipeline Integration
  syncWithDataPipeline() {
    const pipelineData = {
      onboardingData: this.userData,
      sponsorMetrics: this.sponsorData.analytics,
      completionStatus: localStorage.getItem('onboarding_completed'),
      analytics: JSON.parse(localStorage.getItem('onboarding_analytics') || '[]')
    }
    
    // This would sync with external data pipeline
    console.log('Syncing with data pipeline:', pipelineData)
    return pipelineData
  }

  // Reset for testing
  reset() {
    localStorage.removeItem('onboarding_completed')
    localStorage.removeItem('onboarding_user_data')
    localStorage.removeItem('onboarding_completion_data')
    localStorage.removeItem('onboarding_analytics')
    localStorage.removeItem('onboarding_session_id')
    
    this.currentStep = 0
    this.userData = {}
    this.sponsorData = {}
    
    console.log('Onboarding system reset')
  }
}

// Initialize when DOM is ready
if (typeof window !== 'undefined') {
  window.EnhancedOnboardingManager = new EnhancedOnboardingManager()
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      window.EnhancedOnboardingManager.initialize()
    })
  } else {
    window.EnhancedOnboardingManager.initialize()
  }
}