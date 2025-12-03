/**
 * Wallet-First Identity Bridge - Option C Implementation
 * Unifies Google OAuth + Embedded Wallet + SIWE with progressive migration
 */

class WalletIdentityBridge {
  constructor(options = {}) {
    this.options = {
      enableProgressiveMigration: true,
      maintainBackwardCompatibility: true,
      autoUpgradeUsers: false,
      ...options
    }
    
    this.identityProviders = new Map()
    this.userSessions = new Map()
    this.migrationQueue = new Set()
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return true

    try {
      // Initialize identity providers
      await this.initializeProviders()
      
      // Setup session management
      this.setupSessionManagement()
      
      // Start migration worker if enabled
      if (this.options.enableProgressiveMigration) {
        this.startMigrationWorker()
      }
      
      this.initialized = true
      console.log('✅ Wallet Identity Bridge initialized')
      return true
    } catch (error) {
      console.error('❌ Wallet Identity Bridge initialization failed:', error)
      return false
    }
  }

  async initializeProviders() {
    // Google OAuth Provider
    this.identityProviders.set('google', {
      type: 'oauth',
      verify: this.verifyGoogleToken.bind(this),
      createSession: this.createGoogleSession.bind(this),
      priority: 2
    })

    // Embedded Wallet Provider (Thirdweb)
    this.identityProviders.set('embedded_wallet', {
      type: 'wallet',
      verify: this.verifyEmbeddedWallet.bind(this),
      createSession: this.createWalletSession.bind(this),
      priority: 1 // Highest priority
    })

    // SIWE Provider
    this.identityProviders.set('siwe', {
      type: 'signature',
      verify: this.verifySIWE.bind(this),
      createSession: this.createSIWESession.bind(this),
      priority: 1
    })

    // Reown AppKit Provider
    this.identityProviders.set('reown', {
      type: 'wallet',
      verify: this.verifyReownWallet.bind(this),
      createSession: this.createReownSession.bind(this),
      priority: 1
    })
  }

  setupSessionManagement() {
    // Unified session structure
    this.sessionSchema = {
      id: 'string',
      userId: 'string', // Wallet address as primary key
      walletAddress: 'string',
      providers: 'array', // Multiple providers can be linked
      primaryProvider: 'string',
      metadata: 'object',
      createdAt: 'timestamp',
      expiresAt: 'timestamp',
      isActive: 'boolean'
    }
  }

  /**
   * Main authentication method - tries wallet-first, falls back gracefully
   */
  async authenticate(authData) {
    try {
      // Determine authentication type
      const authType = this.detectAuthType(authData)
      
      // Try wallet-first authentication
      if (authType === 'wallet' || authType === 'signature') {
        const walletResult = await this.authenticateWallet(authData)
        if (walletResult.success) {
          return this.createUnifiedSession(walletResult)
        }
      }
      
      // Fallback to OAuth if wallet fails
      if (authType === 'oauth' || authType === 'fallback') {
        const oauthResult = await this.authenticateOAuth(authData)
        if (oauthResult.success) {
          // Check if user should be migrated to wallet
          if (this.options.enableProgressiveMigration) {
            this.queueForMigration(oauthResult.user)
          }
          return this.createUnifiedSession(oauthResult)
        }
      }
      
      throw new Error('All authentication methods failed')
    } catch (error) {
      console.error('Authentication failed:', error)
      return { success: false, error: error.message }
    }
  }

  detectAuthType(authData) {
    if (authData.walletAddress || authData.signature) return 'wallet'
    if (authData.message && authData.signature) return 'signature'
    if (authData.idToken || authData.accessToken) return 'oauth'
    return 'fallback'
  }

