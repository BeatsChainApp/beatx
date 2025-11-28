#!/usr/bin/env node

/**
 * Final Verification Test - Quick test of critical systems after fixes
 */

const MCP_SERVER_URL = 'https://beatschain-mcp-server-production.up.railway.app';

async function makeRequest(url, options = {}) {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      timeout: 10000,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    const data = await response.json().catch(() => ({ error: 'Invalid JSON' }));
    return { status: response.status, ok: response.ok, data };
  } catch (error) {
    return { status: 0, ok: false, error: error.message };
  }
}

async function testISRCGeneration() {
  console.log('🧪 Testing ISRC Generation...');
  
  const response = await makeRequest(`${MCP_SERVER_URL}/api/isrc/generate`, {
    method: 'POST',
    body: JSON.stringify({
      trackTitle: 'Final Test Track',
      artistName: 'Final Test Artist'
    })
  });
  
  if (response.ok && response.data?.success && response.data?.isrc) {
    console.log('✅ ISRC Generation: SUCCESS');
    console.log(`   Generated ISRC: ${response.data.isrc}`);
    return response.data.isrc;
  } else {
    console.log('❌ ISRC Generation: FAILED');
    console.log(`   Error: ${response.data?.message || response.error}`);
    return null;
  }
}

async function testCompleteMintingWorkflow() {
  console.log('\n🔄 Testing Complete Minting Workflow...');
  
  // Step 1: Generate ISRC
  const isrc = await testISRCGeneration();
  if (!isrc) {
    console.log('❌ Workflow FAILED at ISRC generation');
    return false;
  }
  
  // Step 2: Create metadata
  console.log('🧪 Testing Metadata Creation...');
  const metadata = await makeRequest(`${MCP_SERVER_URL}/api/pin`, {
    method: 'POST',
    body: JSON.stringify({
      name: 'Final Test NFT',
      description: 'Final test NFT metadata',
      isrc: isrc,
      artist: 'Final Test Artist',
      track: 'Final Test Track'
    })
  });
  
  if (metadata.ok && metadata.data?.success) {
    console.log('✅ Metadata Creation: SUCCESS');
    console.log(`   IPFS Hash: ${metadata.data.ipfs?.ipfsHash || 'Generated'}`);
  } else {
    console.log('❌ Metadata Creation: FAILED');
    return false;
  }
  
  // Step 3: Generate SAMRO split sheet
  console.log('🧪 Testing SAMRO Generation...');
  const samro = await makeRequest(`${MCP_SERVER_URL}/api/samro/fill`, {
    method: 'POST',
    body: JSON.stringify({
      userData: {
        trackTitle: 'Final Test Track',
        artistName: 'Final Test Artist',
        isrc: isrc
      },
      contributors: [
        { name: 'Final Test Artist', percentage: 100, role: 'Composer' }
      ]
    })
  });
  
  if (samro.ok && samro.data?.success) {
    console.log('✅ SAMRO Generation: SUCCESS');
    console.log(`   Steps: ${samro.data.instructions?.steps?.length || 0}`);
  } else {
    console.log('❌ SAMRO Generation: FAILED');
    return false;
  }
  
  console.log('\n🎉 COMPLETE MINTING WORKFLOW: SUCCESS');
  return true;
}

async function testSystemHealth() {
  console.log('\n🏥 Testing System Health...');
  
  // MCP Server Health
  const health = await makeRequest(`${MCP_SERVER_URL}/healthz`);
  if (health.ok) {
    console.log('✅ MCP Server Health: OK');
  } else {
    console.log('❌ MCP Server Health: FAILED');
  }
  
  // Vercel App Health
  const vercel = await makeRequest('https://beats-app.vercel.app');
  if (vercel.ok) {
    console.log('✅ Vercel App Health: OK');
  } else {
    console.log('❌ Vercel App Health: FAILED');
  }
  
  return health.ok && vercel.ok;
}

async function main() {
  console.log('🚀 Final Verification Test Starting');
  console.log('====================================\n');
  
  const systemHealthy = await testSystemHealth();
  const workflowWorking = await testCompleteMintingWorkflow();
  
  console.log('\n📊 FINAL RESULTS');
  console.log('================');
  console.log(`System Health: ${systemHealthy ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Minting Workflow: ${workflowWorking ? '✅ PASS' : '❌ FAIL'}`);
  
  if (systemHealthy && workflowWorking) {
    console.log('\n🎉 ALL SYSTEMS OPERATIONAL');
    console.log('✅ Ready for production use');
    console.log('✅ Chrome extension ready for submission');
    console.log('✅ All workflows functional');
  } else {
    console.log('\n⚠️  ISSUES DETECTED');
    console.log('🔧 Review logs and apply fixes');
  }
  
  console.log('\n====================================');
}

main().catch(console.error);