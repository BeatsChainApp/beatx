#!/usr/bin/env node
/**
 * Simple smoke test for the WhatsApp gateway webhook endpoints.
 * Usage:
 *   MCP_WHATSAPP_GATEWAY_URL=http://localhost:3000 node scripts/smoke-test-whatsapp-gateway.js
 * Optional env vars:
 *   WHATSAPP_WEBHOOK_VERIFY_TOKEN - token to use for GET verify
 *   WHATSAPP_APP_SECRET - if present the script will sign the POST payload
 */
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const GATEWAY = process.env.MCP_WHATSAPP_GATEWAY_URL || process.env.WHATSAPP_GATEWAY_URL || 'http://localhost:3000';
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'test-verify-token';
const APP_SECRET = process.env.WHATSAPP_APP_SECRET || null;

function request(url, opts, body) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith('https') ? https : http;
    const req = lib.request(url, opts, (res) => {
      let data = '';
      res.on('data', (d) => (data += d));
      res.on('end', () => resolve({ statusCode: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function requestWithRetry(url, opts, body, maxRetries = 3) {
  const delays = [5000, 15000, 45000]; // 5s, 15s, 45s
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await request(url, opts, body);
      if (response.statusCode >= 500 && attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed with ${response.statusCode}, retrying in ${delays[attempt]}ms...`);
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
  console.log('Gateway URL:', GATEWAY);
  const results = [];
  
  // 1) Verify GET challenge
  try {
    const challenge = 'CHALLENGE123';
    const verifyUrl = `${GATEWAY.replace(/\/$/, '')}/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(VERIFY_TOKEN)}&hub.challenge=${encodeURIComponent(challenge)}`;
    const res = await requestWithRetry(verifyUrl, { method: 'GET' });
    console.log('[GET] status=', res.statusCode, 'body=', res.body);
    results.push({ endpoint: 'GET /webhook (verify)', ok: res.statusCode === 200, status: res.statusCode, body: res.body });
  } catch (err) {
    console.error('[GET] error', err && err.message);
    results.push({ endpoint: 'GET /webhook (verify)', ok: false, error: err && err.message });
  }

  // 2) POST a sample webhook payload
  try {
    const payload = JSON.stringify({
      object: 'whatsapp_business_account',
      entry: [
        {
          id: '123',
          changes: [
            {
              value: {
                contacts: [{ wa_id: '15551234567', profile: { name: 'Test User' } }],
                messages: [{ from: '15551234567', id: 'mid.1', text: { body: 'Hello, preview please' } }]
              }
            }
          ]
        }
      ]
    });

    const headers = { 'Content-Type': 'application/json' };
    if (APP_SECRET) {
      const sig = crypto.createHmac('sha256', APP_SECRET).update(payload).digest('hex');
      headers['x-hub-signature-256'] = `sha256=${sig}`;
    }

    const postUrl = `${GATEWAY.replace(/\/$/, '')}/webhook`;
    const res = await requestWithRetry(postUrl, { method: 'POST', headers }, payload);
    console.log('[POST] status=', res.statusCode, 'body=', res.body);
    results.push({ endpoint: 'POST /webhook', ok: res.statusCode === 200, status: res.statusCode, body: res.body });
  } catch (err) {
    console.error('[POST] error', err && err.message);
    results.push({ endpoint: 'POST /webhook', ok: false, error: err && err.message });
  }
  
  // Save results to log file
  const fs = require('fs');
  const logDir = 'automation-2025-12-02';
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  fs.writeFileSync(`${logDir}/gateway-smoke-results.json`, JSON.stringify({ results, timestamp: Date.now() }, null, 2));
  
  const failed = results.filter(r => !r.ok);
  console.log('\nSummary: ', failed.length === 0 ? 'ALL OK' : `${failed.length} FAILURES`);
}

run().catch((e) => { console.error('smoke test failed:', e); process.exit(1); });