  async authenticateWallet(authData) {
    try {
      let walletAddress = null
      let provider = null

      // Try embedded wallet first
      if (authData.embeddedWallet) {
        const result = await this.verifyEmbeddedWallet(authData.embeddedWallet)
        if (result.valid) {
          walletAddress = result.address
          provider = 'embedded_wallet'
        }
      }

      // Try SIWE
      if (!walletAddress && authData.signature && authData.message) {
        const result = await this.verifySIWE(authData)
        if (result.valid) {
          walletAddress = result.address
          provider = 'siwe'
        }
      }

      // Try Reown AppKit
      if (!walletAddress && authData.reownWallet) {
        const result = await this.verifyReownWallet(authData.reownWallet)
        if (result.valid) {
          walletAddress = result.address
          provider = 'reown'
        }
      }

      if (!walletAddress) {
        throw new Error('No valid wallet authentication found')
      }

      // Check for existing user or create new
      const user = await this.getOrCreateWalletUser(walletAddress, provider)
      
      return {
        success: true,
        user,
        provider,
        walletAddress,
        authType: 'wallet'
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async authenticateOAuth(authData) {
    try {
      // Google OAuth
      if (authData.idToken) {
        const result = await this.verifyGoogleToken(authData.idToken)
        if (result.valid) {
          const user = await this.getOrCreateOAuthUser(result.payload, 'google')
          return {
            success: true,
            user,
            provider: 'google',
            authType: 'oauth'
          }
        }
      }

      throw new Error('No valid OAuth authentication found')
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  async createUnifiedSession(authResult) {
    const sessionId = this.generateSessionId()
    const userId = authResult.walletAddress || `oauth:${authResult.user.id}`
    
    const session = {
      id: sessionId,
      userId,
      walletAddress: authResult.walletAddress || null,
      providers: [authResult.provider],
      primaryProvider: authResult.provider,
      metadata: {
        authType: authResult.authType,
        user: authResult.user,
        createdVia: authResult.provider
      },
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
      isActive: true
    }

    this.userSessions.set(sessionId, session)
    
    // Store in persistent storage
    await this.persistSession(session)
    
    return {
      success: true,
      session,
      user: authResult.user,
      requiresMigration: !authResult.walletAddress && this.options.enableProgressiveMigration
    }
  }

  /**
   * Progressive Migration System
   */
  queueForMigration(user) {
    if (!user.walletAddress) {
      this.migrationQueue.add(user.id)
      console.log(`User ${user.id} queued for wallet migration`)
    }
  }

  startMigrationWorker() {
    // Check migration queue every 30 seconds
    setInterval(() => {
      this.processMigrationQueue()
    }, 30000)
  }

  async processMigrationQueue() {
    if (this.migrationQueue.size === 0) return

    for (const userId of this.migrationQueue) {
      try {
        await this.attemptUserMigration(userId)
        this.migrationQueue.delete(userId)
      } catch (error) {
        console.warn(`Migration failed for user ${userId}:`, error)
        // Keep in queue for retry
      }
    }
  }

  async attemptUserMigration(userId) {
    // Check if user is online and has wallet capability
    const session = this.findSessionByUserId(userId)
    if (!session || !session.isActive) return

    // Check if browser supports embedded wallets
    if (typeof window !== 'undefined' && window.thirdweb) {
      // Prompt user for wallet creation/linking
      const migrationResult = await this.promptWalletMigration(userId)
      if (migrationResult.success) {
        await this.linkWalletToUser(userId, migrationResult.walletAddress)
      }
    }
  }

  async promptWalletMigration(userId) {
    // This would show a UI prompt to the user
    // For now, return a mock result
    return { success: false, reason: 'User declined migration' }
  }

  /**
   * Provider-specific verification methods
   */
  async verifyGoogleToken(idToken) {
    try {
      // In a real implementation, verify with Google's API
      // For now, decode the JWT (unsafe for production)
      const payload = JSON.parse(atob(idToken.split('.')[1]))
      
      return {
        valid: true,
        payload: {
          id: payload.sub,
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          verified_email: payload.email_verified
        }
      }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  async verifyEmbeddedWallet(walletData) {
    try {
      // Verify embedded wallet signature/proof
      if (walletData.address && walletData.proof) {
        // In real implementation, verify the proof
        return {
          valid: true,
          address: walletData.address,
          provider: 'thirdweb'
        }
      }
      return { valid: false, error: 'Invalid wallet data' }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  async verifySIWE(authData) {
    try {
      // Verify SIWE signature
      if (authData.message && authData.signature) {
        // In real implementation, use ethers or similar to verify
        const address = this.recoverAddressFromSignature(authData.message, authData.signature)
        return {
          valid: true,
          address,
          provider: 'siwe'
        }
      }
      return { valid: false, error: 'Invalid SIWE data' }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  async verifyReownWallet(walletData) {
    try {
      // Verify Reown AppKit wallet
      if (walletData.address && walletData.chainId) {
        return {
          valid: true,
          address: walletData.address,
          chainId: walletData.chainId,
          provider: 'reown'
        }
      }
      return { valid: false, error: 'Invalid Reown wallet data' }
    } catch (error) {
      return { valid: false, error: error.message }
    }
  }

  /**
   * User management methods
   */
  async getOrCreateWalletUser(walletAddress, provider) {
    // Check if user exists
    let user = await this.getUserByWallet(walletAddress)
    
    if (!user) {
      // Create new wallet user
      user = {
        id: walletAddress,
        walletAddress,
        providers: [provider],
        role: this.determineUserRole(walletAddress),
        createdAt: Date.now(),
        isWalletPrimary: true
      }
      
      await this.saveUser(user)
    } else {
      // Update providers if new
      if (!user.providers.includes(provider)) {
        user.providers.push(provider)
        await this.saveUser(user)
      }
    }
    
    return user
  }

  async getOrCreateOAuthUser(oauthPayload, provider) {
    // Check if user exists by email
    let user = await this.getUserByEmail(oauthPayload.email)
    
    if (!user) {
      // Create new OAuth user
      user = {
        id: `${provider}:${oauthPayload.id}`,
        email: oauthPayload.email,
        name: oauthPayload.name,
        picture: oauthPayload.picture,
        providers: [provider],
        role: this.determineUserRole(null, oauthPayload.email),
        createdAt: Date.now(),
        isWalletPrimary: false
      }
      
      await this.saveUser(user)
    }
    
    return user
  }

  determineUserRole(walletAddress, email) {
    // Super admin wallets
    const superAdminWallets = [
      '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
    ]
    
    // Admin emails
    const adminEmails = [
      'info@unamifoundation.org',
      'admin@beatschain.app',
      'support@beatschain.app'
    ]
    
    if (walletAddress && superAdminWallets.includes(walletAddress.toLowerCase())) {
      return 'super_admin'
    }
    
    if (email && adminEmails.includes(email.toLowerCase())) {
      return 'super_admin'
    }
    
    return 'user'
  }

  /**
   * Session management
   */
  async getSession(sessionId) {
    const session = this.userSessions.get(sessionId)
    if (!session || !session.isActive || session.expiresAt < Date.now()) {
      return null
    }
    return session
  }

  async refreshSession(sessionId) {
    const session = await this.getSession(sessionId)
    if (session) {
      session.expiresAt = Date.now() + (24 * 60 * 60 * 1000)
      await this.persistSession(session)
      return session
    }
    return null
  }

  async revokeSession(sessionId) {
    const session = this.userSessions.get(sessionId)
    if (session) {
      session.isActive = false
      this.userSessions.delete(sessionId)
      await this.removePersistedSession(sessionId)
    }
  }

  /**
   * Utility methods
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  recoverAddressFromSignature(message, signature) {
    // Mock implementation - use ethers.js in real implementation
    return '0x' + Math.random().toString(16).substr(2, 40)
  }

  findSessionByUserId(userId) {
    for (const session of this.userSessions.values()) {
      if (session.userId === userId && session.isActive) {
        return session
      }
    }
    return null
  }

  /**
   * Persistence methods (implement based on your storage solution)
   */
  async persistSession(session) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`wallet_bridge_session_${session.id}`, JSON.stringify(session))
    }
  }

  async removePersistedSession(sessionId) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`wallet_bridge_session_${sessionId}`)
    }
  }

  async getUserByWallet(walletAddress) {
    // Implement based on your user storage
    return null
  }

  async getUserByEmail(email) {
    // Implement based on your user storage
    return null
  }

  async saveUser(user) {
    // Implement based on your user storage
    console.log('Saving user:', user)
  }

  /**
   * Migration and linking methods
   */
  async linkWalletToUser(userId, walletAddress) {
    const user = await this.getUserById(userId)
    if (user) {
      user.walletAddress = walletAddress
      user.isWalletPrimary = true
      if (!user.providers.includes('embedded_wallet')) {
        user.providers.push('embedded_wallet')
      }
      await this.saveUser(user)
      
      console.log(`✅ Wallet ${walletAddress} linked to user ${userId}`)
      return true
    }
    return false
  }

  async getUserById(userId) {
    // Implement based on your user storage
    return null
  }

  /**
   * Public API methods
   */
  async signIn(authData) {
    return this.authenticate(authData)
  }

  async signOut(sessionId) {
    await this.revokeSession(sessionId)
    return { success: true }
  }

  async getCurrentUser(sessionId) {
    const session = await this.getSession(sessionId)
    return session ? session.metadata.user : null
  }

  async hasPermission(sessionId, permission) {
    const user = await this.getCurrentUser(sessionId)
    if (!user) return false
    
    // Implement permission checking based on user role
    const rolePermissions = {
      user: ['browse', 'purchase'],
      producer: ['browse', 'purchase', 'upload', 'dashboard'],
      admin: ['browse', 'purchase', 'upload', 'dashboard', 'admin_panel'],
      super_admin: ['*']
    }
    
    const permissions = rolePermissions[user.role] || []
    return permissions.includes('*') || permissions.includes(permission)
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WalletIdentityBridge }
} else if (typeof window !== 'undefined') {
  window.WalletIdentityBridge = WalletIdentityBridge
}