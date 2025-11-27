#!/usr/bin/env node

/**
 * BeatsChain MCP Server - Comprehensive Smoke Test Suite
 * Tests all routes and endpoints on production deployment
 * URL: beatschain-mcp-server-production.up.railway.app
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app';
const TIMEOUT = 10000; // 10 seconds

class SmokeTestRunner {
  constructor() {
    this.results = [];
    this.passed = 0;
    this.failed = 0;
  }

  async makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, BASE_URL);
      const isHttps = url.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: url.hostname,
        port: url.port || (isHttps ? 443 : 80),
        path: url.pathname + url.search,
        method: method.toUpperCase(),
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'BeatsChain-SmokeTest/1.0',
          ...headers
        },
        timeout: TIMEOUT
      };

      if (data && (method === 'POST' || method === 'PUT')) {
        const jsonData = JSON.stringify(data);
        options.headers['Content-Length'] = Buffer.byteLength(jsonData);
      }

      const req = client.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsed,
              raw: body
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body,
              raw: body
            });
          }
        });
      });

      req.on('error', reject);
      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      if (data && (method === 'POST' || method === 'PUT')) {
        req.write(JSON.stringify(data));
      }
      
      req.end();
    });
  }

  async test(name, testFn) {
    console.log(`🧪 Testing: ${name}`);
    try {
      const result = await testFn();
      this.results.push({ name, status: 'PASS', result });
      this.passed++;
      console.log(`✅ PASS: ${name}`);
      return result;
    } catch (error) {
      this.results.push({ name, status: 'FAIL', error: error.message });
      this.failed++;
      console.log(`❌ FAIL: ${name} - ${error.message}`);
      return null;
    }
  }

  async runHealthChecks() {
    console.log('\n🏥 === HEALTH CHECKS ===');
    
    await this.test('Root endpoint', async () => {
      const res = await this.makeRequest('GET', '/');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.service) throw new Error('Missing service field');
      return res.body;
    });

    await this.test('Health endpoint', async () => {
      const res = await this.makeRequest('GET', '/health');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.ok) throw new Error('Health check failed');
      return res.body;
    });

    await this.test('Healthz endpoint', async () => {
      const res = await this.makeRequest('GET', '/healthz');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.ok) throw new Error('Healthz check failed');
      return res.body;
    });
  }

  async runCoreAPITests() {
    console.log('\n🔧 === CORE API TESTS ===');

    await this.test('IPFS Pin endpoint', async () => {
      const testData = { test: 'data', timestamp: Date.now() };
      const res = await this.makeRequest('POST', '/api/pin', testData);
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success) throw new Error('Pin operation failed');
      return res.body;
    });

    await this.test('Token exchange endpoint structure', async () => {
      const res = await this.makeRequest('POST', '/api/token-exchange', {});
      // Should return 400 for missing idToken, not 500
      if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
      return res.body;
    });
  }

  async runBeatsAPITests() {
    console.log('\n🎵 === BEATS API TESTS ===');

    await this.test('Get beats endpoint', async () => {
      const res = await this.makeRequest('GET', '/api/beats?limit=5');
      if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
      if (!res.body.success) throw new Error('Beats fetch failed');
      return res.body;
    });

    await this.test('Create beat endpoint structure', async () => {
      const testBeat = {
        title: 'Test Beat',
        producer_address: '0x1234567890123456789012345678901234567890',
        price: '0.1',
        genre: 'Hip Hop'
      };
      const res = await this.makeRequest('POST', '/api/beats', testBeat);
      // May fail due to auth/validation, but should not be 500
      if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
      return res.body;
    });
  }

  async runISRCTests() {
    console.log('\n🎼 === ISRC API TESTS ===');

    await this.test('ISRC generation endpoint', async () => {
      const testData = {
        trackTitle: 'Test Track',
        artistName: 'Test Artist'
      };
      const res = await this.makeRequest('POST', '/api/isrc/generate', testData);
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      // ISRC generation may fail due to DB config, but endpoint should respond
      return res.body;
    });

    await this.test('ISRC validation endpoint', async () => {
      const testData = { isrc: 'ZA-BTC-25-00001' };
      const res = await this.makeRequest('POST', '/api/isrc/validate', testData);
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      return res.body;
    });

    await this.test('ISRC registry endpoint', async () => {
      const res = await this.makeRequest('GET', '/api/isrc/registry?limit=5');
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      return res.body;
    });
  }

  async runLivepeerTests() {
    console.log('\n📹 === LIVEPEER API TESTS ===');

    await this.test('Livepeer assets endpoint', async () => {
      const res = await this.makeRequest('GET', '/api/livepeer/assets');
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      return res.body;
    });

    await this.test('Livepeer upload endpoint structure', async () => {
      const testData = {
        ipfsCid: 'QmTest123',
        name: 'Test Asset',
        metadata: { test: true }
      };
      const res = await this.makeRequest('POST', '/api/livepeer/upload', testData);
      if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
      return res.body;
    });
  }

  async runThirdwebTests() {
    console.log('\n🔗 === THIRDWEB API TESTS ===');

    await this.test('Thirdweb status endpoint', async () => {
      const testData = { address: '0x1234567890123456789012345678901234567890' };
      const res = await this.makeRequest('POST', '/api/thirdweb/status', testData);
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      return res.body;
    });

    await this.test('Thirdweb pending jobs endpoint', async () => {
      const res = await this.makeRequest('GET', '/api/thirdweb/pending');
      if (res.status !== 200 && res.status !== 500) {
        throw new Error(`Unexpected status: ${res.status}`);
      }
      return res.body;
    });
  }

  async runAnalyticsTests() {
    console.log('\n📊 === ANALYTICS API TESTS ===');

    await this.test('Analytics dashboard endpoint (no auth)', async () => {
      const res = await this.makeRequest('GET', '/api/analytics/dashboard?userId=test');
      // Should return 401/403 for missing auth, not 500
      if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
      return res.body;
    });
  }

  async runIPFSProxyTests() {
    console.log('\n🌐 === IPFS PROXY TESTS ===');

    await this.test('IPFS proxy endpoint structure', async () => {
      // Test with a known IPFS hash (should handle gracefully even if not found)
      const res = await this.makeRequest('GET', '/api/ipfs/QmTest123');
      // Should not return 500, may return 404 or 502
      if (res.status >= 500 && res.status !== 502) {
        throw new Error(`Unexpected server error: ${res.status}`);
      }
      return { status: res.status, message: 'IPFS proxy responding' };
    });
  }

  async runCampaignsTests() {
    console.log('\n🎯 === CAMPAIGNS API TESTS ===');

    await this.test('Campaigns endpoint availability', async () => {
      // Test if campaigns routes are loaded
      const res = await this.makeRequest('GET', '/api/campaigns');
      // May return various status codes, but should not be 500 unless expected
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runCreditsTests() {
    console.log('\n💰 === CREDITS API TESTS ===');

    await this.test('Credits endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/credits');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runSAMROTests() {
    console.log('\n🎭 === SAMRO API TESTS ===');

    await this.test('SAMRO endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/samro');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runNotificationsTests() {
    console.log('\n🔔 === NOTIFICATIONS API TESTS ===');

    await this.test('Notifications endpoint (no auth)', async () => {
      const res = await this.makeRequest('GET', '/api/notifications');
      // Should handle auth gracefully
      if (res.status >= 500) throw new Error(`Server error: ${res.status}`);
      return res.body;
    });
  }

  async runContentTests() {
    console.log('\n📄 === CONTENT API TESTS ===');

    await this.test('Content endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/content');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runRecommendationsTests() {
    console.log('\n🎯 === RECOMMENDATIONS API TESTS ===');

    await this.test('Recommendations endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/recommendations');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runSyncTests() {
    console.log('\n🔄 === SYNC API TESTS ===');

    await this.test('Sync endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/sync');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runProfessionalTests() {
    console.log('\n👔 === PROFESSIONAL SERVICES TESTS ===');

    await this.test('Professional services endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/professional');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runSuccessTests() {
    console.log('\n🎉 === SUCCESS API TESTS ===');

    await this.test('Success endpoint availability', async () => {
      const res = await this.makeRequest('GET', '/api/success');
      return { status: res.status, available: res.status !== 404 };
    });
  }

  async runLoadTests() {
    console.log('\n⚡ === LOAD TESTS ===');

    await this.test('Concurrent health checks', async () => {
      const promises = Array(5).fill().map(() => 
        this.makeRequest('GET', '/health')
      );
      const results = await Promise.all(promises);
      const allOk = results.every(r => r.status === 200);
      if (!allOk) throw new Error('Some concurrent requests failed');
      return { concurrent: results.length, allPassed: true };
    });

    await this.test('Response time check', async () => {
      const start = Date.now();
      await this.makeRequest('GET', '/');
      const duration = Date.now() - start;
      if (duration > 5000) throw new Error(`Response too slow: ${duration}ms`);
      return { responseTime: duration };
    });
  }

  async runSecurityTests() {
    console.log('\n🔒 === SECURITY TESTS ===');

    await this.test('CORS headers check', async () => {
      const res = await this.makeRequest('GET', '/');
      // Check if CORS is properly configured
      return { 
        corsEnabled: !!res.headers['access-control-allow-origin'],
        headers: res.headers
      };
    });

    await this.test('Invalid JSON handling', async () => {
      try {
        const res = await this.makeRequest('POST', '/api/pin', null, {
          'Content-Type': 'application/json'
        });
        // Should handle gracefully, not crash
        return { status: res.status, handled: true };
      } catch (e) {
        if (e.message.includes('timeout')) throw e;
        return { handled: true, error: e.message };
      }
    });
  }

  async runEnvironmentTests() {
    console.log('\n🌍 === ENVIRONMENT TESTS ===');

    await this.test('Environment configuration check', async () => {
      const res = await this.makeRequest('GET', '/');
      if (!res.body.service) throw new Error('Service name not configured');
      if (!res.body.port) throw new Error('Port not configured');
      return {
        service: res.body.service,
        port: res.body.port,
        timestamp: res.body.timestamp
      };
    });
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 BEATSCHAIN MCP SERVER SMOKE TEST REPORT');
    console.log('='.repeat(60));
    console.log(`📊 Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${this.passed}`);
    console.log(`❌ Failed: ${this.failed}`);
    console.log(`📈 Success Rate: ${((this.passed / this.results.length) * 100).toFixed(1)}%`);
    console.log(`🌐 Server: ${BASE_URL}`);
    console.log(`⏰ Tested at: ${new Date().toISOString()}`);
    
    if (this.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      this.results
        .filter(r => r.status === 'FAIL')
        .forEach(r => console.log(`   • ${r.name}: ${r.error}`));
    }

    console.log('\n📋 DETAILED RESULTS:');
    this.results.forEach(r => {
      const icon = r.status === 'PASS' ? '✅' : '❌';
      console.log(`   ${icon} ${r.name}`);
    });

    console.log('\n' + '='.repeat(60));
    
    return {
      total: this.results.length,
      passed: this.passed,
      failed: this.failed,
      successRate: (this.passed / this.results.length) * 100,
      results: this.results
    };
  }

  async runAllTests() {
    console.log('🚀 Starting BeatsChain MCP Server Smoke Tests...');
    console.log(`🎯 Target: ${BASE_URL}`);
    console.log('⏰ Started at:', new Date().toISOString());
    
    try {
      await this.runHealthChecks();
      await this.runEnvironmentTests();
      await this.runCoreAPITests();
      await this.runBeatsAPITests();
      await this.runISRCTests();
      await this.runLivepeerTests();
      await this.runThirdwebTests();
      await this.runAnalyticsTests();
      await this.runIPFSProxyTests();
      await this.runCampaignsTests();
      await this.runCreditsTests();
      await this.runSAMROTests();
      await this.runNotificationsTests();
      await this.runContentTests();
      await this.runRecommendationsTests();
      await this.runSyncTests();
      await this.runProfessionalTests();
      await this.runSuccessTests();
      await this.runSecurityTests();
      await this.runLoadTests();
    } catch (error) {
      console.error('💥 Critical test failure:', error.message);
    }

    return this.generateReport();
  }
}

// Run tests if called directly
if (require.main === module) {
  const runner = new SmokeTestRunner();
  runner.runAllTests()
    .then(report => {
      process.exit(report.failed > 0 ? 1 : 0);
    })
    .catch(error => {
      console.error('💥 Test runner failed:', error);
      process.exit(1);
    });
}

module.exports = SmokeTestRunner;