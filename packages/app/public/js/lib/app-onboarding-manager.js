// Comprehensive App Onboarding Manager - Full System Integration
class AppOnboardingManager {
  constructor() {
    this.currentStep = 0
    this.totalSteps = 6
    this.userData = {}
    this.sponsorData = {}
    this.campaignManager = null
    this.analyticsManager = null
    this.initialized = false
    this.onboardingActive = false
  }

  async initialize() {
    if (this.initialized) return
    
    try {
      // Initialize comprehensive onboarding system
      await this.loadUserData()
      await this.initializeSponsorSystem()
      await this.initializeCampaignManager()
      await this.initializeAnalytics()
      await this.checkOnboardingStatus()
      
      this.initialized = true
      console.log('🚀 Comprehensive App Onboarding Manager initialized')
      
      // Auto-start onboarding for new users
      if (this.shouldStartOnboarding()) {
        await this.startOnboarding()
      }
    } catch (error) {
      console.error('Onboarding manager initialization failed:', error)
    }
  }

  async loadUserData() {
    try {
      const stored = localStorage.getItem('onboarding_user_data')
      if (stored) {
        this.userData = JSON.parse(stored)
      } else {
        // Initialize new user data
        this.userData = {
          id: 'user_' + Date.now(),
          startedAt: new Date().toISOString(),
          role: null,
          profile: {},
          preferences: {},
          journey: []
        }
        this.saveUserData()
      }
    } catch (error) {
      console.warn('Error loading user data:', error)
      this.userData = { id: 'user_' + Date.now(), startedAt: new Date().toISOString() }
    }
  }

  saveUserData() {
    try {
      localStorage.setItem('onboarding_user_data', JSON.stringify(this.userData))
    } catch (error) {
      console.warn('Error saving user data:', error)
    }
  }

  async initializeSponsorSystem() {
    // Ensure analytics manager is initialized first
    if (!this.analyticsManager) {
      await this.initializeAnalytics()
    }
    
    this.sponsorData = {
      campaigns: [
        {
          id: 'welcome_campaign_2024',
          name: 'BeatsChain Welcome Experience',
          type: 'onboarding_flow',
          active: true,
          priority: 'high',
          placements: ['step_1', 'step_3', 'step_6'],
          targeting: {
            newUsers: true,
            roles: ['all'],
            demographics: ['music_producers', 'content_creators', 'music_lovers']
          },
          content: {
            step_1: {
              title: 'Welcome to the Future of Music',
              description: 'Join thousands of creators earning from their beats',
              cta: 'Start Your Journey',
              visual: 'gradient_hero',
              revenue: 1.25
            },
            step_3: {
              title: 'Professional Producer Tools',
              description: 'Upload, mint, and monetize your beats with ISRC codes',
              cta: 'Explore Tools',
              visual: 'producer_dashboard',
              revenue: 2.50
            },
            step_6: {
              title: 'Congratulations! You\'re Ready',
              description: 'Start earning with your first beat upload',
              cta: 'Upload First Beat',
              visual: 'success_celebration',
              revenue: 1.75
            }
          }
        },
        {
          id: 'role_specific_campaign',
          name: 'Role-Based Feature Highlights',
          type: 'feature_discovery',
          active: true,
          priority: 'medium',
          placements: ['step_4', 'step_5'],
          targeting: {
            roles: ['producer', 'creator'],
            experience: 'new'
          },
          content: {
            producer: {
              title: 'Producer Powerhouse Features',
              description: 'Advanced analytics, royalty tracking, and NFT minting',
              features: ['ISRC Generation', 'Royalty Analytics', 'NFT Minting', 'Marketplace Integration'],
              revenue: 3.00
            },
            creator: {
              title: 'Content Creator Suite',
              description: 'License beats, create content, collaborate with producers',
              features: ['Beat Licensing', 'Content Tools', 'Collaboration Hub', 'Revenue Sharing'],
              revenue: 2.25
            }
          }
        },
        {
          id: 'professional_services_upsell',
          name: 'Professional Services Promotion',
          type: 'service_upsell',
          active: true,
          priority: 'high',
          placements: ['step_4'],
          targeting: {
            roles: ['producer'],
            intent: 'professional'
          },
          content: {
            title: 'Upgrade to Professional Services',
            description: 'Get ISRC codes, professional licensing, and priority support',
            services: [
              'ISRC Code Generation',
              'Professional License Templates',
              'Priority Customer Support',
              'Advanced Analytics Dashboard',
              'Revenue Optimization Tools'
            ],
            pricing: {
              monthly: 29.99,
              annual: 299.99,
              lifetime: 999.99
            },
            revenue: 5.00
          }
        }
      ],
      analytics: {
        impressions: 0,
        clicks: 0,
        conversions: 0,
        revenue: 0,
        ctr: 0,
        conversionRate: 0
      },
      targeting: {
        demographics: this.detectUserDemographics(),
        interests: this.detectUserInterests(),
        behavior: { pageViews: 0, timeOnSite: 0, interactions: 0 }
      }
    }
  }

