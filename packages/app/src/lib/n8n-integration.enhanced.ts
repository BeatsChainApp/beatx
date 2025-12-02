'use client'

interface N8NWebhookConfig {
  userSignup?: string
  profileComplete?: string
  onboardingComplete?: string
  roleSelection?: string
  uploadSuccess?: string
  mintSuccess?: string
  errorTracking?: string
}

class N8NIntegrationManager {
  private webhooks: N8NWebhookConfig = {}
  private enabled = false

  constructor() {
    this.loadWebhookConfig()
  }

  private loadWebhookConfig() {
    this.webhooks = {
      userSignup: process.env.NEXT_PUBLIC_N8N_WEBHOOK_SIGNUP,
      profileComplete: process.env.NEXT_PUBLIC_N8N_WEBHOOK_PROFILE,
      onboardingComplete: process.env.NEXT_PUBLIC_N8N_WEBHOOK_COMPLETE,
      roleSelection: process.env.NEXT_PUBLIC_N8N_WEBHOOK_ROLE,
      uploadSuccess: process.env.NEXT_PUBLIC_N8N_WEBHOOK_UPLOAD,
      mintSuccess: process.env.NEXT_PUBLIC_N8N_WEBHOOK_MINT,
      errorTracking: process.env.NEXT_PUBLIC_N8N_WEBHOOK_ERROR
    }

    // Enable if at least one webhook is configured
    this.enabled = Object.values(this.webhooks).some(url => !!url)
    
    if (this.enabled) {
      console.log('✅ N8N Integration enabled with', Object.keys(this.webhooks).filter(k => this.webhooks[k as keyof N8NWebhookConfig]).length, 'webhooks')
    }
  }

  async triggerWebhook(type: keyof N8NWebhookConfig, data: any) {
    if (!this.enabled) return

    const webhookUrl = this.webhooks[type]
    if (!webhookUrl) return

    try {
      const payload = {
        ...data,
        source: 'beatx_app',
        timestamp: Date.now(),
        type: type,
        user_agent: navigator.userAgent,
        url: window.location.href
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        console.log(`✅ N8N webhook ${type} triggered successfully`)
      } else {
        console.warn(`⚠️ N8N webhook ${type} failed:`, response.status)
      }
    } catch (error) {
      console.warn(`❌ N8N webhook ${type} error:`, error)
    }
  }

  // Convenience methods for common events
  async trackUserSignup(userData: any) {
    await this.triggerWebhook('userSignup', {
      event: 'user_signup',
      user: userData,
      platform: 'web_app'
    })
  }

  async trackProfileComplete(profileData: any) {
    await this.triggerWebhook('profileComplete', {
      event: 'profile_complete',
      profile: profileData,
      platform: 'web_app'
    })
  }

  async trackOnboardingComplete(onboardingData: any) {
    await this.triggerWebhook('onboardingComplete', {
      event: 'onboarding_complete',
      onboarding: onboardingData,
      platform: 'web_app'
    })
  }

  async trackRoleSelection(roleData: any) {
    await this.triggerWebhook('roleSelection', {
      event: 'role_selection',
      role: roleData,
      platform: 'web_app'
    })
  }

  async trackUploadSuccess(uploadData: any) {
    await this.triggerWebhook('uploadSuccess', {
      event: 'upload_success',
      upload: uploadData,
      platform: 'web_app'
    })
  }

  async trackMintSuccess(mintData: any) {
    await this.triggerWebhook('mintSuccess', {
      event: 'mint_success',
      mint: mintData,
      platform: 'web_app'
    })
  }

  async trackError(errorData: any) {
    await this.triggerWebhook('errorTracking', {
      event: 'error_occurred',
      error: {
        message: errorData.message,
        stack: errorData.stack,
        component: errorData.component,
        user_action: errorData.userAction
      },
      platform: 'web_app'
    })
  }

  // Batch tracking for multiple events
  async trackUserJourney(journeyData: any[]) {
    if (!this.enabled) return

    const batchData = {
      event: 'user_journey_batch',
      journey: journeyData,
      platform: 'web_app',
      timestamp: Date.now()
    }

    // Send to the most appropriate webhook (onboarding complete)
    await this.triggerWebhook('onboardingComplete', batchData)
  }

  // Analytics integration
  async trackAnalyticsEvent(eventType: string, eventData: any) {
    if (!this.enabled) return

    const analyticsPayload = {
      event: 'analytics_event',
      event_type: eventType,
      event_data: eventData,
      platform: 'web_app',
      timestamp: Date.now(),
      session_id: this.getSessionId()
    }

    // Use error tracking webhook for analytics (most flexible)
    await this.triggerWebhook('errorTracking', analyticsPayload)
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('beatx_n8n_session_id')
    if (!sessionId) {
      sessionId = 'n8n_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('beatx_n8n_session_id', sessionId)
    }
    return sessionId
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    if (!this.enabled) return false

    try {
      // Test the most basic webhook (user signup)
      const testWebhook = this.webhooks.userSignup || this.webhooks.errorTracking
      if (!testWebhook) return false

      const response = await fetch(testWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'health_check',
          timestamp: Date.now(),
          source: 'beatx_app'
        })
      })

      return response.ok
    } catch (error) {
      console.warn('N8N health check failed:', error)
      return false
    }
  }
}

// Export singleton instance
export const n8nIntegration = new N8NIntegrationManager()

// Export class for custom instances
export { N8NIntegrationManager }