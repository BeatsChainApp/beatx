const fetch = require('node-fetch');
const BASE = process.env.MCP_BASE || 'https://beatschain-mcp-server-production.up.railway.app';

const endpoints = [
  { path: '/health', method: 'GET', expect: [200] },
  { path: '/api', method: 'GET', expect: [200] },
  { path: '/api/isrc/generate', method: 'POST', expect: [200, 400] },
  { path: '/api/samro/generate', method: 'POST', expect: [200, 400] },
  { path: '/api/livepeer/upload', method: 'POST', expect: [200, 400] },
  { path: '/api/credits', method: 'GET', expect: [200, 503] },
  { path: '/api/analytics', method: 'GET', expect: [200, 503] },
  { path: '/api/notifications', method: 'GET', expect: [200, 503] }
];

(async function(){
  let success = 0;
  console.log(`Testing ${endpoints.length} endpoints against ${BASE}`);
  
  for (const {path, method, expect} of endpoints) {
    const url = BASE + path;
    try {
      const res = await fetch(url, {method});
      const ok = expect.includes(res.status);
      console.log(`${method} ${path} -> ${res.status} ${ok ? 'OK' : 'FAIL'}`);
      if (ok) success++;
    } catch(e) {
      console.log(`${method} ${path} -> ERROR: ${e.message}`);
    }
  }
  
  console.log(`\nSummary: ${success}/${endpoints.length} endpoints OK`);
  process.exit(success === endpoints.length ? 0 : 1);
})();