  async initializeCampaignManager() {
    this.campaignManager = {
      activeCampaigns: this.sponsorData.campaigns.filter(c => c.active),
      
      getCampaignForStep: (step) => {
        return this.campaignManager.activeCampaigns.find(campaign => 
          campaign.placements.includes(`step_${step}`) &&
          this.matchesTargeting(campaign.targeting)
        )
      },
      
      trackImpression: (campaignId, step) => {
        this.sponsorData.analytics.impressions++
        this.trackAnalytics('campaign_impression', {
          campaignId,
          step,
          timestamp: new Date().toISOString(),
          userId: this.userData.id
        })
      },
      
      trackClick: (campaignId, step) => {
        this.sponsorData.analytics.clicks++
        this.sponsorData.analytics.ctr = (this.sponsorData.analytics.clicks / this.sponsorData.analytics.impressions) * 100
        this.trackAnalytics('campaign_click', {
          campaignId,
          step,
          timestamp: new Date().toISOString(),
          userId: this.userData.id
        })
      },
      
      trackConversion: (campaignId, step, revenue = 0) => {
        this.sponsorData.analytics.conversions++
        this.sponsorData.analytics.revenue += revenue
        this.sponsorData.analytics.conversionRate = (this.sponsorData.analytics.conversions / this.sponsorData.analytics.clicks) * 100
        this.trackAnalytics('campaign_conversion', {
          campaignId,
          step,
          revenue,
          timestamp: new Date().toISOString(),
          userId: this.userData.id
        })
      }
    }
  }

  async initializeAnalytics() {
    // Safe initialization with null checks
    this.analyticsManager = {
      sessionId: this.generateSessionId(),
      events: [], // Always initialize as empty array
      
      track: (event, data = {}) => {
        const eventData = {
          event,
          timestamp: new Date().toISOString(),
          sessionId: this.analyticsManager.sessionId,
          userId: this.userData.id,
          step: this.currentStep,
          data
        }
        
        this.analyticsManager.events.push(eventData)
        this.persistAnalytics()
        
        // Real-time analytics sync
        this.syncAnalytics(eventData)
      },
      
      getJourneyAnalytics: () => {
        return {
          totalTime: this.calculateTotalOnboardingTime(),
          stepsCompleted: this.currentStep,
          dropoffPoints: this.identifyDropoffPoints(),
          conversionFunnel: this.calculateConversionFunnel(),
          sponsorRevenue: this.sponsorData.analytics.revenue
        }
      }
    }
  }

  shouldStartOnboarding() {
    const hasCompleted = localStorage.getItem('onboarding_completed')
    const isFirstVisit = !localStorage.getItem('user_visited_before')
    const hasWalletConnected = localStorage.getItem('wallet_connected')
    
    return !hasCompleted && (isFirstVisit || hasWalletConnected)
  }

  async startOnboarding() {
    if (this.onboardingActive) return
    
    this.onboardingActive = true
    this.currentStep = 1
    
    // Track onboarding start
    this.analyticsManager.track('onboarding_started', {
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    })
    
    // Show partner consent modal first
    await this.showPartnerConsentModal()
    
    return this.renderStep(1)
  }

