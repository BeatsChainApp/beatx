const express = require('express')
const router = express.Router()
const { getClient } = require('../services/supabaseClient')
const fs = require('fs')
const path = require('path')

const DATA_PATH = path.join(__dirname, '..', '..', 'data')
const STORE_FILE = path.join(DATA_PATH, 'success_store.json')

function ensureStore(){
  if(!fs.existsSync(DATA_PATH)) fs.mkdirSync(DATA_PATH, { recursive: true })
  if(!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify([]), 'utf8')
}

async function listFromSupabase(limit=20){
  const sb = getClient();
  if(!sb) return null;
  const { data, error } = await sb.from('success').select('*').order('created_at', { ascending: false }).limit(limit)
  if(error) throw error
  return data
}

async function insertToSupabase(row){
  const sb = getClient();
  if(!sb) return null;
  const { data, error } = await sb.from('success').insert([row]).select()
  if(error) throw error
  return data && data[0]
}

// GET /api/success?limit=10
router.get('/success', async (req, res) => {
  const limit = parseInt(req.query.limit || '20', 10)
  try{
    const sbList = await listFromSupabase(limit)
    if(sbList) return res.json({ success: true, rows: sbList })
  }catch(err){
    console.warn('supabase list failed', err && err.message)
  }

  // fallback to file
  try{
    ensureStore()
    const raw = fs.readFileSync(STORE_FILE, 'utf8')
    const arr = JSON.parse(raw || '[]')
    return res.json({ success: true, rows: arr.slice(-limit).reverse() })
  }catch(err){
    console.error('file store read failed', err && err.message)
    return res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/success/:id
router.get('/success/:id', async (req, res) => {
  const id = req.params.id
  try{
    const sb = getClient()
    if(sb){
      const { data, error } = await sb.from('success').select('*').eq('id', id).limit(1)
      if(error) throw error
      return res.json({ success: true, row: data && data[0] || null })
    }
  }catch(err){
    console.warn('supabase get failed', err && err.message)
  }

  try{
    ensureStore()
    const arr = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8') || '[]')
    const found = arr.find(r => r.id === id)
    return res.json({ success: true, row: found || null })
  }catch(err){
    console.error('file store get failed', err && err.message)
    return res.status(500).json({ success: false, message: err.message })
  }
})

// POST /api/success
// body: { event, status, metadata?, details?, user_id? }
router.post('/success', async (req, res) => {
  const body = req.body || {}
  if(!body.event) return res.status(400).json({ success: false, message: 'event required' })

  const row = {
    event: body.event,
    status: body.status || 'pending',
    metadata: body.metadata || {},
    details: body.details || {},
    user_id: body.user_id || null,
  }

  try{
    const inserted = await insertToSupabase(row)
    if(inserted) return res.json({ success: true, row: inserted })
  }catch(err){
    console.warn('supabase insert failed', err && err.message)
  }

  // fallback to file
  try{
    ensureStore()
    const arr = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8') || '[]')
    const uuid = (Date.now().toString(16) + '-' + Math.random().toString(16).slice(2,10))
    const toSave = { id: uuid, created_at: new Date().toISOString(), updated_at: null, ...row }
    arr.push(toSave)
    fs.writeFileSync(STORE_FILE, JSON.stringify(arr, null, 2), 'utf8')
    return res.json({ success: true, row: toSave })
  }catch(err){
    console.error('file store insert failed', err && err.message)
    return res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
