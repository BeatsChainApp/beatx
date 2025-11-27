const { getClient } = require('./supabaseClient')
const IpfsPinner = require('./ipfsPinner')
const fs = require('fs')
const path = require('path')

function fileStore(){
  const dir = path.join(__dirname, '..', 'data')
  try{ if(!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }) }catch(e){}
  return path.join(dir, 'campaigns.json')
}

async function createCampaign({ name, owner, metadata, budget = 0 }){
  const sb = getClient()
  // Pin metadata to IPFS first (best-effort)
  let ipfsCid = null
  try{
    const pinner = new IpfsPinner(process.env.WEB3STORAGE_TOKEN || null)
    const pin = await pinner.pinJSON({ name, metadata, owner, createdAt: new Date().toISOString() })
    ipfsCid = pin && pin.cid ? pin.cid : (pin && pin.ipfs) || null
  }catch(e){ console.warn('campaigns.createCampaign: ipfs pin failed', e && e.message) }

  const id = `camp-${Date.now()}-${Math.floor(Math.random()*1000)}`
  const row = { id, name, owner, ipfs_cid: ipfsCid, metadata, budget, remaining: budget, active: true, created_at: new Date().toISOString() }

  if(sb){
    const { data, error } = await sb.from('sponsored_campaigns').insert([{
      id: row.id,
      name: row.name,
      owner: row.owner,
      ipfs_cid: row.ipfs_cid,
      metadata: row.metadata,
      budget: row.budget,
      remaining: row.remaining,
      active: true
    }])
    if(error) throw error
    return data[0]
  }

  // file fallback
  try{
    const store = fileStore()
    let arr = []
    try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }
    arr.push(row)
    fs.writeFileSync(store, JSON.stringify(arr, null, 2))
    return row
  }catch(e){ throw e }
}

async function listCampaigns(){
  const sb = getClient()
  if(sb){
    const { data, error } = await sb.from('sponsored_campaigns').select('*').order('created_at',{ ascending: true }).limit(200)
    if(error) throw error
    return data
  }
  try{ return JSON.parse(fs.readFileSync(fileStore(),'utf8')||'[]') }catch(e){ return [] }
}

async function getCampaign(id){
  const sb = getClient()
  if(sb){
    const { data, error } = await sb.from('sponsored_campaigns').select('*').eq('id', id).single()
    if(error) return null
    return data
  }
  try{ const arr = JSON.parse(fs.readFileSync(fileStore(),'utf8')||'[]'); return arr.find(a=>a.id===id) || null }catch(e){ return null }
}

async function reserveBudget(id, amount){
  const sb = getClient()
  if(sb){
    try{
      // prefer calling Postgres function reserve_campaign_budget for atomic decrement
      const resp = await sb.rpc('reserve_campaign_budget', { p_campaign_id: id, p_amount: amount })
      // resp true/false or { data }
      if(resp === true) return true
      if(Array.isArray(resp) && resp.length && resp[0] === true) return true
      return false
    }catch(err){
      // fallback to read-update loop
      const { data, error } = await sb.from('sponsored_campaigns').select('remaining').eq('id', id).single()
      if(error) throw error
      const remaining = parseFloat(data.remaining || 0)
      if(remaining < amount) throw new Error('insufficient campaign funds')
      const { error: e2 } = await sb.from('sponsored_campaigns').update({ remaining: (remaining - amount) }).eq('id', id)
      if(e2) throw e2
      return true
    }
  }
  // file fallback: update json
  const store = fileStore()
  let arr = []
  try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }
  const idx = arr.findIndex(a=>a.id===id)
  if(idx === -1) throw new Error('campaign not found')
  const remaining = parseFloat(arr[idx].remaining || 0)
  if(remaining < amount) throw new Error('insufficient campaign funds')
  arr[idx].remaining = remaining - amount
  fs.writeFileSync(store, JSON.stringify(arr, null, 2))
  return true
}

async function addFunds(id, amount){
  const sb = getClient()
  if(sb){
    const { data, error } = await sb.from('sponsored_campaigns').select('remaining').eq('id', id).single()
    if(error) throw error
    const remaining = parseFloat(data.remaining || 0)
    const { error: e2 } = await sb.from('sponsored_campaigns').update({ remaining: (remaining + amount) }).eq('id', id)
    if(e2) throw e2
    return true
  }
  const store = fileStore()
  let arr = []
  try{ arr = JSON.parse(fs.readFileSync(store,'utf8')||'[]') }catch(e){ arr = [] }
  const idx = arr.findIndex(a=>a.id===id)
  if(idx === -1) throw new Error('campaign not found')
  const remaining = parseFloat(arr[idx].remaining || 0)
  arr[idx].remaining = remaining + amount
  fs.writeFileSync(store, JSON.stringify(arr, null, 2))
  return true
}

module.exports = { createCampaign, listCampaigns, getCampaign, reserveBudget }
