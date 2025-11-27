const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const { getClient } = require('./services/supabaseClient')

const STORE_FILE = path.join(__dirname, '..', 'data', 'isrc_registry.json')

function ensureStore() {
  const dir = path.dirname(STORE_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify({ lastDesignation: 200, codes: {}, year: new Date().getFullYear().toString().slice(-2) }, null, 2))
}

function readStore() {
  ensureStore()
  const raw = fs.readFileSync(STORE_FILE, 'utf8')
  return JSON.parse(raw)
}

function writeStore(obj) {
  ensureStore()
  fs.writeFileSync(STORE_FILE, JSON.stringify(obj, null, 2))
}

function pad5(n) {
  return String(n).padStart(5, '0')
}

function hashToNumber(str) {
  const h = crypto.createHash('sha256').update(String(str)).digest()
  // take first 4 bytes
  return Math.abs(h.readInt32BE(0))
}

function calculateUserRange(userId) {
  const hash = hashToNumber(userId || 'anonymous')
  const rangeIndex = hash % 90
  const start = 200 + (rangeIndex * 1000)
  const end = Math.min(start + 999, 99999)
  if (end > 99999) return { start: 200, end: 1199 }
  return { start, end, rangeIndex }
}

function validateISRC(isrc) {
  if (!isrc || typeof isrc !== 'string') return false
  const pattern = /^ZA-80G-\d{2}-\d{5}$/
  return pattern.test(isrc.trim())
}

function getNextDesignation(registry, userRange) {
  if (!registry.lastDesignation || typeof registry.lastDesignation !== 'number') registry.lastDesignation = userRange.start
  registry.lastDesignation += 1
  if (registry.lastDesignation > userRange.end) throw new Error('ISRC limit reached for this user')
  return pad5(registry.lastDesignation)
}

async function generateISRC({ title = '', artist = '', userId = 'anonymous' } = {}) {
  const year = new Date().getFullYear().toString().slice(-2)
  const registrant = '80G'
  const territory = 'ZA'

  const store = readStore()
  // reset year if necessary
  if (store.year !== year) {
    store.lastDesignation = calculateUserRange(userId).start
    store.codes = {}
    store.year = year
  }

  const userRange = calculateUserRange(userId)

  const designation = getNextDesignation(store, userRange)
  const isrc = `${territory}-${registrant}-${year}-${designation}`

  if (!validateISRC(isrc)) throw new Error('Generated ISRC invalid')

  const record = {
    trackTitle: String(title).substring(0, 100),
    artistName: String(artist).substring(0, 100),
    generated: new Date().toISOString(),
    userId,
    used: false,
    year,
    designation
  }

  // If Supabase is configured, persist there; otherwise fall back to file store
  const sb = getClient()
  if (sb) {
    try {
      await sb.from('isrc_registry').insert({ isrc, created_by: userId, metadata: record })
      return isrc
    } catch (err) {
      console.warn('Supabase insert failed, falling back to file store', err && err.message)
    }
  }

  store.codes[isrc] = record
  writeStore(store)
  return isrc
}

async function getRegistrySummary() {
  const sb = getClient()
  if (sb) {
    try {
      const { data, error } = await sb.from('isrc_registry').select('*')
      if (error) throw error
      const total = (data && data.length) || 0
      const used = (data && data.filter(d => d.metadata && d.metadata.used).length) || 0
      const available = total - used
      return { total, used, available, year: new Date().getFullYear().toString().slice(-2), lastDesignation: null }
    } catch (err) {
      console.warn('Supabase summary failed, falling back to file store', err && err.message)
    }
  }

  const store = readStore()
  const total = Object.keys(store.codes || {}).length
  const used = Object.values(store.codes || {}).filter(c => c.used).length
  const available = total - used
  return { total, used, available, year: store.year, lastDesignation: store.lastDesignation }
}

module.exports = { generateISRC, getRegistrySummary, readStore, writeStore, STORE_FILE }
