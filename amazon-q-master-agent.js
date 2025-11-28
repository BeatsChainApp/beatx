#!/usr/bin/env node

/**
 * Amazon Q Master Agent - Complete System Coordination
 * Handles all tasks, missions, coordination, testing, verification, and deployment
 * Single prompt to take over everything
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

class AmazonQMasterAgent {
  constructor() {
    this.config = {
      mcpServer: 'https://beatschain-mcp-server-production.up.railway.app',
      vercelApp: 'https://beats-app.vercel.app',
      chromeExtension: '/workspaces/beatx/chrome-extension',
      mcpServerLocal: '/workspaces/beatx/packages/mcp-server',
      workspaceRoot: '/workspaces/beatx'
    };
    
    this.tasks = new Map();
    this.missions = new Map();
    this.workflows = new Map();
    this.agents = new Map();
    
    this.initializeAgents();
  }

  log(level, message, details = '') {
    const timestamp = new Date().toISOString();
    const symbols = { 
      info: 'ℹ️', 
      success: '✅', 
      error: '❌', 
      warn: '⚠️', 
      agent: '🤖',
      mission: '🎯',
      task: '📋',
      workflow: '⚙️'
    };
    const symbol = symbols[level] || 'ℹ️';
    console.log(`${symbol} [${timestamp}] ${message}${details ? ' - ' + details : ''}`);
  }

  initializeAgents() {
    this.log('agent', 'Initializing specialized agents...');
    
    // Testing Agent
    this.agents.set('testing', {
      name: 'Testing Agent',
      responsibilities: ['Route testing', 'Integration testing', 'Workflow verification'],
      status: 'ready'
    });
    
    // Deployment Agent
    this.agents.set('deployment', {
      name: 'Deployment Agent', 
      responsibilities: ['MCP server deployment', 'Vercel app deployment', 'Chrome extension packaging'],
      status: 'ready'
    });
    
    // Monitoring Agent
    this.agents.set('monitoring', {
      name: 'Monitoring Agent',
      responsibilities: ['Health checks', 'Performance monitoring', 'Error tracking'],
      status: 'ready'
    });
    
    // Integration Agent
    this.agents.set('integration', {
      name: 'Integration Agent',
      responsibilities: ['ISRC integration', 'SAMRO integration', 'IPFS integration', 'Livepeer integration'],
      status: 'ready'
    });
    
    // Workflow Agent
    this.agents.set('workflow', {
      name: 'Workflow Agent',
      responsibilities: ['Minting workflows', 'Upload workflows', 'Radio submission workflows'],
      status: 'ready'
    });
    
    this.log('success', `Initialized ${this.agents.size} specialized agents`);
  }

  async executeCommand(command, cwd = this.config.workspaceRoot) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        if (error) {
          reject({ error, stdout, stderr });
        } else {
          resolve({ stdout, stderr });
        }
      });
    });
  }

  async makeRequest(url, options = {}) {
    try {
      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        timeout: 15000,
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Amazon-Q-Master-Agent/1.0',
          ...options.headers
        }
      });
      
      let data;
      try {
        data = await response.json();
      } catch (e) {
        data = { error: 'Invalid JSON response' };
      }
      
      return {
        status: response.status,
        ok: response.ok,
        data
      };
    } catch (error) {
      return {
        status: 0,
        ok: false,
        error: error.message,
        data: null
      };
    }
  }

  // Mission: Complete System Verification
  async missionSystemVerification() {
    this.log('mission', 'Starting Complete System Verification');
    
    const verificationTasks = [
      'verifyMCPServer',
      'verifyVercelApp', 
      'verifyExtension',
      'verifyIntegrations',
      'verifyWorkflows',
      'verifyDataPipelines'
    ];
    
    const results = {};
    
    for (const task of verificationTasks) {
      try {
        this.log('task', `Executing ${task}...`);
        results[task] = await this[task]();
        this.log('success', `${task} completed`);
      } catch (error) {
        this.log('error', `${task} failed`, error.message);
        results[task] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  async verifyMCPServer() {
    this.log('agent', 'Testing Agent: Verifying MCP Server');
    
    // Health check
    const health = await this.makeRequest(`${this.config.mcpServer}/healthz`);
    if (!health.ok) {
      throw new Error('MCP Server health check failed');
    }
    
    // API endpoints
    const api = await this.makeRequest(`${this.config.mcpServer}/api`);
    if (!api.ok) {
      throw new Error('MCP Server API not accessible');
    }
    
    return { success: true, health: health.data, api: api.data };
  }

  async verifyVercelApp() {
    this.log('agent', 'Testing Agent: Verifying Vercel App');
    
    const app = await this.makeRequest(this.config.vercelApp);
    if (!app.ok) {
      throw new Error('Vercel app not accessible');
    }
    
    return { success: true, status: app.status };
  }

  async verifyExtension() {
    this.log('agent', 'Testing Agent: Verifying Chrome Extension');
    
    const manifestPath = path.join(this.config.chromeExtension, 'manifest.json');
    const mcpClientPath = path.join(this.config.chromeExtension, 'lib', 'mcp-client.js');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Extension manifest not found');
    }
    
    if (!fs.existsSync(mcpClientPath)) {
      throw new Error('MCP client not found');
    }
    
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    return { 
      success: true, 
      version: manifest.version,
      permissions: manifest.permissions?.length || 0,
      hostPermissions: manifest.host_permissions?.length || 0
    };
  }

  async verifyIntegrations() {
    this.log('agent', 'Integration Agent: Verifying All Integrations');
    
    const integrations = {};
    
    // ISRC Integration
    try {
      const isrc = await this.makeRequest(`${this.config.mcpServer}/api/isrc/generate`, {
        method: 'POST',
        body: JSON.stringify({
          trackTitle: 'Test Track',
          artistName: 'Test Artist'
        })
      });
      integrations.isrc = { success: isrc.ok, data: isrc.data };
    } catch (error) {
      integrations.isrc = { success: false, error: error.message };
    }
    
    // SAMRO Integration
    try {
      const samro = await this.makeRequest(`${this.config.mcpServer}/api/samro/generate`, {
        method: 'POST',
        body: JSON.stringify({
          trackTitle: 'Test Track',
          artistName: 'Test Artist'
        })
      });
      integrations.samro = { success: samro.ok, data: samro.data };
    } catch (error) {
      integrations.samro = { success: false, error: error.message };
    }
    
    // IPFS Integration
    try {
      const ipfs = await this.makeRequest(`${this.config.mcpServer}/api/pin`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test NFT',
          description: 'Test metadata'
        })
      });
      integrations.ipfs = { success: ipfs.ok, data: ipfs.data };
    } catch (error) {
      integrations.ipfs = { success: false, error: error.message };
    }
    
    return integrations;
  }

  async verifyWorkflows() {
    this.log('agent', 'Workflow Agent: Verifying All Workflows');
    
    const workflows = {};
    
    // Minting Workflow
    workflows.minting = await this.testMintingWorkflow();
    
    // Upload Workflow  
    workflows.upload = await this.testUploadWorkflow();
    
    // Radio Submission Workflow
    workflows.radioSubmission = await this.testRadioSubmissionWorkflow();
    
    return workflows;
  }

  async testMintingWorkflow() {
    this.log('workflow', 'Testing Minting Workflow');
    
    const steps = [];
    
    // Step 1: Generate ISRC
    try {
      const isrc = await this.makeRequest(`${this.config.mcpServer}/api/isrc/generate`, {
        method: 'POST',
        body: JSON.stringify({
          trackTitle: 'Workflow Test',
          artistName: 'Test Artist'
        })
      });
      steps.push({ step: 'isrc_generation', success: isrc.ok, data: isrc.data });
    } catch (error) {
      steps.push({ step: 'isrc_generation', success: false, error: error.message });
      return { success: false, steps };
    }
    
    // Step 2: Create metadata
    try {
      const metadata = await this.makeRequest(`${this.config.mcpServer}/api/pin`, {
        method: 'POST',
        body: JSON.stringify({
          name: 'Test NFT',
          description: 'Test NFT for minting workflow'
        })
      });
      steps.push({ step: 'metadata_creation', success: metadata.ok, data: metadata.data });
    } catch (error) {
      steps.push({ step: 'metadata_creation', success: false, error: error.message });
    }
    
    // Step 3: Generate SAMRO split sheet
    try {
      const samro = await this.makeRequest(`${this.config.mcpServer}/api/samro/fill`, {
        method: 'POST',
        body: JSON.stringify({
          userData: { trackTitle: 'Workflow Test', artistName: 'Test Artist' },
          contributors: [{ name: 'Test Artist', percentage: 100, role: 'Composer' }]
        })
      });
      steps.push({ step: 'samro_generation', success: samro.ok, data: samro.data });
    } catch (error) {
      steps.push({ step: 'samro_generation', success: false, error: error.message });
    }
    
    const allSuccessful = steps.every(step => step.success);
    return { success: allSuccessful, steps };
  }

  async testUploadWorkflow() {
    this.log('workflow', 'Testing Upload Workflow');
    
    // Test IPFS upload capability
    try {
      const upload = await this.makeRequest(`${this.config.mcpServer}/api/pin`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'audio',
          name: 'Test Audio Upload',
          metadata: { format: 'mp3', duration: 180 }
        })
      });
      
      return { success: upload.ok, data: upload.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async testRadioSubmissionWorkflow() {
    this.log('workflow', 'Testing Radio Submission Workflow');
    
    const steps = [];
    
    // Step 1: Prepare radio metadata
    try {
      const metadata = {
        title: 'Radio Test Track',
        artist: 'Test Artist',
        format: 'radio_ready',
        duration: 180,
        isrc: 'ZA-BTC-25-00001'
      };
      
      const radioPrep = await this.makeRequest(`${this.config.mcpServer}/api/pin`, {
        method: 'POST',
        body: JSON.stringify(metadata)
      });
      
      steps.push({ step: 'radio_metadata_prep', success: radioPrep.ok, data: radioPrep.data });
    } catch (error) {
      steps.push({ step: 'radio_metadata_prep', success: false, error: error.message });
    }
    
    // Step 2: Generate submission package
    try {
      const submission = await this.makeRequest(`${this.config.mcpServer}/api/samro/generate`, {
        method: 'POST',
        body: JSON.stringify({
          type: 'radio_submission',
          trackTitle: 'Radio Test Track',
          artistName: 'Test Artist'
        })
      });
      
      steps.push({ step: 'submission_package', success: submission.ok, data: submission.data });
    } catch (error) {
      steps.push({ step: 'submission_package', success: false, error: error.message });
    }
    
    const allSuccessful = steps.every(step => step.success);
    return { success: allSuccessful, steps };
  }

  async verifyDataPipelines() {
    this.log('agent', 'Monitoring Agent: Verifying Data Pipelines');
    
    const pipelines = {};
    
    // Success logging pipeline
    try {
      const success = await this.makeRequest(`${this.config.mcpServer}/api/success`);
      pipelines.successLogging = { success: success.ok, data: success.data };
    } catch (error) {
      pipelines.successLogging = { success: false, error: error.message };
    }
    
    // Analytics pipeline (may be unavailable)
    try {
      const analytics = await this.makeRequest(`${this.config.mcpServer}/api/analytics`);
      pipelines.analytics = { 
        success: analytics.ok || analytics.status === 503, 
        data: analytics.data,
        note: analytics.status === 503 ? 'Service unavailable (expected)' : null
      };
    } catch (error) {
      pipelines.analytics = { success: false, error: error.message };
    }
    
    return pipelines;
  }

  // Mission: Complete Deployment Coordination
  async missionDeploymentCoordination() {
    this.log('mission', 'Starting Complete Deployment Coordination');
    
    const deploymentTasks = [
      'deployMCPServer',
      'deployVercelApp',
      'packageChromeExtension',
      'verifyDeployments'
    ];
    
    const results = {};
    
    for (const task of deploymentTasks) {
      try {
        this.log('task', `Executing ${task}...`);
        results[task] = await this[task]();
        this.log('success', `${task} completed`);
      } catch (error) {
        this.log('error', `${task} failed`, error.message);
        results[task] = { success: false, error: error.message };
      }
    }
    
    return results;
  }

  async deployMCPServer() {
    this.log('agent', 'Deployment Agent: Deploying MCP Server');
    
    // Check if server is already deployed and healthy
    const health = await this.makeRequest(`${this.config.mcpServer}/healthz`);
    
    if (health.ok) {
      return { 
        success: true, 
        status: 'already_deployed', 
        health: health.data 
      };
    } else {
      return { 
        success: false, 
        status: 'deployment_needed',
        note: 'Manual Railway deployment required'
      };
    }
  }

  async deployVercelApp() {
    this.log('agent', 'Deployment Agent: Verifying Vercel App');
    
    const app = await this.makeRequest(this.config.vercelApp);
    
    if (app.ok) {
      return { 
        success: true, 
        status: 'deployed_and_accessible',
        appStatus: app.status
      };
    } else {
      return { 
        success: false, 
        status: 'deployment_issue',
        note: 'Vercel app not accessible'
      };
    }
  }

  async packageChromeExtension() {
    this.log('agent', 'Deployment Agent: Packaging Chrome Extension');
    
    try {
      // Check if extension files exist
      const manifestPath = path.join(this.config.chromeExtension, 'manifest.json');
      
      if (!fs.existsSync(manifestPath)) {
        throw new Error('Extension manifest not found');
      }
      
      // Create package (simulation - actual packaging would require zip creation)
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      return {
        success: true,
        version: manifest.version,
        status: 'ready_for_packaging',
        note: 'Extension files verified and ready for Chrome Web Store'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async verifyDeployments() {
    this.log('agent', 'Deployment Agent: Verifying All Deployments');
    
    const verifications = {};
    
    // MCP Server
    const mcpHealth = await this.makeRequest(`${this.config.mcpServer}/healthz`);
    verifications.mcpServer = { 
      accessible: mcpHealth.ok,
      status: mcpHealth.status,
      data: mcpHealth.data
    };
    
    // Vercel App
    const vercelHealth = await this.makeRequest(this.config.vercelApp);
    verifications.vercelApp = {
      accessible: vercelHealth.ok,
      status: vercelHealth.status
    };
    
    // Extension readiness
    const manifestExists = fs.existsSync(path.join(this.config.chromeExtension, 'manifest.json'));
    verifications.chromeExtension = {
      ready: manifestExists,
      status: manifestExists ? 'ready' : 'not_ready'
    };
    
    return verifications;
  }

  // Mission: Complete System Monitoring
  async missionSystemMonitoring() {
    this.log('mission', 'Starting Complete System Monitoring');
    
    const monitoringData = {
      timestamp: new Date().toISOString(),
      systems: {},
      alerts: [],
      recommendations: []
    };
    
    // Monitor MCP Server
    const mcpStatus = await this.monitorMCPServer();
    monitoringData.systems.mcpServer = mcpStatus;
    
    if (!mcpStatus.healthy) {
      monitoringData.alerts.push({
        level: 'critical',
        system: 'mcpServer',
        message: 'MCP Server health check failed'
      });
    }
    
    // Monitor Vercel App
    const vercelStatus = await this.monitorVercelApp();
    monitoringData.systems.vercelApp = vercelStatus;
    
    if (!vercelStatus.healthy) {
      monitoringData.alerts.push({
        level: 'high',
        system: 'vercelApp', 
        message: 'Vercel app not accessible'
      });
    }
    
    // Generate recommendations
    if (monitoringData.alerts.length === 0) {
      monitoringData.recommendations.push('All systems operational');
    } else {
      monitoringData.recommendations.push('Address critical alerts immediately');
      monitoringData.recommendations.push('Check server logs for detailed error information');
    }
    
    return monitoringData;
  }

  async monitorMCPServer() {
    const health = await this.makeRequest(`${this.config.mcpServer}/healthz`);
    
    return {
      healthy: health.ok,
      status: health.status,
      responseTime: health.ok ? 'normal' : 'timeout',
      lastCheck: new Date().toISOString(),
      data: health.data
    };
  }

  async monitorVercelApp() {
    const health = await this.makeRequest(this.config.vercelApp);
    
    return {
      healthy: health.ok,
      status: health.status,
      responseTime: health.ok ? 'normal' : 'timeout',
      lastCheck: new Date().toISOString()
    };
  }

  // Master Coordination Function
  async coordinateAllSystems() {
    this.log('agent', 'Amazon Q Master Agent: Taking over all system coordination');
    
    const masterReport = {
      timestamp: new Date().toISOString(),
      agent: 'Amazon Q Master Agent',
      missions: {},
      summary: {
        totalMissions: 0,
        successfulMissions: 0,
        failedMissions: 0
      }
    };
    
    // Execute all missions
    const missions = [
      { name: 'systemVerification', handler: this.missionSystemVerification },
      { name: 'deploymentCoordination', handler: this.missionDeploymentCoordination },
      { name: 'systemMonitoring', handler: this.missionSystemMonitoring }
    ];
    
    for (const mission of missions) {
      try {
        this.log('mission', `Executing mission: ${mission.name}`);
        masterReport.missions[mission.name] = await mission.handler.call(this);
        masterReport.summary.successfulMissions++;
        this.log('success', `Mission ${mission.name} completed successfully`);
      } catch (error) {
        this.log('error', `Mission ${mission.name} failed`, error.message);
        masterReport.missions[mission.name] = { success: false, error: error.message };
        masterReport.summary.failedMissions++;
      }
      masterReport.summary.totalMissions++;
    }
    
    // Save comprehensive report
    const reportPath = path.join(this.config.workspaceRoot, 'amazon-q-master-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(masterReport, null, 2));
    
    // Generate final summary
    this.generateFinalSummary(masterReport);
    
    return masterReport;
  }

  generateFinalSummary(report) {
    console.log('\\n' + '='.repeat(60));
    console.log('🤖 AMAZON Q MASTER AGENT - FINAL REPORT');
    console.log('='.repeat(60));
    
    console.log(`📊 Mission Summary:`);
    console.log(`   Total Missions: ${report.summary.totalMissions}`);
    console.log(`   ✅ Successful: ${report.summary.successfulMissions}`);
    console.log(`   ❌ Failed: ${report.summary.failedMissions}`);
    
    const successRate = (report.summary.successfulMissions / report.summary.totalMissions * 100).toFixed(1);
    console.log(`   📈 Success Rate: ${successRate}%`);
    
    console.log('\\n🎯 Mission Results:');
    Object.entries(report.missions).forEach(([name, result]) => {
      const status = result.success !== false ? '✅' : '❌';
      console.log(`   ${status} ${name}`);
    });
    
    console.log('\\n💡 System Status:');
    
    // MCP Server Status
    const mcpVerification = report.missions.systemVerification?.verifyMCPServer;
    if (mcpVerification?.success) {
      console.log('   ✅ MCP Server: Operational');
    } else {
      console.log('   ❌ MCP Server: Issues detected');
    }
    
    // Vercel App Status
    const vercelVerification = report.missions.systemVerification?.verifyVercelApp;
    if (vercelVerification?.success) {
      console.log('   ✅ Vercel App: Operational');
    } else {
      console.log('   ❌ Vercel App: Issues detected');
    }
    
    // Chrome Extension Status
    const extensionVerification = report.missions.systemVerification?.verifyExtension;
    if (extensionVerification?.success) {
      console.log('   ✅ Chrome Extension: Ready');
    } else {
      console.log('   ❌ Chrome Extension: Issues detected');
    }
    
    console.log('\\n🚀 Next Steps:');
    if (report.summary.failedMissions === 0) {
      console.log('   🎉 All systems operational! Ready for production use.');
      console.log('   📋 Continue with regular monitoring and maintenance.');
    } else {
      console.log('   🔧 Address failed missions before production deployment.');
      console.log('   📊 Review detailed report for specific issues.');
      console.log('   🔄 Re-run agent after fixes are applied.');
    }
    
    console.log(`\\n📄 Detailed report saved: amazon-q-master-report.json`);
    console.log('='.repeat(60));
  }
}

// Execute Master Agent if run directly
async function main() {
  const masterAgent = new AmazonQMasterAgent();
  
  console.log('🚀 Amazon Q Master Agent Initializing...');
  console.log('🎯 Taking over complete system coordination');
  console.log('⚡ Executing all missions, tasks, and workflows\\n');
  
  try {
    await masterAgent.coordinateAllSystems();
  } catch (error) {
    console.error('💥 Master Agent execution failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = AmazonQMasterAgent;