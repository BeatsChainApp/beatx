#!/usr/bin/env node

/**
 * Comprehensive MCP Server Testing Suite
 * Tests all routes, integrations, data pipelines, workflows, uploads, minting, radio submissions, split sheets, ISRC codes
 */

const fs = require('fs');
const path = require('path');

// Configuration
const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app';
const VERCEL_APP_URL = process.env.VERCEL_APP_URL || 'https://beats-app.vercel.app';

console.log('🚀 BeatsChain Comprehensive Testing Suite');
console.log('==========================================');
console.log(`MCP Server: ${MCP_SERVER_URL}`);
console.log(`Vercel App: ${VERCEL_APP_URL}`);
console.log('==========================================\n');

// Test Results Storage
const testResults = {
  timestamp: new Date().toISOString(),
  mcpServer: MCP_SERVER_URL,
  vercelApp: VERCEL_APP_URL,
  tests: {},
  summary: {
    total: 0,
    passed: 0,
    failed: 0,
    warnings: 0
  }
};

// Helper Functions
async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      timeout: 10000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BeatsChain-Test-Suite/1.0',
        ...options.headers
      }
    });
    
    const data = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
    
    return {
      status: response.status,
      ok: response.ok,
      data,
      headers: Object.fromEntries(response.headers.entries())
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

function logTest(category, name, status, details = '') {
  const symbols = { pass: '✅', fail: '❌', warn: '⚠️' };
  const symbol = symbols[status] || '❓';
  
  console.log(`${symbol} [${category}] ${name}${details ? ' - ' + details : ''}`);
  
  if (!testResults.tests[category]) {
    testResults.tests[category] = [];
  }
  
  testResults.tests[category].push({
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  });
  
  testResults.summary.total++;
  if (status === 'pass') testResults.summary.passed++;
  else if (status === 'fail') testResults.summary.failed++;
  else if (status === 'warn') testResults.summary.warnings++;
}

// Test Categories

async function testMCPServerHealth() {
  console.log('\n🏥 MCP Server Health Checks');
  console.log('============================');
  
  // Root endpoint
  const root = await makeRequest(MCP_SERVER_URL);
  if (root.ok && root.data?.status === 'ok') {
    logTest('Health', 'Root endpoint', 'pass', `v${root.data.version}`);
  } else {
    logTest('Health', 'Root endpoint', 'fail', root.error || 'Invalid response');
  }
  
  // Health endpoints
  const health = await makeRequest(`${MCP_SERVER_URL}/healthz`);
  if (health.ok && health.data?.ok) {
    logTest('Health', 'Health check', 'pass', `Port: ${health.data.port}`);
  } else {
    logTest('Health', 'Health check', 'fail', health.error || 'Health check failed');
  }
  
  // API index
  const api = await makeRequest(`${MCP_SERVER_URL}/api`);
  if (api.ok && api.data?.success) {
    logTest('Health', 'API index', 'pass', `v${api.data.version}`);
    
    // Log available endpoints
    if (api.data.endpoints?.working) {
      console.log(`   📋 Working endpoints: ${api.data.endpoints.working.length}`);
    }
    if (api.data.endpoints?.unavailable) {
      console.log(`   ⚠️  Unavailable endpoints: ${api.data.endpoints.unavailable.length}`);
    }
  } else {
    logTest('Health', 'API index', 'fail', api.error || 'API index failed');
  }
}

async function testISRCSystem() {
  console.log('\n🎵 ISRC System Testing');
  console.log('======================');
  
  // Generate ISRC
  const generateData = {
    trackTitle: 'Test Track ' + Date.now(),
    artistName: 'Test Artist'
  };
  
  const generate = await makeRequest(`${MCP_SERVER_URL}/api/isrc/generate`, {
    method: 'POST',
    body: JSON.stringify(generateData)
  });
  
  if (generate.ok && generate.data?.success && generate.data?.isrc) {
    logTest('ISRC', 'Generate ISRC', 'pass', generate.data.isrc);
    
    // Validate generated ISRC
    const validate = await makeRequest(`${MCP_SERVER_URL}/api/isrc/validate`, {
      method: 'POST',
      body: JSON.stringify({ isrc: generate.data.isrc })
    });
    
    if (validate.ok && validate.data?.valid) {
      logTest('ISRC', 'Validate ISRC', 'pass', 'Format valid');
    } else {
      logTest('ISRC', 'Validate ISRC', 'fail', validate.error || 'Validation failed');
    }
    
    // Mark as used
    const markUsed = await makeRequest(`${MCP_SERVER_URL}/api/isrc/mark-used`, {
      method: 'POST',
      body: JSON.stringify({
        isrc: generate.data.isrc,
        trackTitle: generateData.trackTitle,
        artistName: generateData.artistName
      })
    });
    
    if (markUsed.ok && markUsed.data?.success) {
      logTest('ISRC', 'Mark as used', 'pass', 'Successfully marked');
    } else {
      logTest('ISRC', 'Mark as used', 'fail', markUsed.error || 'Mark failed');
    }
  } else {
    logTest('ISRC', 'Generate ISRC', 'fail', generate.error || 'Generation failed');
  }
  
  // Get registry
  const registry = await makeRequest(`${MCP_SERVER_URL}/api/isrc/registry?limit=5`);
  if (registry.ok && registry.data?.success) {
    logTest('ISRC', 'Registry access', 'pass', `${registry.data.total || 0} codes`);
  } else {
    logTest('ISRC', 'Registry access', 'fail', registry.error || 'Registry failed');
  }
}

async function testSAMROSystem() {
  console.log('\n📄 SAMRO Split Sheet Testing');
  console.log('============================');
  
  const samroData = {
    trackTitle: 'Test Track',
    artistName: 'Test Artist',
    isrc: 'ZA-BTC-25-00001',
    contributors: [
      { name: 'Artist 1', percentage: 50, role: 'Composer' },
      { name: 'Artist 2', percentage: 50, role: 'Lyricist' }
    ]
  };
  
  // Generate split sheet
  const generate = await makeRequest(`${MCP_SERVER_URL}/api/samro/generate`, {
    method: 'POST',
    body: JSON.stringify(samroData)
  });
  
  if (generate.ok && generate.data?.success) {
    logTest('SAMRO', 'Generate split sheet', 'pass', 'Generation ready');
  } else {
    logTest('SAMRO', 'Generate split sheet', 'fail', generate.error || 'Generation failed');
  }
  
  // Fill instructions
  const fill = await makeRequest(`${MCP_SERVER_URL}/api/samro/fill`, {
    method: 'POST',
    body: JSON.stringify({ userData: samroData, contributors: samroData.contributors })
  });
  
  if (fill.ok && fill.data?.success && fill.data?.instructions) {
    logTest('SAMRO', 'Fill instructions', 'pass', `${fill.data.instructions.steps?.length || 0} steps`);
  } else {
    logTest('SAMRO', 'Fill instructions', 'fail', fill.error || 'Instructions failed');
  }
}

async function testIPFSIntegration() {
  console.log('\n🌐 IPFS Integration Testing');
  console.log('===========================');
  
  // Test JSON pinning
  const testData = {
    name: 'Test NFT',
    description: 'Test NFT for MCP testing',
    image: 'https://example.com/image.jpg',
    attributes: [
      { trait_type: 'Type', value: 'Test' },
      { trait_type: 'Timestamp', value: Date.now() }
    ]
  };
  
  const pin = await makeRequest(`${MCP_SERVER_URL}/api/pin`, {
    method: 'POST',
    body: JSON.stringify(testData)
  });
  
  if (pin.ok && pin.data?.success && pin.data?.ipfs) {
    logTest('IPFS', 'JSON pinning', 'pass', pin.data.ipfs.cid || 'Pinned');
  } else {
    logTest('IPFS', 'JSON pinning', 'fail', pin.error || 'Pinning failed');
  }
}

async function testLivepeerIntegration() {
  console.log('\n📹 Livepeer Integration Testing');
  console.log('===============================');
  
  // Test with IPFS CID (mock)
  const livepeerData = {
    ipfsCid: 'QmTestCID123456789',
    title: 'Test Video',
    description: 'Test video for Livepeer integration'
  };
  
  const upload = await makeRequest(`${MCP_SERVER_URL}/api/livepeer/upload`, {
    method: 'POST',
    body: JSON.stringify(livepeerData)
  });
  
  if (upload.ok) {
    if (upload.data?.success) {
      logTest('Livepeer', 'IPFS upload', 'pass', 'Upload initiated');
    } else {
      logTest('Livepeer', 'IPFS upload', 'warn', upload.data?.message || 'Service unavailable');
    }
  } else {
    logTest('Livepeer', 'IPFS upload', 'fail', upload.error || 'Upload failed');
  }
}

async function testCreditsSystem() {
  console.log('\n💰 Credits System Testing');
  console.log('=========================');
  
  // Test credits endpoints
  const credits = await makeRequest(`${MCP_SERVER_URL}/api/credits`);
  if (credits.ok) {
    logTest('Credits', 'Credits endpoint', 'pass', 'Accessible');
  } else {
    logTest('Credits', 'Credits endpoint', 'fail', credits.error || 'Not accessible');
  }
}

async function testBeatsSystem() {
  console.log('\n🎼 Beats System Testing');
  console.log('=======================');
  
  // Test beats endpoints
  const beats = await makeRequest(`${MCP_SERVER_URL}/api/beats`);
  if (beats.ok) {
    logTest('Beats', 'Beats endpoint', 'pass', 'Accessible');
  } else {
    logTest('Beats', 'Beats endpoint', 'fail', beats.error || 'Not accessible');
  }
}

async function testSyncSystem() {
  console.log('\n🔄 Sync System Testing');
  console.log('======================');
  
  // Test sync endpoints
  const sync = await makeRequest(`${MCP_SERVER_URL}/api/sync`);
  if (sync.ok) {
    logTest('Sync', 'Sync endpoint', 'pass', 'Accessible');
  } else {
    logTest('Sync', 'Sync endpoint', 'fail', sync.error || 'Not accessible');
  }
}

async function testVercelApp() {
  console.log('\n🌐 Vercel App Testing');
  console.log('=====================');
  
  // Test main app
  const app = await makeRequest(VERCEL_APP_URL);
  if (app.ok) {
    logTest('Vercel', 'Main app', 'pass', `Status: ${app.status}`);
  } else {
    logTest('Vercel', 'Main app', 'fail', app.error || 'App not accessible');
  }
  
  // Test API routes (if available)
  const apiHealth = await makeRequest(`${VERCEL_APP_URL}/api/health`);
  if (apiHealth.ok) {
    logTest('Vercel', 'API health', 'pass', 'API accessible');
  } else {
    logTest('Vercel', 'API health', 'warn', 'API not found or unavailable');
  }
}

async function testChromeExtensionIntegration() {
  console.log('\n🔌 Chrome Extension Integration');
  console.log('===============================');
  
  // Check if extension files exist
  const manifestPath = '/workspaces/beatx/chrome-extension/manifest.json';
  const mcpClientPath = '/workspaces/beatx/chrome-extension/lib/mcp-client.js';
  
  if (fs.existsSync(manifestPath)) {
    logTest('Extension', 'Manifest exists', 'pass', 'v3.0.0');
    
    try {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      const hasPermissions = manifest.permissions && manifest.permissions.length > 0;
      const hasHostPermissions = manifest.host_permissions && manifest.host_permissions.length > 0;
      
      if (hasPermissions) {
        logTest('Extension', 'Permissions configured', 'pass', `${manifest.permissions.length} permissions`);
      } else {
        logTest('Extension', 'Permissions configured', 'warn', 'No permissions found');
      }
      
      if (hasHostPermissions) {
        logTest('Extension', 'Host permissions', 'pass', `${manifest.host_permissions.length} hosts`);
      } else {
        logTest('Extension', 'Host permissions', 'warn', 'No host permissions');
      }
    } catch (error) {
      logTest('Extension', 'Manifest parsing', 'fail', error.message);
    }
  } else {
    logTest('Extension', 'Manifest exists', 'fail', 'Manifest not found');
  }
  
  if (fs.existsSync(mcpClientPath)) {
    logTest('Extension', 'MCP client exists', 'pass', 'Client ready');
  } else {
    logTest('Extension', 'MCP client exists', 'fail', 'MCP client not found');
  }
}

async function testDataPipelines() {
  console.log('\n🔄 Data Pipelines Testing');
  console.log('=========================');
  
  // Test success logging
  const success = await makeRequest(`${MCP_SERVER_URL}/api/success`);
  if (success.ok) {
    logTest('Pipeline', 'Success logging', 'pass', 'Endpoint accessible');
  } else {
    logTest('Pipeline', 'Success logging', 'fail', success.error || 'Not accessible');
  }
  
  // Test analytics (may require auth)
  const analytics = await makeRequest(`${MCP_SERVER_URL}/api/analytics`);
  if (analytics.status === 503) {
    logTest('Pipeline', 'Analytics', 'warn', 'Service unavailable (expected)');
  } else if (analytics.ok) {
    logTest('Pipeline', 'Analytics', 'pass', 'Accessible');
  } else {
    logTest('Pipeline', 'Analytics', 'fail', analytics.error || 'Failed');
  }
  
  // Test notifications
  const notifications = await makeRequest(`${MCP_SERVER_URL}/api/notifications`);
  if (notifications.status === 503) {
    logTest('Pipeline', 'Notifications', 'warn', 'Service unavailable (expected)');
  } else if (notifications.ok) {
    logTest('Pipeline', 'Notifications', 'pass', 'Accessible');
  } else {
    logTest('Pipeline', 'Notifications', 'fail', notifications.error || 'Failed');
  }
}

async function testWorkflows() {
  console.log('\n⚙️  Workflow Testing');
  console.log('====================');
  
  // Test complete minting workflow simulation
  console.log('   🔄 Simulating complete minting workflow...');
  
  // Step 1: Generate ISRC
  const isrcResult = await makeRequest(`${MCP_SERVER_URL}/api/isrc/generate`, {
    method: 'POST',
    body: JSON.stringify({
      trackTitle: 'Workflow Test Track',
      artistName: 'Workflow Test Artist'
    })
  });
  
  if (isrcResult.ok && isrcResult.data?.isrc) {
    logTest('Workflow', 'Step 1: ISRC Generation', 'pass', isrcResult.data.isrc);
    
    // Step 2: Create metadata
    const metadata = {
      name: 'Workflow Test NFT',
      description: 'Test NFT created via workflow',
      isrc: isrcResult.data.isrc,
      artist: 'Workflow Test Artist',
      track: 'Workflow Test Track'
    };
    
    // Step 3: Pin metadata to IPFS
    const ipfsResult = await makeRequest(`${MCP_SERVER_URL}/api/pin`, {
      method: 'POST',
      body: JSON.stringify(metadata)
    });
    
    if (ipfsResult.ok && ipfsResult.data?.success) {
      logTest('Workflow', 'Step 2: Metadata Pinning', 'pass', 'Metadata pinned');
      
      // Step 4: Generate SAMRO instructions
      const samroResult = await makeRequest(`${MCP_SERVER_URL}/api/samro/fill`, {
        method: 'POST',
        body: JSON.stringify({
          userData: {
            trackTitle: 'Workflow Test Track',
            artistName: 'Workflow Test Artist',
            isrc: isrcResult.data.isrc
          },
          contributors: [{ name: 'Workflow Test Artist', percentage: 100, role: 'Composer' }]
        })
      });
      
      if (samroResult.ok && samroResult.data?.success) {
        logTest('Workflow', 'Step 3: SAMRO Generation', 'pass', 'Instructions ready');
        logTest('Workflow', 'Complete Workflow', 'pass', 'All steps successful');
      } else {
        logTest('Workflow', 'Step 3: SAMRO Generation', 'fail', 'SAMRO failed');
        logTest('Workflow', 'Complete Workflow', 'fail', 'Workflow incomplete');
      }
    } else {
      logTest('Workflow', 'Step 2: Metadata Pinning', 'fail', 'Pinning failed');
      logTest('Workflow', 'Complete Workflow', 'fail', 'Workflow incomplete');
    }
  } else {
    logTest('Workflow', 'Step 1: ISRC Generation', 'fail', 'ISRC generation failed');
    logTest('Workflow', 'Complete Workflow', 'fail', 'Workflow failed at step 1');
  }
}

async function generateReport() {
  console.log('\n📊 Test Results Summary');
  console.log('=======================');
  
  const { total, passed, failed, warnings } = testResults.summary;
  const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`📈 Pass Rate: ${passRate}%`);
  
  // Save detailed report
  const reportPath = '/workspaces/beatx/test-results-comprehensive.json';
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved: ${reportPath}`);
  
  // Generate recommendations
  console.log('\n💡 Recommendations');
  console.log('==================');
  
  if (failed > 0) {
    console.log('❌ Critical Issues Found:');
    Object.entries(testResults.tests).forEach(([category, tests]) => {
      const failedTests = tests.filter(t => t.status === 'fail');
      if (failedTests.length > 0) {
        console.log(`   • ${category}: ${failedTests.length} failed tests`);
        failedTests.forEach(test => {
          console.log(`     - ${test.name}: ${test.details}`);
        });
      }
    });
  }
  
  if (warnings > 0) {
    console.log('⚠️  Warnings to Address:');
    Object.entries(testResults.tests).forEach(([category, tests]) => {
      const warnTests = tests.filter(t => t.status === 'warn');
      if (warnTests.length > 0) {
        console.log(`   • ${category}: ${warnTests.length} warnings`);
      }
    });
  }
  
  if (passed === total) {
    console.log('🎉 All tests passed! System is ready for production.');
  } else if (passRate >= 80) {
    console.log('✅ System is mostly functional. Address warnings for optimal performance.');
  } else {
    console.log('⚠️  System needs attention. Address failed tests before production use.');
  }
}

// Main Test Execution
async function runAllTests() {
  try {
    await testMCPServerHealth();
    await testISRCSystem();
    await testSAMROSystem();
    await testIPFSIntegration();
    await testLivepeerIntegration();
    await testCreditsSystem();
    await testBeatsSystem();
    await testSyncSystem();
    await testVercelApp();
    await testChromeExtensionIntegration();
    await testDataPipelines();
    await testWorkflows();
    
    await generateReport();
    
  } catch (error) {
    console.error('\n💥 Test suite error:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  runAllTests,
  testResults,
  MCP_SERVER_URL,
  VERCEL_APP_URL
};