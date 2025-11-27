const express = require('express');
const fetch = (typeof globalThis.fetch === 'function') ? globalThis.fetch : require('cross-fetch');
const router = express.Router();

const ALLOWED_ORIGINS = process.env.IPFS_PROXY_ALLOWED_ORIGINS ? process.env.IPFS_PROXY_ALLOWED_ORIGINS.split(',') : ['*'];

function setCorsHeaders(res) {
  const originHeader = ALLOWED_ORIGINS.join(',');
  res.set('Access-Control-Allow-Origin', originHeader);
  res.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

router.get('/ipfs/:hash', async (req, res) => {
  const { hash } = req.params;
  if (!hash) return res.status(400).json({ error: 'missing hash parameter' });

  const gateway = process.env.IPFS_PROXY_GATEWAY || 'https://cloudflare-ipfs.com/ipfs/';
  const url = `${gateway}${hash}`;

  try {
    const resp = await fetch(url, { method: 'GET' });
    res.status(resp.status);
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    res.set('Content-Type', contentType);
    setCorsHeaders(res);
    const buffer = await resp.arrayBuffer ? Buffer.from(await resp.arrayBuffer()) : await resp.buffer();
    res.set('Cache-Control', 'public, max-age=300');
    res.send(buffer);
  } catch (err) {
    console.error('IPFS proxy error fetching', url, err && err.message);
    setCorsHeaders(res);
    res.status(502).json({ error: 'failed to fetch ipfs hash', detail: err && err.message });
  }
});

module.exports = router;
