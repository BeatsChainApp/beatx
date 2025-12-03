/**
 * WhatsApp Integration Bridge
 * Connects WhatsApp users to the unified auth system
 */

class WhatsAppBridge {
  constructor(walletBridge) {
    this.walletBridge = walletBridge
    this.whatsappSessions = new Map()
    this.pendingVerifications = new Map()
    this.initialized = false
  }

  async initialize() {
    if (this.initialized) return true

    try {
      // Setup WhatsApp webhook handlers
      this.setupWebhookHandlers()
      
      // Initialize session management
      this.setupSessionManagement()
      
      this.initialized = true
      console.log('✅ WhatsApp Bridge initialized')
      return true
    } catch (error) {
      console.error('❌ WhatsApp Bridge initialization failed:', error)
      return false
    }
  }

  setupWebhookHandlers() {
    // These would be registered with your WhatsApp webhook endpoint
    this.webhookHandlers = {
      'message': this.handleIncomingMessage.bind(this),
      'status': this.handleMessageStatus.bind(this),
      'verification': this.handleVerificationRequest.bind(this)
    }
  }

  setupSessionManagement() {
    this.sessionSchema = {
      whatsappId: 'string',
      phoneNumber: 'string',
      walletAddress: 'string', // Linked wallet
      sessionId: 'string', // Bridge session ID
      verificationStatus: 'pending|verified|failed',
      createdAt: 'timestamp',
      lastActivity: 'timestamp'
    }
  }

  /**
   * Handle incoming WhatsApp messages
   */
  async handleIncomingMessage(messageData) {
    try {
      const { from, body, type } = messageData
      
      // Check if user has existing session
      let whatsappSession = this.whatsappSessions.get(from)
      
      if (!whatsappSession) {
        // Create new WhatsApp session
        whatsappSession = await this.createWhatsAppSession(from)
      }
      
      // Update last activity
      whatsappSession.lastActivity = Date.now()
      
      // Process message based on content
      if (body.toLowerCase().includes('connect wallet')) {
        return this.initiateWalletConnection(whatsappSession)
      } else if (body.toLowerCase().includes('verify')) {
        return this.processVerification(whatsappSession, body)
      } else if (body.toLowerCase().includes('buy') || body.toLowerCase().includes('purchase')) {
        return this.initiatePurchase(whatsappSession, body)
      } else {
        return this.sendWelcomeMessage(whatsappSession)
      }
    } catch (error) {
      console.error('WhatsApp message handling failed:', error)
      return this.sendErrorMessage(messageData.from)
    }
  }

  async createWhatsAppSession(whatsappId) {
    const session = {
      whatsappId,
      phoneNumber: this.extractPhoneNumber(whatsappId),
      walletAddress: null,
      sessionId: null,
      verificationStatus: 'pending',
      createdAt: Date.now(),
      lastActivity: Date.now()
    }
    
    this.whatsappSessions.set(whatsappId, session)
    return session
  }

  /**
   * Wallet connection flow
   */
  async initiateWalletConnection(whatsappSession) {
    try {
      // Generate verification code
      const verificationCode = this.generateVerificationCode()
      
      // Store pending verification
      this.pendingVerifications.set(verificationCode, {
        whatsappId: whatsappSession.whatsappId,
        expiresAt: Date.now() + (10 * 60 * 1000), // 10 minutes
        type: 'wallet_connection'
      })
      
      // Send connection instructions
      const message = `🔗 *Connect Your Wallet to BeatsChain*\n\n` +
        `To connect your wallet:\n` +
        `1. Open BeatsChain app: https://beatschain.app\n` +
        `2. Go to Profile → WhatsApp Integration\n` +
        `3. Enter this code: *${verificationCode}*\n\n` +
        `⏰ Code expires in 10 minutes\n` +
        `💡 This links your WhatsApp to your wallet for easy purchases`
      
      return this.sendWhatsAppMessage(whatsappSession.whatsappId, message)
    } catch (error) {
      console.error('Wallet connection initiation failed:', error)
      return this.sendErrorMessage(whatsappSession.whatsappId)
    }
  }

