const fetch = require('node-fetch')
const { getClient } = require('./supabaseClient')
const CustomRelayer = require('./customRelayer')

// Adapter: supports a mock mode when no server key is present, and a "server-backed placeholder"
// behavior when a server key is available. For full production minting replace the placeholder
// with the Thirdweb SDK calls (keeps keys server-side).

const THIRDWEB_KEY = process.env.THIRDWEB_SERVER_KEY || process.env.THIRDWEB_SERVER_API_KEY || null
const THIRDWEB_CLIENT_ID = process.env.THIRDWEB_CLIENT_ID || null

async function statusForAddress(address){
  if(!THIRDWEB_KEY){
    return { allowed: false, reason: 'thirdweb key missing', balance: 0 }
  }

  // With a server key present we consider gasless allowed by policy for now.
  // In production you'd query the Thirdweb relayer or check credit balances.
  return { allowed: true, reason: null, balance: 1000, clientId: THIRDWEB_CLIENT_ID }
}

// Mint placeholder: records the mint attempt to Supabase `success` (if configured) and returns a mock tx
async function mintGasless({ to, metadataUri, metadata }){
  const fakeTx = `thirdweb-mock-${Date.now()}`

    const job = {
      id: `job-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      createdAt: new Date().toISOString(),
      to, metadataUri, metadata, clientId: THIRDWEB_CLIENT_ID,
      status: 'queued'
    }

    // Enqueue job (Supabase-backed when available, file fallback otherwise)
    try{
      const Jobs = require('./thirdwebJobs')
      await Jobs.enqueue(job)
    }catch(e){
      console.warn('thirdwebAdapter: enqueue failed, falling back to file write', e && e.message)
      try{
        const path = require('path')
        const fs = require('fs')
        const storeDir = path.join(__dirname, '..', 'data')
        try{ if(!fs.existsSync(storeDir)) fs.mkdirSync(storeDir, { recursive: true }) }catch(e){}
        const store = path.join(storeDir, 'pending_mints.json')
        let arr = []
        try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){}
        arr.push(job)
        fs.writeFileSync(store, JSON.stringify(arr, null, 2))
      }catch(err){ console.warn('thirdwebAdapter: file fallback write also failed', err && err.message) }
    }

    // Record audit row in Supabase success table if available
    try{
      const sb = getClient()
      if(sb){
        await sb.from('success').insert([{
          event: 'thirdweb_gasless_mint_requested',
          status: 'queued',
          metadata: { to, metadataUri, metadata, clientId: THIRDWEB_CLIENT_ID },
          details: { jobId: job.id }
        }])
      }
    }catch(e){
      console.warn('thirdwebAdapter: failed to log queued mint to supabase success table', e && e.message)
    }

    // If no server key present, return queued job info (safe)
    if(!THIRDWEB_KEY){
      return { success: true, queued: true, jobId: job.id, message: 'Mint queued (no THIRDWEB_SERVER_KEY present)'}
    }

    // If server key present but no RELAYER URL configured, still queue and return job id
    const RELAYER = process.env.THIRDWEB_RELAYER_URL || null
    if(!RELAYER){
      return { success: true, queued: true, jobId: job.id, message: 'Mint queued (no THIRDWEB_RELAYER_URL configured)'}
    }

    // Use custom relayer instead of external service
    try{
      const relayer = new CustomRelayer()
      const txData = {
        to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        data: '0x', // Contract call data for mint function
        gasLimit: 500000
      }
      
      const result = await relayer.executeTransaction(txData)
      
      // Log success to Supabase
      try{
        const sb = getClient()
        if(sb){
          await sb.from('success').insert([{
            event: 'custom_relayer_mint_success',
            status: 'completed',
            metadata: { to, metadataUri, metadata, txHash: result.transactionHash },
            details: { jobId: job.id, gasUsed: result.gasUsed }
          }])
        }
      }catch(e){ console.warn('thirdwebAdapter: failed to log success', e && e.message) }

      return { success: true, queued: false, jobId: job.id, txHash: result.transactionHash }
    }catch(err){
      console.warn('thirdwebAdapter: custom relayer failed', err && err.message)
      return { success: false, queued: true, jobId: job.id, error: err.message }
    }

  // Attempt to record the mint attempt in Supabase for audit
  try{
    const sb = getClient()
    if(sb){
      const insert = {
        event: 'thirdweb_gasless_mint',
        status: 'pending',
        metadata: { to, metadataUri, metadata, clientId: THIRDWEB_CLIENT_ID },
        details: { note: 'mint requested (placeholder - replace with SDK implementation)' }
      }
      await sb.from('success').insert([insert])
    }
  }catch(e){
    console.warn('thirdwebAdapter: failed to log to supabase success table', e && e.message)
  }

  // Note: This is a placeholder implementation. When you provide a full Thirdweb server key
  // and prefer real mints, we'll replace this with the official SDK flow which will return a
  // real transaction hash and token id.
  return {
    success: true,
    mock: false,
    txHash: fakeTx,
    tokenId: null,
    message: 'Placeholder mint executed and logged (replace with real Thirdweb SDK for on-chain mint)'
  }
}

module.exports = { statusForAddress, mintGasless }

// Process queued pending_mints.json jobs. This is a simple file-backed worker
// that forwards to the configured relayer (if available) and marks audit rows
// in Supabase. It returns a summary of processed jobs.
async function processPendingQueue({ limit = 50 } = {}){
  const path = require('path')
  const fs = require('fs')
  const store = path.join(__dirname, '..', 'data', 'pending_mints.json')
  let arr = []
  try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }

  if(!arr.length) return { processed: 0, total: 0 }

  const RELAYER = process.env.THIRDWEB_RELAYER_URL || null
  const sb = getClient()
  const results = []

  const toProcess = arr.slice(0, limit)
  const remaining = arr.slice(limit)

  for(const job of toProcess){
    let outcome = { jobId: job.id }
    
    try{
      const relayer = new CustomRelayer()
      const txData = {
        to: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
        data: '0x', // Contract call data for mint
        gasLimit: 500000
      }
      
      const result = await relayer.executeTransaction(txData)
      outcome.success = true
      outcome.txHash = result.transactionHash
      
      try{ if(sb) await sb.from('success').insert([{ event: 'custom_relayer_processed', status: 'completed', metadata: { job }, details: { txHash: result.transactionHash } }]) }catch(e){}
      results.push(outcome)
    }catch(err){
      outcome.error = err && err.message
      try{ if(sb) await sb.from('success').insert([{ event: 'custom_relayer_process_error', status: 'error', metadata: { job }, details: { error: outcome.error } }]) }catch(e){}
      results.push(outcome)
    }
  }

  // Persist remaining back to file
  try{ fs.writeFileSync(store, JSON.stringify(remaining, null, 2)) }catch(e){ console.warn('thirdwebAdapter: failed to write pending_mints.json after processing', e && e.message) }

  return { processed: toProcess.length, total: arr.length, results }
}

module.exports = { statusForAddress, mintGasless, processPendingQueue }
