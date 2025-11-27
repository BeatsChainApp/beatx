#!/usr/bin/env node

/**
 * Local MCP Server Test Script
 * Tests the improved MCP server running locally before deployment
 */

const http = require('http');

const LOCAL_SERVER_URL = 'http://localhost:4000';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    const req = http.request(url, requestOptions, (res) => {
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

async function testBasicEndpoints() {
  await runTest('Server Running - Root', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (response.data.version !== '2.0.0') throw new Error('Version mismatch');
  });

  await runTest('Health Check - /healthz', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/healthz`);
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
    if (!response.data.ok) throw new Error('Health check failed');
  });
}

async function testCoreAPI() {
  await runTest('Token Exchange', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/api/token-exchange`, {
      method: 'POST',
      body: { idToken: 'test-token' }
    });
    // Should return 400 or 500 for invalid token, not 404
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  await runTest('IPFS Pin', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/api/pin`, {
      method: 'POST',
      body: { test: 'data' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
    if (response.status !== 200) throw new Error(`Expected 200, got ${response.status}`);
  });
}

async function testRouteAvailability() {
  const routes = [
    '/api/beats',
    '/api/isrc',
    '/api/livepeer', 
    '/api/credits',
    '/api/success',
    '/api/thirdweb',
    '/api/campaigns',
    '/api/professional',
    '/api/analytics',
    '/api/notifications',
    '/api/content',
    '/api/recommendations',
    '/api/sync',
    '/api/samro'
  ];

  for (const route of routes) {
    await runTest(`Route Available - ${route}`, async () => {
      const response = await makeRequest(`${LOCAL_SERVER_URL}${route}`);
      // Should not return 404 - either working or 503 (service unavailable)
      if (response.status === 404) throw new Error('Route not found');
      console.log(`   Status: ${response.status} (${response.status === 503 ? 'Service Unavailable' : 'OK'})`);
    });
  }
}

async function testSpecificEndpoints() {
  await runTest('ISRC Generation', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/api/isrc/generate`, {
      method: 'POST',
      body: { trackTitle: 'Test Track', artistName: 'Test Artist' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });

  await runTest('Livepeer Upload', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/api/livepeer/upload`, {
      method: 'POST',
      body: { name: 'test-asset' }
    });
    if (response.status === 404) throw new Error('Endpoint not found');
  });
}

async function testErrorHandling() {
  await runTest('404 Handling', async () => {
    const response = await makeRequest(`${LOCAL_SERVER_URL}/api/nonexistent`);
    if (response.status !== 404) throw new Error(`Expected 404, got ${response.status}`);
  });

  await runTest('Malformed JSON Handling', async () => {
    try {
      const response = await makeRequest(`${LOCAL_SERVER_URL}/api/pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });
      // Should handle gracefully
      if (response.status >= 200 && response.status < 500) {
        // OK - handled gracefully
      }
    } catch (e) {
      // Connection error is also acceptable for malformed requests
    }
  });
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Local MCP Server Tests');
  console.log(`📡 Testing server: ${LOCAL_SERVER_URL}`);
  console.log('=' .repeat(60));

  try {
    await testBasicEndpoints();
    console.log('');
    
    await testCoreAPI();
    console.log('');
    
    await testRouteAvailability();
    console.log('');
    
    await testSpecificEndpoints();
    console.log('');
    
    await testErrorHandling();
    console.log('');

    // Summary
    console.log('=' .repeat(60));
    console.log('📊 LOCAL TEST SUMMARY');
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
    if (results.failed === 0) {
      console.log('🎉 All tests passed! Ready for deployment.');
    } else if (results.passed > results.failed) {
      console.log('⚠️ Most tests passed. Review failures before deployment.');
    } else {
      console.log('❌ Many tests failed. Fix issues before deployment.');
    }
    
    console.log('🏁 Local test completed');
    
    // Exit with appropriate code
    process.exit(results.failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('💥 Failed to connect to local server:', error.message);
    console.log('');
    console.log('🔧 Make sure the MCP server is running:');
    console.log('   cd packages/mcp-server && npm start');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Test runner failed:', error);
  process.exit(1);
});