  async processVerification(whatsappSession, messageBody) {
    try {
      // Extract verification code from message
      const codeMatch = messageBody.match(/\b\d{6}\b/)
      if (!codeMatch) {
        return this.sendWhatsAppMessage(
          whatsappSession.whatsappId,
          '❌ Please send a valid 6-digit verification code'
        )
      }
      
      const code = codeMatch[0]
      const verification = this.pendingVerifications.get(code)
      
      if (!verification) {
        return this.sendWhatsAppMessage(
          whatsappSession.whatsappId,
          '❌ Invalid or expired verification code. Please request a new one.'
        )
      }
      
      if (verification.expiresAt < Date.now()) {
        this.pendingVerifications.delete(code)
        return this.sendWhatsAppMessage(
          whatsappSession.whatsappId,
          '⏰ Verification code expired. Please request a new one.'
        )
      }
      
      // Mark as verified
      whatsappSession.verificationStatus = 'verified'
      this.pendingVerifications.delete(code)
      
      return this.sendWhatsAppMessage(
        whatsappSession.whatsappId,
        '✅ *Wallet Connected Successfully!*\n\n' +
        'You can now:\n' +
        '• Buy beats directly via WhatsApp\n' +
        '• Get notifications about new releases\n' +
        '• Access your purchase history\n\n' +
        'Type "help" for available commands'
      )
    } catch (error) {
      console.error('Verification processing failed:', error)
      return this.sendErrorMessage(whatsappSession.whatsappId)
    }
  }

  /**
   * Purchase flow via WhatsApp
   */
  async initiatePurchase(whatsappSession, messageBody) {
    try {
      if (whatsappSession.verificationStatus !== 'verified') {
        return this.sendWhatsAppMessage(
          whatsappSession.whatsappId,
          '🔒 Please connect your wallet first by typing "connect wallet"'
        )
      }
      
      // Extract beat ID or search term
      const beatId = this.extractBeatId(messageBody)
      
      if (beatId) {
        return this.processBeatPurchase(whatsappSession, beatId)
      } else {
        return this.sendBeatCatalog(whatsappSession)
      }
    } catch (error) {
      console.error('Purchase initiation failed:', error)
      return this.sendErrorMessage(whatsappSession.whatsappId)
    }
  }

  async processBeatPurchase(whatsappSession, beatId) {
    try {
      // Get beat information from MCP server
      const beatInfo = await this.getBeatInfo(beatId)
      
      if (!beatInfo) {
        return this.sendWhatsAppMessage(
          whatsappSession.whatsappId,
          '❌ Beat not found. Please check the ID and try again.'
        )
      }
      
      // Generate purchase link with WhatsApp session
      const purchaseLink = await this.generatePurchaseLink(whatsappSession, beatInfo)
      
      const message = `🎵 *${beatInfo.title}*\n` +
        `👤 by ${beatInfo.artist}\n` +
        `💰 Price: R${beatInfo.price}\n` +
        `⏱️ Duration: ${this.formatDuration(beatInfo.duration)}\n\n` +
        `🛒 Complete your purchase:\n${purchaseLink}\n\n` +
        `💡 This link is secure and expires in 30 minutes`
      
      return this.sendWhatsAppMessage(whatsappSession.whatsappId, message)
    } catch (error) {
      console.error('Beat purchase processing failed:', error)
      return this.sendErrorMessage(whatsappSession.whatsappId)
    }
  }

  async sendBeatCatalog(whatsappSession) {
    try {
      // Get featured beats from MCP server
      const featuredBeats = await this.getFeaturedBeats()
      
      let message = '🎵 *Featured Beats*\n\n'
      
      featuredBeats.slice(0, 5).forEach((beat, index) => {
        message += `${index + 1}. *${beat.title}* by ${beat.artist}\n` +
          `   💰 R${beat.price} • ⏱️ ${this.formatDuration(beat.duration)}\n` +
          `   ID: ${beat.id}\n\n`
      })
      
      message += `To buy a beat, type: "buy [beat ID]"\n` +
        `Example: "buy ${featuredBeats[0]?.id}"\n\n` +
        `🔍 Browse all beats: https://beatschain.app/marketplace`
      
      return this.sendWhatsAppMessage(whatsappSession.whatsappId, message)
    } catch (error) {
      console.error('Beat catalog sending failed:', error)
      return this.sendErrorMessage(whatsappSession.whatsappId)
    }
  }

