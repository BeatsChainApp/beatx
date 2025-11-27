/**
 * MCP Client - BeatsChain MCP Server Integration
 * Connects extension to centralized MCP server for secure operations
 */

class MCPClient {
  constructor(baseUrl) {
    const defaultUrl = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_MCP_SERVER_URL || process.env.MCP_SERVER_URL)) ||
      (typeof window !== 'undefined' && window.__MCP_SERVER_URL__) ||
      'http://localhost:4000';
    this.baseUrl = baseUrl || defaultUrl;
    this.sessionToken = null;
    this.loadSession();
  }

  // Load session from storage
  loadSession() {
    try {
      const stored = localStorage.getItem('mcp_session');
      if (stored) {
        const session = JSON.parse(stored);
        if (session.expiresAt > Date.now()) {
          this.sessionToken = session.token;
        } else {
          localStorage.removeItem('mcp_session');
        }
      }
    } catch (error) {
      console.error('Load session error:', error);
    }
  }

  // Create session via token exchange
  async createSession(idToken) {
    try {
      const response = await fetch(`${this.baseUrl}/api/token-exchange`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });

      if (!response.ok) throw new Error('Token exchange failed');

      const session = await response.json();
      
      // Store session with expiration
      const sessionData = {
        token: session.sessionToken,
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      };
      
      localStorage.setItem('mcp_session', JSON.stringify(sessionData));
      this.sessionToken = session.sessionToken;
      
      return session;
    } catch (error) {
      console.error('Create session error:', error);
      throw error;
    }
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.sessionToken) {
      headers.Authorization = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // Generate ISRC via MCP
  async generateISRC(metadata) {
    return this.request('/api/isrc/generate', {
      method: 'POST',
      body: JSON.stringify(metadata)
    });
  }

  // Pin content to IPFS via MCP
  async pinContent(content) {
    return this.request('/api/pin', {
      method: 'POST',
      body: JSON.stringify(content)
    });
  }

  // Upload file via MCP
  async uploadFile(file, metadata = {}) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(metadata));

    return fetch(`${this.baseUrl}/api/upload`, {
      method: 'POST',
      headers: this.sessionToken ? {
        'Authorization': `Bearer ${this.sessionToken}`
      } : {},
      body: formData
    }).then(res => res.json());
  }

  // Gasless mint via MCP
  async gaslessMint(mintData) {
    return this.request('/api/thirdweb/mint', {
      method: 'POST',
      body: JSON.stringify(mintData)
    });
  }

  // Check gasless mint status
  async checkGaslessStatus(address) {
    return this.request('/api/thirdweb/status', {
      method: 'POST',
      body: JSON.stringify({ address })
    });
  }

  // Livepeer upload
  async livepeerUpload(fileOrCid, metadata = {}) {
    if (typeof fileOrCid === 'string') {
      // IPFS CID
      return this.request('/api/livepeer/upload', {
        method: 'POST',
        body: JSON.stringify({ ipfsCid: fileOrCid, ...metadata })
      });
    } else {
      // File upload
      const formData = new FormData();
      formData.append('file', fileOrCid);
      formData.append('metadata', JSON.stringify(metadata));

      return fetch(`${this.baseUrl}/api/livepeer/upload-file`, {
        method: 'POST',
        headers: this.sessionToken ? {
          'Authorization': `Bearer ${this.sessionToken}`
        } : {},
        body: formData
      }).then(res => res.json());
    }
  }

  // Get analytics
  async getAnalytics(type, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/analytics/${type}?${query}`);
  }

  // Get notifications
  async getNotifications(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/api/notifications?${query}`);
  }
}

// Global instance
window.MCPClient = window.MCPClient || new MCPClient();