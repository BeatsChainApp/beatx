#!/usr/bin/env node

/**
 * BeatsChain MCP Agent - Automated System Management
 * Monitors and maintains MCP server health
 */

const { spawn } = require('child_process');
const fs = require('fs');

class MCPAgent {
  constructor() {
    this.serverUrl = 'https://beatschain-mcp-server-production.up.railway.app';
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.isRunning = false;
  }

  async healthCheck() {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(`${this.serverUrl}/healthz`, { timeout: 10000 });
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error.message);
      return false;
    }
  }

  async restartServer() {
    console.log('🔄 Attempting server restart...');
    // This would trigger Railway deployment restart
    // For now, just log the action
    console.log('📝 Server restart logged - manual intervention may be required');
  }

  async monitorSystem() {
    console.log('🤖 MCP Agent monitoring started');
    
    setInterval(async () => {
      const isHealthy = await this.healthCheck();
      
      if (!isHealthy) {
        console.log('❌ Health check failed - investigating...');
        await this.restartServer();
      } else {
        console.log('✅ System healthy');
      }
    }, this.checkInterval);
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.monitorSystem();
    }
  }

  stop() {
    this.isRunning = false;
  }
}

// Start agent if run directly
if (require.main === module) {
  const agent = new MCPAgent();
  agent.start();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down MCP Agent...');
    agent.stop();
    process.exit(0);
  });
}

module.exports = MCPAgent;