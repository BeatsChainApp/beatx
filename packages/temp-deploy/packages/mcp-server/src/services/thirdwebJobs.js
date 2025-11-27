const { getClient } = require('./supabaseClient')
const fs = require('fs')
const path = require('path')

// Provides an abstraction for enqueuing and processing thirdweb mint jobs.
// Uses Supabase when available; falls back to a file-backed queue stored at src/data/pending_mints.json

function fileStorePath(){
  return path.join(__dirname, '..', 'data', 'pending_mints.json')
}

async function enqueueFile(job){
  try{
    const store = fileStorePath()
    let arr = []
    try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }
    arr.push(job)
    fs.writeFileSync(store, JSON.stringify(arr, null, 2))
    return job
  }catch(e){
    throw new Error('file enqueue failed: '+ (e && e.message))
  }
}

async function listFile(){
  const store = fileStorePath()
  try{ return JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ return [] }
}

async function dequeueFile(limit=50){
  const store = fileStorePath()
  let arr = []
  try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }
  const take = arr.slice(0, limit)
  const remaining = arr.slice(limit)
  try{ fs.writeFileSync(store, JSON.stringify(remaining, null, 2)) }catch(e){}
  return take
}

async function enqueue(job){
  const sb = getClient()
  if(sb){
    // Insert into Supabase jobs table
    const { data, error } = await sb.from('thirdweb_jobs').insert([{
      id: job.id,
      created_at: job.createdAt,
      to_address: job.to,
      metadata_uri: job.metadataUri,
      metadata: job.metadata,
      client_id: job.clientId,
      status: 'queued',
      details: {}
    }])
    if(error) throw error
    return data[0]
  }
  return enqueueFile(job)
}

async function listPending(limit=100){
  const sb = getClient()
  if(sb){
    const { data, error } = await sb.from('thirdweb_jobs').select('*').eq('status','queued').order('created_at',{ ascending: true }).limit(limit)
    if(error) throw error
    return data
  }
  return listFile()
}

// Claim up to `limit` jobs for processing and mark them as processing by this workerId.
async function claimJobs(workerId, limit=50){
  const sb = getClient()
  if(sb){
    // Use a CTE to atomically claim rows: select queued rows FOR UPDATE SKIP LOCKED and update them
    try{
      // prefer calling the stored procedure claim_thirdweb_jobs via RPC
      const resp = await sb.rpc('claim_thirdweb_jobs', { p_worker_id: workerId, p_limit: limit })
      // supabase rpc typically returns an array of rows
      if(Array.isArray(resp)) return resp
      return resp || []
    }catch(err){
      console.warn('thirdwebJobs.claimJobs: claim_thirdweb_jobs rpc failed, falling back to select/update loop', err && err.message)
      const client = sb
      const { data: rows } = await client.from('thirdweb_jobs').select('*').eq('status','queued').order('created_at',{ ascending: true }).limit(limit)
      if(!rows || !rows.length) return []
      const claimed = []
      for(const r of rows){
        const { error } = await client.from('thirdweb_jobs').update({ status: 'processing', processing_by: workerId, processing_at: new Date().toISOString() }).eq('id', r.id)
        if(error) continue
        claimed.push(r)
      }
      return claimed
    }
  }
  // File fallback: just dequeue from file
  return dequeueFile(limit)
}

async function markJobResult(id, result){
  const sb = getClient()
  if(sb){
    const { error } = await sb.from('thirdweb_jobs').update({ status: result.success ? 'forwarded' : 'failed', result: result, processing_at: new Date().toISOString() }).eq('id', id)
    if(error) throw error
    return true
  }
  // file fallback: append to processed file (audit) — keep it simple
  try{
    const audits = path.join(__dirname, '..', 'data', 'thirdweb_job_audit.json')
    let arr = []
    try{ arr = JSON.parse(fs.readFileSync(audits,'utf8')||'[]') }catch(e){ arr = [] }
    arr.push({ id, result, ts: new Date().toISOString() })
    fs.writeFileSync(audits, JSON.stringify(arr, null, 2))
    return true
  }catch(e){ return false }
}

module.exports = { enqueue, listPending, claimJobs, markJobResult }
