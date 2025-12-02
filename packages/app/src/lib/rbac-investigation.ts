'use client'

import { isClientSide, safeLocalStorage, isAdminEmail } from './auth-utils'

// RBAC Investigation and Data Pipeline Analysis
export class RBACInvestigator {
  private static instance: RBACInvestigator
  
  static getInstance(): RBACInvestigator {
    if (!RBACInvestigator.instance) {
      RBACInvestigator.instance = new RBACInvestigator()
    }
    return RBACInvestigator.instance
  }

  // Investigate all authentication data pipelines
  investigateDataPipelines() {
    if (!isClientSide()) return null

    const storage = safeLocalStorage()
    const investigation = {
      timestamp: new Date().toISOString(),
      googleAuth: this.investigateGoogleAuth(),
      walletAuth: this.investigateWalletAuth(),
      profiles: this.investigateProfiles(),
      adminAccess: this.investigateAdminAccess(),
      rbacRoles: this.investigateRBACRoles(),
      dataPipelines: this.investigateDataFlow()
    }

    console.log('🔍 RBAC Investigation Complete:', investigation)
    return investigation
  }

  private investigateGoogleAuth() {
    const storage = safeLocalStorage()
    
    try {
      const googleAuth = storage.getItem('google_auth_result')
      if (!googleAuth) return { status: 'not_found' }

      const parsed = JSON.parse(googleAuth)
      return {
        status: 'found',
        email: parsed.email,
        name: parsed.name,
        verified: parsed.verified_email,
        isAdmin: isAdminEmail(parsed.email || ''),
        sub: parsed.sub
      }
    } catch (error) {
      return { status: 'error', error: error.message }
    }
  }

  private investigateWalletAuth() {
    // Check for connected wallet data
    const walletData = {
      hasWagmiConnection: false,
      connectedAddress: null,
      siweAuthenticated: false
    }

    // This would be populated by wagmi hooks in actual component
    return walletData
  }

  private investigateProfiles() {
    const storage = safeLocalStorage()
    const profiles = []

    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('web3_profile_')) {
          try {
            const profile = JSON.parse(storage.getItem(key) || '{}')
            profiles.push({
              key,
              address: profile.address,
              role: profile.role,
              email: profile.email,
              isAdmin: profile.email ? isAdminEmail(profile.email) : false
            })
          } catch (e) {
            profiles.push({ key, error: 'parse_error' })
          }
        }
      })
    } catch (error) {
      return { error: error.message }
    }

    return profiles
  }

  private investigateAdminAccess() {
    const adminEmails = [
      'info@unamifoundation.org',
      'admin@beatschain.app', 
      'support@beatschain.app'
    ]

    const superAdminWallets = [
      '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
    ]

    return {
      adminEmails,
      superAdminWallets,
      currentGoogleUser: this.investigateGoogleAuth(),
      hasAdminAccess: this.checkCurrentAdminAccess()
    }
  }

  private investigateRBACRoles() {
    const rolePermissions = {
      user: ['browse', 'purchase', 'profile'],
      producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats'],
      admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation'],
      super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation', 'system_settings', 'role_management']
    }

    return {
      roleHierarchy: rolePermissions,
      currentUserRole: this.getCurrentUserRole(),
      currentPermissions: this.getCurrentPermissions()
    }
  }

  private investigateDataFlow() {
    return {
      authenticationFlow: [
        '1. User clicks Sign In/Sign Up',
        '2. CleanAuthModal opens with role selection',
        '3. Google OAuth or Wallet connection',
        '4. UnifiedAuthContext processes authentication',
        '5. Role determination (admin email check)',
        '6. Profile creation/update in localStorage',
        '7. Permission assignment based on role',
        '8. UI updates with authenticated state'
      ],
      dataStorage: {
        googleAuth: 'localStorage: google_auth_result',
        profiles: 'localStorage: web3_profile_*',
        adminConfig: 'localStorage: admin_config',
        onboarding: 'localStorage: onboarding_completed'
      },
      securityMeasures: [
        'Case-insensitive admin email matching',
        'Safe localStorage access with fallbacks',
        'Client-side only authentication state',
        'Error boundaries for React error handling',
        'Hydration-safe state management'
      ]
    }
  }

  private checkCurrentAdminAccess(): boolean {
    const googleAuth = this.investigateGoogleAuth()
    if (googleAuth.status === 'found' && googleAuth.isAdmin) {
      return true
    }

    // Check wallet-based admin access would go here
    return false
  }

  private getCurrentUserRole(): string {
    const googleAuth = this.investigateGoogleAuth()
    if (googleAuth.status === 'found') {
      return googleAuth.isAdmin ? 'super_admin' : 'user'
    }
    return 'guest'
  }

  private getCurrentPermissions(): string[] {
    const role = this.getCurrentUserRole()
    const rolePermissions = {
      guest: [],
      user: ['browse', 'purchase', 'profile'],
      producer: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats'],
      admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation'],
      super_admin: ['browse', 'purchase', 'profile', 'upload', 'dashboard', 'analytics', 'producer_stats', 'admin_panel', 'user_management', 'content_moderation', 'system_settings', 'role_management']
    }

    return rolePermissions[role] || []
  }

  // Generate comprehensive report
  generateReport() {
    const investigation = this.investigateDataPipelines()
    
    const report = {
      summary: {
        authenticationStatus: investigation?.googleAuth?.status || 'unknown',
        currentRole: this.getCurrentUserRole(),
        hasAdminAccess: this.checkCurrentAdminAccess(),
        totalProfiles: investigation?.profiles?.length || 0
      },
      recommendations: this.generateRecommendations(investigation),
      securityStatus: this.assessSecurityStatus(investigation)
    }

    return report
  }

  private generateRecommendations(investigation: any) {
    const recommendations = []

    if (investigation?.googleAuth?.status === 'not_found') {
      recommendations.push('No Google authentication found - user should sign in')
    }

    if (investigation?.profiles?.length === 0) {
      recommendations.push('No user profiles found - user needs to complete onboarding')
    }

    if (this.checkCurrentAdminAccess()) {
      recommendations.push('Admin access detected - full system access available')
    }

    return recommendations
  }

  private assessSecurityStatus(investigation: any) {
    return {
      authenticationSecure: investigation?.googleAuth?.verified || false,
      profileDataIntegrity: investigation?.profiles?.every((p: any) => !p.error) || false,
      adminAccessControlled: true, // Admin emails are properly controlled
      dataEncryption: false // localStorage is not encrypted
    }
  }
}

// Export singleton instance
export const rbacInvestigator = RBACInvestigator.getInstance()

// Auto-run investigation in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    rbacInvestigator.investigateDataPipelines()
  }, 3000)
}