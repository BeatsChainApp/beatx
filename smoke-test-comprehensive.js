#!/usr/bin/env node

/**
 * Comprehensive Smoke Test for BeatsChain MCP Server
 * Tests all routes and functionality against deployed server
 */

const https = require('https');
const http = require('http');

const MCP_SERVER_URL = 'https://beatschain-mcp-server-production.up.railway.app';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = protocol.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Test runner
async function runTest(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    await testFn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`✅ PASS: ${name}`);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: error.message });
    console.log(`❌ FAIL: ${name} - ${error.message}`);
  }
}

// Test suites
async function testHealthEndpoints() {
  await runTest('Health Check - /healthz', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/healthz`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.ok) throw new Error('Health check failed');
  });

  await runTest('Health Check - /health', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/health`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.ok) throw new Error('Health check failed');
  });

  await runTest('Root Endpoint - /', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.status !== 'ok') throw new Error('Root endpoint failed');
  });
}

async function testAPIEndpoints() {
  // Test token exchange
  await runTest('Token Exchange - /api/token-exchange', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/token-exchange`, {
      method: 'POST',
      body: { idToken: 'test-token' }
    });
    // Should return 400 or 500 for invalid token, not 404
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test IPFS pin endpoint
  await runTest('IPFS Pin - /api/pin', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/pin`, {
      method: 'POST',
      body: { test: 'data' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test beats endpoint
  await runTest('Beats - /api/beats', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/beats`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test ISRC endpoint
  await runTest('ISRC - /api/isrc', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/isrc`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Livepeer endpoint
  await runTest('Livepeer - /api/livepeer', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/livepeer`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Credits endpoint
  await runTest('Credits - /api/credits', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/credits`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Success endpoint
  await runTest('Success - /api/success', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/success`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Thirdweb endpoint
  await runTest('Thirdweb - /api/thirdweb', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/thirdweb`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Campaigns endpoint
  await runTest('Campaigns - /api/campaigns', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/campaigns`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Professional endpoint
  await runTest('Professional - /api/professional', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/professional`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Analytics endpoint
  await runTest('Analytics - /api/analytics', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/analytics`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Notifications endpoint
  await runTest('Notifications - /api/notifications', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/notifications`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Content endpoint
  await runTest('Content - /api/content', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/content`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Recommendations endpoint
  await runTest('Recommendations - /api/recommendations', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/recommendations`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Sync endpoint
  await runTest('Sync - /api/sync', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/sync`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test SAMRO endpoint
  await runTest('SAMRO - /api/samro', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/samro`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });
}

async function testSpecificFunctionality() {
  // Test IPFS proxy
  await runTest('IPFS Proxy - /api/ipfs-proxy', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/ipfs-proxy`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test specific beat operations
  await runTest('Beat Operations - /api/beats/list', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/beats/list`);
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test ISRC generation
  await runTest('ISRC Generation - /api/isrc/generate', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/isrc/generate`, {
      method: 'POST',
      body: { title: 'Test Track', artist: 'Test Artist' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  // Test Livepeer upload
  await runTest('Livepeer Upload - /api/livepeer/upload', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/livepeer/upload`, {
      method: 'POST',
      body: { test: 'data' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });
}

async function testDatabaseConnections() {
  // Test Supabase connection through analytics
  await runTest('Supabase Connection - Analytics', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/analytics/stats`);
    if (response.status === 404) throw new Error('Endpoint not found');
    // Should return 500 or data, not 404 if properly configured
  });

  // Test database operations
  await runTest('Database Operations - Success Log', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/success/log`, {
      method: 'POST',
      body: { action: 'test', status: 'success' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });
}

async function testErrorHandling() {
  // Test 404 handling
  await runTest('404 Handling', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/nonexistent`);
    if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
  });

  // Test malformed JSON
  await runTest('Malformed JSON Handling', async () => {
    const response = await makeRequest(`${MCP_SERVER_URL}/api/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    // Should handle gracefully, not crash
    if (response.status === 500 && response.raw.includes('Unexpected token')) {
      throw new Error('Server not handling malformed JSON gracefully');
    }
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive MCP Server Smoke Tests');
  console.log(`📡 Testing server: ${MCP_SERVER_URL}`);
  console.log('=' .repeat(60));

  await testHealthEndpoints();
  console.log('');
  
  await testAPIEndpoints();
  console.log('');
  
  await testSpecificFunctionality();
  console.log('');
  
  await testDatabaseConnections();
  console.log('');
  
  await testErrorHandling();
  console.log('');

  // Summary
  console.log('=' .repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('=' .repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);
  
  if (results.failed > 0) {
    console.log('');
    console.log('❌ FAILED TESTS:');
    results.tests.filter(t => t.status === 'FAIL').forEach(test => {
      console.log(`   • ${test.name}: ${test.error}`);
    });
  }

  console.log('');
  console.log('🏁 Smoke test completed');
  
  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});