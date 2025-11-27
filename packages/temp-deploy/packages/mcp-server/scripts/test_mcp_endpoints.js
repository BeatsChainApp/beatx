// Simple node script to test MCP endpoints (health, isrc/generate) for CI/local smoke checks
(async function(){
  try {
    const base = process.env.MCP_BASE || 'http://localhost:4000'
    const timeout = (ms) => new Promise(r=>setTimeout(r,ms))

    console.log('Checking MCP health at', base+'/healthz')
    const h = await fetch(base+'/healthz')
    if(!h.ok) throw new Error('healthz failed: '+h.status)
    console.log('healthz OK')

    // test isrc generate
    console.log('Testing /api/isrc/generate')
    const body = { title: 'Smoke Test', artist: 'CI', userId: 'ci-test' }
    const r = await fetch(base+'/api/isrc/generate', {method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify(body)})
    if(!r.ok) {
      const txt = await r.text()
      throw new Error('/api/isrc/generate failed: '+r.status+' '+txt)
    }
    const json = await r.json()
    console.log('/api/isrc/generate response:', json)
    process.exit(0)
  } catch (err) {
    console.error('MCP smoke test failed:', err)
    process.exit(2)
  }
})()
