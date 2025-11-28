const fetch = require('node-fetch');
const BASE = process.env.MCP_BASE || 'http://127.0.0.1:4000';
const endpoints = [
  '/api/isrc/generate',
  '/api/samro/generate',
  '/api/livepeer/upload'
];

(async function(){
  let success=0;
  for (const p of endpoints){
    const url = BASE + p;
    try{
      const res = await fetch(url, {method:'GET'});
      const ok = res.status >=200 && res.status < 300;
      console.log(p, '->', res.status, ok ? 'OK' : 'FAIL');
      if(ok) success++;
    }catch(e){
      console.log(p, '-> ERROR', e.message);
    }
  }
  console.log(`Summary: ${success}/${endpoints.length} endpoints OK`);
  process.exit(success===endpoints.length?0:2);
})();