  /**
   * Integration with main auth system
   */
  async linkWhatsAppToWallet(verificationCode, walletAddress, sessionId) {
    try {
      const verification = this.pendingVerifications.get(verificationCode)
      
      if (!verification || verification.expiresAt < Date.now()) {
        return { success: false, error: 'Invalid or expired code' }
      }
      
      const whatsappSession = this.whatsappSessions.get(verification.whatsappId)
      if (!whatsappSession) {
        return { success: false, error: 'WhatsApp session not found' }
      }
      
      // Link wallet to WhatsApp session
      whatsappSession.walletAddress = walletAddress
      whatsappSession.sessionId = sessionId
      whatsappSession.verificationStatus = 'verified'
      
      // Remove pending verification
      this.pendingVerifications.delete(verificationCode)
      
      // Store the link persistently
      await this.persistWhatsAppLink(whatsappSession)
      
      return { success: true, whatsappSession }
    } catch (error) {
      console.error('WhatsApp wallet linking failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Utility methods
   */
  generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  extractPhoneNumber(whatsappId) {
    // Extract phone number from WhatsApp ID format
    return whatsappId.replace('@c.us', '')
  }

  extractBeatId(messageBody) {
    // Extract beat ID from message (various formats)
    const patterns = [
      /buy\s+([a-zA-Z0-9-_]+)/i,
      /purchase\s+([a-zA-Z0-9-_]+)/i,
      /id[:\s]+([a-zA-Z0-9-_]+)/i
    ]
    
    for (const pattern of patterns) {
      const match = messageBody.match(pattern)
      if (match) return match[1]
    }
    
    return null
  }

  formatDuration(seconds) {
    if (!seconds) return 'Unknown'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  async generatePurchaseLink(whatsappSession, beatInfo) {
    // Generate secure purchase link with WhatsApp context
    const purchaseToken = this.generatePurchaseToken(whatsappSession, beatInfo)
    return `https://beatschain.app/purchase/${beatInfo.id}?whatsapp=${purchaseToken}`
  }

  generatePurchaseToken(whatsappSession, beatInfo) {
    // Generate secure token for WhatsApp purchase
    const data = {
      whatsappId: whatsappSession.whatsappId,
      beatId: beatInfo.id,
      expiresAt: Date.now() + (30 * 60 * 1000) // 30 minutes
    }
    
    // In production, use proper JWT signing
    return btoa(JSON.stringify(data))
  }

  /**
   * External API methods
   */
  async getBeatInfo(beatId) {
    try {
      const mcpUrl = process.env.MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/beats/${beatId}`)
      
      if (response.ok) {
        const data = await response.json()
        return data.beat
      }
      
      return null
    } catch (error) {
      console.error('Beat info fetch failed:', error)
      return null
    }
  }

  async getFeaturedBeats() {
    try {
      const mcpUrl = process.env.MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/beats?featured=true&limit=5`)
      
      if (response.ok) {
        const data = await response.json()
        return data.beats || []
      }
      
      return []
    } catch (error) {
      console.error('Featured beats fetch failed:', error)
      return []
    }
  }

  async sendWhatsAppMessage(whatsappId, message) {
    try {
      // In production, integrate with WhatsApp Business API
      console.log(`WhatsApp message to ${whatsappId}:`, message)
      
      // Mock successful send
      return { success: true, messageId: `msg_${Date.now()}` }
    } catch (error) {
      console.error('WhatsApp message send failed:', error)
      return { success: false, error: error.message }
    }
  }

  async sendErrorMessage(whatsappId) {
    const message = '❌ Something went wrong. Please try again or contact support.\n\n' +
      '💬 For help, visit: https://beatschain.app/support'
    
    return this.sendWhatsAppMessage(whatsappId, message)
  }

  async sendWelcomeMessage(whatsappSession) {
    const message = `🎵 *Welcome to BeatsChain!*\n\n` +
      `Available commands:\n` +
      `• "connect wallet" - Link your wallet\n` +
      `• "buy [beat ID]" - Purchase a beat\n` +
      `• "catalog" - Browse featured beats\n` +
      `• "help" - Show this menu\n\n` +
      `🌐 Visit: https://beatschain.app`
    
    return this.sendWhatsAppMessage(whatsappSession.whatsappId, message)
  }

  /**
   * Persistence methods
   */
  async persistWhatsAppLink(whatsappSession) {
    // Store WhatsApp-wallet link persistently
    if (typeof localStorage !== 'undefined') {
      const key = `whatsapp_link_${whatsappSession.whatsappId}`
      localStorage.setItem(key, JSON.stringify(whatsappSession))
    }
  }

  async getWhatsAppLink(whatsappId) {
    if (typeof localStorage !== 'undefined') {
      const key = `whatsapp_link_${whatsappId}`
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : null
    }
    return null
  }

  /**
   * Public API methods
   */
  async verifyWhatsAppCode(code, walletAddress, sessionId) {
    return this.linkWhatsAppToWallet(code, walletAddress, sessionId)
  }

  async getWhatsAppSession(whatsappId) {
    return this.whatsappSessions.get(whatsappId)
  }

  async isWhatsAppLinked(whatsappId) {
    const session = this.whatsappSessions.get(whatsappId)
    return session && session.verificationStatus === 'verified'
  }
}

// Export for both CommonJS and ES modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WhatsAppBridge }
} else if (typeof window !== 'undefined') {
  window.WhatsAppBridge = WhatsAppBridge
}