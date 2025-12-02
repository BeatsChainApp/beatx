'use client'

interface GoogleUser {
  sub: string
  email: string
  name: string
  picture: string
  verified_email: boolean
}

export class GoogleAuthManager {
  private static instance: GoogleAuthManager
  private isInitialized = false

  static getInstance(): GoogleAuthManager {
    if (!GoogleAuthManager.instance) {
      GoogleAuthManager.instance = new GoogleAuthManager()
    }
    return GoogleAuthManager.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return

    try {
      await this.loadGoogleScript()
      await this.initializeGoogleAuth()
      this.isInitialized = true
    } catch (error) {
      console.error('Google Auth initialization failed:', error)
      throw error
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-auth-script')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      script.id = 'google-auth-script'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('Failed to load Google Auth script'))
      document.head.appendChild(script)
    })
  }

  private async initializeGoogleAuth(): Promise<void> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId) {
      throw new Error('Google Client ID not configured')
    }

    return new Promise((resolve, reject) => {
      if (!(window as any).google) {
        reject(new Error('Google SDK not loaded'))
        return
      }

      try {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: this.handleCredentialResponse.bind(this),
          auto_select: false,
          cancel_on_tap_outside: true
        })
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }

  private handleCredentialResponse(response: any): void {
    try {
      const credential = response.credential
      const payload = JSON.parse(atob(credential.split('.')[1]))
      
      const userData: GoogleUser = {
        sub: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture || '',
        verified_email: payload.email_verified || false
      }

      // Store user data
      localStorage.setItem('google_auth_result', JSON.stringify(userData))
      
      // Create Web3 profile for Google users
      const profileKey = `web3_profile_google_${userData.email.toLowerCase()}`
      const profile = {
        address: `google:${userData.sub}`,
        displayName: userData.name,
        email: userData.email,
        profileImage: userData.picture,
        role: 'user',
        isVerified: userData.verified_email,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      localStorage.setItem(profileKey, JSON.stringify(profile))
      
      // Trigger auth event
      window.dispatchEvent(new CustomEvent('google-auth-success', { 
        detail: userData 
      }))
    } catch (error) {
      console.error('Failed to process Google credential:', error)
      window.dispatchEvent(new CustomEvent('google-auth-error', { 
        detail: error 
      }))
    }
  }

  async signIn(): Promise<GoogleUser> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Google sign-in timeout'))
      }, 30000)

      const handleSuccess = (event: CustomEvent) => {
        clearTimeout(timeout)
        window.removeEventListener('google-auth-success', handleSuccess as EventListener)
        window.removeEventListener('google-auth-error', handleError as EventListener)
        resolve(event.detail)
      }

      const handleError = (event: CustomEvent) => {
        clearTimeout(timeout)
        window.removeEventListener('google-auth-success', handleSuccess as EventListener)
        window.removeEventListener('google-auth-error', handleError as EventListener)
        reject(event.detail)
      }

      window.addEventListener('google-auth-success', handleSuccess as EventListener)
      window.addEventListener('google-auth-error', handleError as EventListener)

      try {
        (window as any).google.accounts.id.prompt()
      } catch (error) {
        clearTimeout(timeout)
        window.removeEventListener('google-auth-success', handleSuccess as EventListener)
        window.removeEventListener('google-auth-error', handleError as EventListener)
        reject(error)
      }
    })
  }

  signOut(): void {
    localStorage.removeItem('google_auth_result')
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.disableAutoSelect()
    }
  }

  getCurrentUser(): GoogleUser | null {
    try {
      const stored = localStorage.getItem('google_auth_result')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
}

export const googleAuth = GoogleAuthManager.getInstance()