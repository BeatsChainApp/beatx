const { getClient } = require('./supabaseClient')
const fs = require('fs')
const path = require('path')

const STORE_DIR = path.join(__dirname, '..', 'data')
const STORE_FILE = path.join(STORE_DIR, 'credit_ledger.json')

function ensureStore() {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify([], null, 2))
}

async function addEntry({ wallet, delta, reason, meta } = {}) {
  const sb = getClient()
  if (sb) {
    const { data, error } = await sb.from('credit_ledger').insert([{ wallet, delta, reason, meta }])
    if (error) throw error
    return data && data[0]
  }

  // Fallback to local file store
  ensureStore()
  const raw = fs.readFileSync(STORE_FILE, 'utf8')
  const items = JSON.parse(raw || '[]')
  const entry = { id: `local-${Date.now()}`, wallet, delta, reason, meta, created_at: new Date().toISOString() }
  items.unshift(entry)
  fs.writeFileSync(STORE_FILE, JSON.stringify(items, null, 2))
  return entry
}

async function listEntries(filter = {}) {
  const sb = getClient()
  if (sb) {
    let q = sb.from('credit_ledger').select('*')
    if (filter.wallet) q = q.eq('wallet', filter.wallet)
    const { data, error } = await q.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  ensureStore()
  const raw = fs.readFileSync(STORE_FILE, 'utf8')
  const items = JSON.parse(raw || '[]')
  if (filter.wallet) return items.filter(i => i.wallet === filter.wallet)
  return items
}

module.exports = { addEntry, listEntries }