  async showPartnerConsentModal() {
    // If running in a headless/test environment or a dev CI where popups are
    // undesirable, allow skipping the modal by setting either:
    //   - window.__SKIP_PARTNER_CONSENT__ = true
    //   - localStorage.setItem('skip_partner_consent', 'true')
    try {
      if ((typeof window !== 'undefined' && window.__SKIP_PARTNER_CONSENT__) || (localStorage && localStorage.getItem && localStorage.getItem('skip_partner_consent') === 'true')) {
        try { localStorage.setItem('partner_consent_given', 'true') } catch (e) { /* ignore */ }
        return Promise.resolve()
      }
    } catch (e) {
      // If localStorage is unavailable or any error occurs, skip modal by default
      return Promise.resolve()
    }

    return new Promise((resolve) => {
      // Create modal for partner consent
      const modal = document.createElement('div')
      modal.className = 'onboarding-partner-modal'
      modal.innerHTML = `
        <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.8); display: flex; align-items: center; justify-content: center; z-index: 10000;">
          <div style="background: white; padding: 2rem; border-radius: 1rem; max-width: 500px; margin: 1rem;">
            <h2 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">🤝 Partner Content Notice</h2>
            <p style="margin-bottom: 1.5rem; color: #666;">
              BeatsChain partners with sponsors to provide free services and enhanced features. 
              You'll see relevant sponsor content during onboarding that helps fund our platform.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: flex-end;">
              <button id="partner-accept" style="background: #3b82f6; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; cursor: pointer;">
                Accept & Continue
              </button>
            </div>
          </div>
        </div>
      `
      
      document.body.appendChild(modal)
      
      document.getElementById('partner-accept').onclick = () => {
        document.body.removeChild(modal)
        try { localStorage.setItem('partner_consent_given', 'true') } catch (e) { /* ignore */ }
        this.analyticsManager.track('partner_consent_accepted')
        resolve()
      }
    })
  }

  async renderStep(step) {
    const stepData = await this.getStepData(step)
    const campaign = this.campaignManager.getCampaignForStep(step)
    
    if (campaign) {
      this.campaignManager.trackImpression(campaign.id, step)
    }
    
    // Track step view
    this.analyticsManager.track('step_viewed', {
      step,
      stepTitle: stepData.title,
      hasSponsorContent: !!campaign
    })
    
    return {
      ...stepData,
      campaign,
      progress: (step / this.totalSteps) * 100,
      analytics: this.analyticsManager.getJourneyAnalytics()
    }
  }

