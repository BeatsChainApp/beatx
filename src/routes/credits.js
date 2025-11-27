const express = require('express')
const router = express.Router()
const { addEntry, listEntries } = require('../services/creditLedger')

// POST /api/credits
router.post('/credits', async (req, res) => {
  try {
    const { wallet, delta, reason, meta } = req.body || {}
    if (!wallet || typeof delta === 'undefined') return res.status(400).json({ success: false, message: 'wallet and delta required' })
    const entry = await addEntry({ wallet, delta, reason, meta })
    res.json({ success: true, entry })
  } catch (err) {
    console.error('credits add error', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

// GET /api/credits?wallet=<addr>
router.get('/credits', async (req, res) => {
  try {
    const wallet = req.query.wallet
    const entries = await listEntries({ wallet })
    res.json({ success: true, entries })
  } catch (err) {
    console.error('credits list error', err)
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
