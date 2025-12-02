#!/usr/bin/env node
/**
 * smoke-test-mcp.js
 * Quick health checks for MCP server endpoints.
 * Usage: NODE_ENV=development node scripts/smoke-test-mcp.js
 */

const MCP = process.env.MCP_BASE_URL || process.env.NEXT_PUBLIC_MCP_SERVER_URL || process.env.MCP_SERVER_URL || 'http://localhost:4000';

async function fetchWithRetry(url, options = {}, maxRetries = 3) {
  const delays = [5000, 15000, 45000]; // 5s, 15s, 45s
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      if (response.status >= 500 && attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed with ${response.status}, retrying in ${delays[attempt]}ms...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        continue;
      }
      return response;
    } catch (error) {
      if (attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed with ${error.message}, retrying in ${delays[attempt]}ms...`);
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        continue;
      }
      throw error;
    }
  }
}

async function run() {
  console.log('MCP Smoke Test - Target:', MCP);
  const results = [];

  try {
    const h = await fetchWithRetry(`${MCP.replace(/\/$/, '')}/health`);
    results.push({ endpoint: '/health', ok: h.ok, status: h.status });
  } catch (e) { results.push({ endpoint: '/health', ok: false, error: String(e) }); }

  try {
    const s = await fetchWithRetry(`${MCP.replace(/\/$/, '')}/api/upload/status`);
    const json = await s.json().catch(() => null);
    results.push({ endpoint: '/api/upload/status', ok: s.ok, status: s.status, body: json });
  } catch (e) { results.push({ endpoint: '/api/upload/status', ok: false, error: String(e) }); }

  try {
    const pin = await fetchWithRetry(`${MCP.replace(/\/$/, '')}/api/pin`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, ts: Date.now() })
    });
    const body = await pin.json().catch(() => null);
    results.push({ endpoint: '/api/pin (POST)', ok: pin.ok, status: pin.status, body });
  } catch (e) { results.push({ endpoint: '/api/pin (POST)', ok: false, error: String(e) }); }

  try {
    const assets = await fetchWithRetry(`${MCP.replace(/\/$/, '')}/api/livepeer/assets`);
    const j = await assets.json().catch(() => null);
    results.push({ endpoint: '/api/livepeer/assets', ok: assets.ok, status: assets.status, body: j });
  } catch (e) { results.push({ endpoint: '/api/livepeer/assets', ok: false, error: String(e) }); }

  try {
    const beatPayload = { beat_id: `smoke-${Date.now()}`, title: 'Smoke Test Beat' };
    const b = await fetchWithRetry(`${MCP.replace(/\/$/, '')}/api/beats`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(beatPayload)
    });
    const bj = await b.json().catch(() => null);
    results.push({ endpoint: '/api/beats (POST)', ok: b.ok, status: b.status, body: bj });
  } catch (e) { results.push({ endpoint: '/api/beats (POST)', ok: false, error: String(e) }); }

  console.log('\n--- MCP Smoke Test Results ---');
  results.forEach(r => console.log(JSON.stringify(r, null, 2)));
  const failed = results.filter(r => !r.ok);
  console.log('\nSummary: ', failed.length === 0 ? 'ALL OK' : `${failed.length} FAILURES`);
  
  // Save results to log file
  const fs = require('fs');
  const logDir = 'automation-2025-12-02';
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(`${logDir}/mcp-smoke-results.json`, JSON.stringify({ results, failed: failed.length, timestamp: Date.now() }, null, 2));
  
  process.exit(failed.length === 0 ? 0 : 2);
}

run().catch(err => { console.error('Smoke test runner error', err); process.exit(3); });