  async getStepData(step) {
    const steps = {
      1: {
        id: 'welcome',
        title: 'Welcome to BeatsChain',
        subtitle: 'The Future of Music Ownership',
        content: 'Transform your music into valuable NFTs with professional tools and global reach',
        type: 'welcome',
        features: [
          'Professional ISRC Code Generation',
          'Blockchain-Verified Ownership',
          'Automatic Royalty Distribution',
          'Global Marketplace Access'
        ],
        nextAction: 'Get Started'
      },
      2: {
        id: 'account_setup',
        title: 'Connect Your Account',
        subtitle: 'Choose Your Preferred Sign-In Method',
        content: 'Connect with Google for quick access or use your crypto wallet for full Web3 features',
        type: 'account_setup',
        options: [
          {
            type: 'google',
            title: 'Google Sign-In',
            description: 'Quick and easy access',
            benefits: ['Instant access', 'Profile sync', 'Easy recovery']
          },
          {
            type: 'wallet',
            title: 'Crypto Wallet',
            description: 'Full Web3 experience',
            benefits: ['True ownership', 'DeFi integration', 'Maximum security']
          }
        ],
        nextAction: 'Continue'
      },
      3: {
        id: 'role_selection',
        title: 'Choose Your Role',
        subtitle: 'What Brings You to BeatsChain?',
        content: 'Select your primary role to customize your experience and unlock relevant features',
        type: 'role_selection',
        roles: [
          {
            id: 'producer',
            title: 'Music Producer',
            icon: '🎵',
            description: 'Create, upload, and monetize your beats',
            features: ['Beat Upload', 'NFT Minting', 'Royalty Tracking', 'Analytics Dashboard'],
            earning_potential: 'High'
          },
          {
            id: 'creator',
            title: 'Content Creator',
            icon: '🎨',
            description: 'License beats for your content and collaborations',
            features: ['Beat Licensing', 'Content Tools', 'Collaboration Hub', 'Revenue Sharing'],
            earning_potential: 'Medium'
          },
          {
            id: 'music_lover',
            title: 'Music Lover',
            icon: '🎧',
            description: 'Discover, collect, and support your favorite artists',
            features: ['Beat Discovery', 'NFT Collection', 'Artist Support', 'Exclusive Access'],
            earning_potential: 'Low'
          }
        ],
        nextAction: 'Select Role'
      },
      4: {
        id: 'profile_setup',
        title: 'Set Up Your Profile',
        subtitle: 'Tell Us About Yourself',
        content: 'Complete your profile to unlock personalized features and connect with the community',
        type: 'profile_setup',
        fields: [
          { name: 'displayName', label: 'Display Name', required: true, placeholder: 'Your name or artist name' },
          { name: 'bio', label: 'Bio', required: false, placeholder: 'Tell us about yourself...' },
          { name: 'location', label: 'Location', required: false, placeholder: 'City, Country' },
          { name: 'website', label: 'Website', required: false, placeholder: 'https://yoursite.com' },
          { name: 'socialLinks', label: 'Social Links', required: false, placeholder: 'Instagram, Twitter, etc.' }
        ],
        nextAction: 'Save Profile'
      },
      5: {
        id: 'feature_tour',
        title: 'Explore Your Features',
        subtitle: 'Discover What You Can Do',
        content: 'Take a quick tour of the features available to you based on your selected role',
        type: 'feature_tour',
        features: this.getRoleSpecificFeatures(),
        nextAction: 'Start Tour'
      },
      6: {
        id: 'completion',
        title: 'You\'re All Set!',
        subtitle: 'Welcome to the BeatsChain Community',
        content: 'Your account is ready. Start exploring and creating in the decentralized music world',
        type: 'completion',
        nextSteps: [
          { action: 'upload_beat', title: 'Upload Your First Beat', description: 'Start monetizing your music' },
          { action: 'explore_marketplace', title: 'Explore Marketplace', description: 'Discover amazing beats' },
          { action: 'complete_profile', title: 'Complete Profile', description: 'Add more details' },
          { action: 'join_community', title: 'Join Community', description: 'Connect with other creators' }
        ],
        nextAction: 'Enter BeatsChain'
      }
    }
    
    return steps[step] || steps[1]
  }

  async nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++
      
      // Track step progression
      this.analyticsManager.track('step_completed', {
        completedStep: this.currentStep - 1,
        nextStep: this.currentStep,
        timeSpent: this.calculateStepTime()
      })
      
