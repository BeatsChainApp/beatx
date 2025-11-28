#!/usr/bin/env node

/**
 * Railway Deployment Monitor
 * Monitors MCP server deployment status and health
 */

const MCP_SERVER_URL = 'https://beatschain-mcp-server-production.up.railway.app';

async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, { timeout: 10000, ...options });
    const data = await response.json().catch(() => ({ error: 'Invalid JSON' }));
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { status: 0, ok: false, error: error.message };
  }
}

async function checkDeploymentStatus() {
  console.log('🔍 Railway Deployment Status Check');
  console.log('==================================\n');
  
  console.log(`📡 Testing: ${MCP_SERVER_URL}`);
  
  // Health check
  const health = await makeRequest(`${MCP_SERVER_URL}/healthz`);
  if (health.ok) {
    console.log('✅ MCP Server: OPERATIONAL');
    console.log(`   Status: ${health.status}`);
    console.log(`   Service: ${health.data?.service || 'Unknown'}`);
    console.log(`   Port: ${health.data?.port || 'Unknown'}`);
  } else {
    console.log('❌ MCP Server: NOT RESPONDING');
    console.log(`   Status: ${health.status}`);
    console.log(`   Error: ${health.error || 'Connection failed'}`);
  }
  
  // API check
  const api = await makeRequest(`${MCP_SERVER_URL}/api`);
  if (api.ok) {
    console.log('✅ API Endpoints: ACCESSIBLE');
    console.log(`   Version: ${api.data?.version || 'Unknown'}`);
  } else {
    console.log('⚠️ API Endpoints: UNAVAILABLE');
  }
  
  // ISRC test
  const isrc = await makeRequest(`${MCP_SERVER_URL}/api/isrc/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trackTitle: 'Test', artistName: 'Test' })
  });
  
  if (isrc.ok && isrc.data?.success) {
    console.log('✅ ISRC Generation: WORKING');
    console.log(`   Generated: ${isrc.data.isrc}`);
  } else {
    console.log('⚠️ ISRC Generation: NEEDS ATTENTION');
    console.log(`   Status: ${isrc.status}`);
  }
  
  return {
    server: health.ok,
    api: api.ok,
    isrc: isrc.ok && isrc.data?.success
  };
}

async function main() {
  const status = await checkDeploymentStatus();
  
  console.log('\n📊 DEPLOYMENT SUMMARY');
  console.log('====================');
  
  const allWorking = status.server && status.api && status.isrc;
  
  if (allWorking) {
    console.log('🎉 DEPLOYMENT SUCCESSFUL');
    console.log('✅ All systems operational');
    console.log('✅ Ready for production use');
  } else if (status.server && status.api) {
    console.log('⚠️ DEPLOYMENT PARTIAL');
    console.log('✅ Server and API working');
    console.log('⚠️ ISRC needs configuration');
  } else if (status.server) {
    console.log('⚠️ DEPLOYMENT INCOMPLETE');
    console.log('✅ Server responding');
    console.log('❌ API needs attention');
  } else {
    console.log('❌ DEPLOYMENT FAILED');
    console.log('❌ Server not responding');
    console.log('🔄 Check Railway logs for details');
  }
}

if (require.main === module) {
  main().catch(console.error);
}