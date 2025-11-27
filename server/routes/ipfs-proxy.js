const express = require('express');
// Prefer global fetch if available (Node 18+), otherwise use cross-fetch which is installed in server/package.json
const fetch = (typeof globalThis.fetch === 'function') ? globalThis.fetch : require('cross-fetch');
const router = express.Router();

// Configure allowed origins via env or default to allow all for convenience
const ALLOWED_ORIGINS = process.env.IPFS_PROXY_ALLOWED_ORIGINS ? process.env.IPFS_PROXY_ALLOWED_ORIGINS.split(',') : ['*'];

// Helper to set CORS headers
function setCorsHeaders(res) {
  const originHeader = ALLOWED_ORIGINS.join(',');
  res.set('Access-Control-Allow-Origin', originHeader);
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

// Simple IPFS proxy: GET /api/ipfs/:hash
router.get('/ipfs/:hash', async (req, res) => {
  const { hash } = req.params;
  if (!hash) return res.status(400).json({ error: 'missing hash parameter' });

  // Choose a reliable public gateway (could be env-driven)
  const gateway = process.env.IPFS_PROXY_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/';
  const url = `${gateway}${hash}`;

  try {
    const resp = await fetch(url, { method: 'GET' });

    // Pass through status
    res.status(resp.status);

    // Forward content-type
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);

    // CORS headers
    setCorsHeaders(res);

    // Stream buffer
    const buffer = await resp.arrayBuffer ? Buffer.from(await resp.arrayBuffer()) : await resp.buffer();
    // Basic caching headers
    res.set('Cache-Control', 'public, max-age=300');
    res.send(buffer);
  } catch (err) {
    console.error('IPFS proxy error fetching', url, err && err.message);
    setCorsHeaders(res);
    res.status(502).json({ error: 'failed to fetch ipfs hash', detail: err && err.message });
  }
});

module.exports = router;