      return this.renderStep(this.currentStep)
    } else {
      return this.completeOnboarding()
    }
  }

  async setUserRole(role) {
    this.userData.role = role
    this.userData.roleSelectedAt = new Date().toISOString()
    this.saveUserData()
    
    // Track role selection
    this.analyticsManager.track('role_selected', {
      role,
      timestamp: new Date().toISOString()
    })
    
    // Get role-specific onboarding path
    const rolePaths = {
      producer: {
        features: ['upload_beats', 'nft_minting', 'analytics_dashboard', 'royalty_tracking'],
        nextSteps: ['upload_first_beat', 'setup_profile', 'explore_marketplace'],
        recommendations: ['professional_services', 'isrc_generation', 'marketing_tools']
      },
      creator: {
        features: ['license_beats', 'content_creation', 'collaboration_hub', 'revenue_sharing'],
        nextSteps: ['browse_beats', 'setup_profile', 'create_content'],
        recommendations: ['collaboration_tools', 'content_templates', 'licensing_guide']
      },
      music_lover: {
        features: ['discover_beats', 'collect_nfts', 'support_artists', 'exclusive_access'],
        nextSteps: ['explore_marketplace', 'setup_profile', 'follow_artists'],
        recommendations: ['beat_discovery', 'nft_collection', 'artist_support']
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
    
    // Track profile completion
    this.analyticsManager.track('profile_completed', {
      profileData: Object.keys(profileData),
      completeness: this.calculateProfileCompleteness(profileData)
    })
    
    return this.userData.profile
  }

  async completeOnboarding() {
    const completionData = {
      completedAt: new Date().toISOString(),
      totalSteps: this.totalSteps,
      totalTime: this.calculateTotalOnboardingTime(),
      userData: this.userData,
      sponsorAnalytics: this.sponsorData.analytics,
      journeyAnalytics: this.analyticsManager.getJourneyAnalytics()
    }
    
    // Persist completion
    localStorage.setItem('onboarding_completed', 'true')
    localStorage.setItem('onboarding_completion_data', JSON.stringify(completionData))
    
    // Track completion
    this.analyticsManager.track('onboarding_completed', completionData)
    
    // Sync final analytics
    await this.syncFinalAnalytics(completionData)
    
    // Trigger completion event
    window.dispatchEvent(new CustomEvent('onboarding-complete', { 
      detail: completionData 
    }))
    
    this.onboardingActive = false
    
    return completionData
  }

  // Helper Methods
  detectUserDemographics() {
    return {
      userAgent: navigator.userAgent,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`
    }
  }

  detectUserInterests() {
    // Analyze user behavior to detect interests
    return ['music_production', 'nft_collecting', 'crypto_trading']
  }

  trackUserBehavior() {
    // Safe null checks to prevent crashes
    if (!this.analyticsManager || !this.analyticsManager.events || !Array.isArray(this.analyticsManager.events)) {
      return { pageViews: 0, timeOnSite: 0, interactions: 0 }
    }
    
    try {
      return {
        pageViews: this.analyticsManager.events.filter(e => e && e.event === 'page_view').length,
        timeOnSite: this.calculateTimeOnSite(),
        interactions: this.analyticsManager.events.filter(e => e && e.event && e.event.includes('click')).length
      }
    } catch (error) {
      console.warn('Error tracking user behavior:', error)
      return { pageViews: 0, timeOnSite: 0, interactions: 0 }
    }
  }

  matchesTargeting(targeting) {
    if (targeting.newUsers && localStorage.getItem('onboarding_completed')) return false
    if (targeting.roles && targeting.roles.length > 0 && !targeting.roles.includes(this.userData.role) && !targeting.roles.includes('all')) return false
    return true
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  calculateTotalOnboardingTime() {
    const startTime = new Date(this.userData.startedAt).getTime()
    const currentTime = new Date().getTime()
    return Math.round((currentTime - startTime) / 1000) // seconds
  }

  getRoleSpecificFeatures() {
    const roleFeatures = {
      producer: [
        { id: 'upload', title: 'Beat Upload', description: 'Upload and mint your beats as NFTs' },
        { id: 'analytics', title: 'Analytics Dashboard', description: 'Track performance and earnings' },
        { id: 'isrc', title: 'ISRC Generation', description: 'Professional track identification' }
      ],
      creator: [
        { id: 'licensing', title: 'Beat Licensing', description: 'License beats for your content' },
        { id: 'collaboration', title: 'Collaboration Tools', description: 'Work with producers' },
        { id: 'content', title: 'Content Creation', description: 'Create and publish content' }
      ],
      music_lover: [
        { id: 'discovery', title: 'Beat Discovery', description: 'Find amazing new music' },
        { id: 'collection', title: 'NFT Collection', description: 'Collect and trade beat NFTs' },
        { id: 'support', title: 'Artist Support', description: 'Support your favorite creators' }
      ]
    }
    
    return roleFeatures[this.userData.role] || roleFeatures.music_lover
  }

  trackAnalytics(event, data) {
    this.analyticsManager.track(event, data)
  }

  persistAnalytics() {
    try {
      const analytics = {
        events: this.analyticsManager.events,
        sponsorAnalytics: this.sponsorData.analytics,
        sessionId: this.analyticsManager.sessionId
      }
      localStorage.setItem('onboarding_analytics', JSON.stringify(analytics))
    } catch (error) {
      console.warn('Failed to persist analytics:', error)
    }
  }

  async syncAnalytics(eventData) {
    // Sync with external analytics service
    try {
      if (window.gtag) {
        window.gtag('event', eventData.event, {
          custom_parameter_1: eventData.userId,
          custom_parameter_2: eventData.step
        })
      }
    } catch (error) {
      console.warn('Analytics sync failed:', error)
    }
  }

  async syncFinalAnalytics(completionData) {
    // Final analytics sync with comprehensive data
    try {
      const analyticsPayload = {
        userId: this.userData.id,
        completionData,
        sponsorRevenue: this.sponsorData.analytics.revenue,
        totalEvents: this.analyticsManager.events.length,
        conversionFunnel: this.calculateConversionFunnel()
      }
      
      // Sync with backend if available
      if (process.env.NEXT_PUBLIC_MCP_SERVER_URL) {
        await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/analytics/onboarding`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analyticsPayload)
        })
      }
    } catch (error) {
      console.warn('Final analytics sync failed:', error)
    }
  }

  calculateConversionFunnel() {
    // Safe null checks
    if (!this.analyticsManager || !this.analyticsManager.events || !Array.isArray(this.analyticsManager.events)) {
      return { started: 0, step2: 0, step3: 0, step4: 0, step5: 0, completed: 0 }
    }
    
    const events = this.analyticsManager.events
    try {
      return {
        started: events.filter(e => e && e.event === 'onboarding_started').length,
        step2: events.filter(e => e && e.event === 'step_viewed' && e.data && e.data.step === 2).length,
        step3: events.filter(e => e && e.event === 'step_viewed' && e.data && e.data.step === 3).length,
        step4: events.filter(e => e && e.event === 'step_viewed' && e.data && e.data.step === 4).length,
        step5: events.filter(e => e && e.event === 'step_viewed' && e.data && e.data.step === 5).length,
        completed: events.filter(e => e && e.event === 'onboarding_completed').length
      }
    } catch (error) {
      console.warn('Error calculating conversion funnel:', error)
      return { started: 0, step2: 0, step3: 0, step4: 0, step5: 0, completed: 0 }
    }
  }

  calculateProfileCompleteness(profileData) {
    const totalFields = 5 // displayName, bio, location, website, socialLinks
    const completedFields = Object.values(profileData).filter(value => value && value.trim()).length
    return Math.round((completedFields / totalFields) * 100)
  }

  calculateStepTime() {
    // Calculate time spent on current step
    const stepEvents = this.analyticsManager.events.filter(e => e.step === this.currentStep)
    if (stepEvents.length < 2) return 0
    
    const firstEvent = new Date(stepEvents[0].timestamp).getTime()
    const lastEvent = new Date(stepEvents[stepEvents.length - 1].timestamp).getTime()
    return Math.round((lastEvent - firstEvent) / 1000)
  }

  calculateTimeOnSite() {
    // Safe null checks
    if (!this.analyticsManager || !this.analyticsManager.events || !Array.isArray(this.analyticsManager.events) || this.analyticsManager.events.length === 0) {
      return 0
    }
    
    try {
      const events = this.analyticsManager.events.filter(e => e && e.timestamp)
      if (events.length === 0) return 0
      
      const firstEvent = new Date(events[0].timestamp).getTime()
      const lastEvent = new Date(events[events.length - 1].timestamp).getTime()
      return Math.round((lastEvent - firstEvent) / 1000)
    } catch (error) {
      console.warn('Error calculating time on site:', error)
      return 0
    }
  }

  identifyDropoffPoints() {
    // Safe null checks
    if (!this.analyticsManager || !this.analyticsManager.events || !Array.isArray(this.analyticsManager.events)) {
      return {}
    }
    
    try {
      const stepViews = {}
      this.analyticsManager.events
        .filter(e => e && e.event === 'step_viewed' && e.data && e.data.step)
        .forEach(e => {
          stepViews[e.data.step] = (stepViews[e.data.step] || 0) + 1
        })
      
      return stepViews
    } catch (error) {
      console.warn('Error identifying dropoff points:', error)
      return {}
    }
  }

  // Public API Methods
  reset() {
    localStorage.removeItem('onboarding_completed')
    localStorage.removeItem('onboarding_user_data')
    localStorage.removeItem('onboarding_completion_data')
    localStorage.removeItem('onboarding_analytics')
    localStorage.removeItem('partner_consent_given')
    
    this.currentStep = 0
    this.userData = {}
    this.sponsorData = {}
    this.onboardingActive = false
    
    console.log('🔄 Comprehensive onboarding system reset')
  }

  getAnalytics() {
    return {
      userData: this.userData,
      sponsorData: this.sponsorData,
      analytics: this.analyticsManager.getJourneyAnalytics(),
      events: this.analyticsManager.events
    }
  }

  getCurrentStep() {
    return this.currentStep
  }

  isActive() {
    return this.onboardingActive
  }
}

// Initialize comprehensive system with compatibility and error handling
if (typeof window !== 'undefined') {
  try {
    // Expose constructor with proper error handling
    window.AppOnboardingManager = AppOnboardingManager

    // Create a default instance for runtime usage with safety checks
    let _instance = null
    
    try {
      _instance = new AppOnboardingManager()
    } catch (constructorError) {
      console.error('Failed to create AppOnboardingManager instance:', constructorError)
      // Create a fallback object to prevent further errors
      _instance = {
        initialize: () => Promise.resolve(),
        reset: () => {},
        getAnalytics: () => ({}),
        startOnboarding: () => Promise.resolve(),
        getCurrentStep: () => 0,
        isActive: () => false
      }
    }

    // Safe initialization with proper error boundaries
    const safeInitialize = async () => {
      try {
        if (_instance && typeof _instance.initialize === 'function') {
          await _instance.initialize()
        }
      } catch (e) {
        console.warn('onboarding init failed:', e)
      }
    }

    // Auto-initialize instance when DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', safeInitialize)
    } else {
      // Use setTimeout to avoid blocking
      setTimeout(safeInitialize, 0)
    }

    // Expose default instance and debugging helpers with null checks
    window.appOnboarding = _instance
    window.onboardingDebug = {
      reset: () => {
        try {
          return _instance && _instance.reset ? _instance.reset() : null
        } catch (e) {
          console.warn('onboarding reset failed:', e)
        }
      },
      analytics: () => {
        try {
          return _instance && _instance.getAnalytics ? _instance.getAnalytics() : {}
        } catch (e) {
          console.warn('onboarding analytics failed:', e)
          return {}
        }
      },
      start: () => {
        try {
          return _instance && _instance.startOnboarding ? _instance.startOnboarding() : Promise.resolve()
        } catch (e) {
          console.warn('onboarding start failed:', e)
          return Promise.resolve()
        }
      }
    }

    // Attach proxy static methods on the constructor for legacy usage with error handling
    const methodsToProxy = ['initialize','reset','startOnboarding','getAnalytics','getCurrentStep','isActive']
    methodsToProxy.forEach(fn => {
      try {
        if (_instance && typeof _instance[fn] === 'function') {
          window.AppOnboardingManager[fn] = (...args) => {
            try {
              return _instance[fn](...args)
            } catch (e) {
              console.warn(`AppOnboardingManager.${fn} failed:`, e)
              // Return safe defaults based on method
              if (fn === 'getAnalytics') return {}
              if (fn === 'getCurrentStep') return 0
              if (fn === 'isActive') return false
              return Promise.resolve()
            }
          }
        } else {
          // Provide safe fallback methods
          window.AppOnboardingManager[fn] = (...args) => {
            console.warn(`AppOnboardingManager.${fn} not available, using fallback`)
            if (fn === 'getAnalytics') return {}
            if (fn === 'getCurrentStep') return 0
            if (fn === 'isActive') return false
            return Promise.resolve()
          }
        }
      } catch (e) {
        console.warn(`Failed to setup proxy method ${fn}:`, e)
      }
    })
    
  } catch (err) {
    console.error('AppOnboardingManager: critical initialization failure', err)
    
    // Provide minimal fallback to prevent complete failure
    window.AppOnboardingManager = function() {
      console.warn('AppOnboardingManager fallback constructor used')
      return {
        initialize: () => Promise.resolve(),
        reset: () => {},
        getAnalytics: () => ({}),
        startOnboarding: () => Promise.resolve(),
        getCurrentStep: () => 0,
        isActive: () => false
      }
    }
    
    // Add static methods to fallback constructor
    window.AppOnboardingManager.initialize = () => Promise.resolve()
    window.AppOnboardingManager.reset = () => {}
    window.AppOnboardingManager.getAnalytics = () => ({})
    window.AppOnboardingManager.startOnboarding = () => Promise.resolve()
    window.AppOnboardingManager.getCurrentStep = () => 0
    window.AppOnboardingManager.isActive = () => false
  }
}