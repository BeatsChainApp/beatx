const express = require('express')
const router = express.Router()
const Thirdweb = require('../services/thirdwebAdapter')
const path = require('path')
const fs = require('fs')
const Jobs = require('../services/thirdwebJobs')
const adminAuth = require('../middleware/adminAuth')

// POST /api/thirdweb/status { address }
router.post('/thirdweb/status', async (req, res) => {
  try{
    const { address } = req.body || {}
    const status = await Thirdweb.statusForAddress(address)
    res.json({ success: true, ...status })
  }catch(err){
    console.error('thirdweb status error', err)
    res.status(500).json({ success: false, message: err && err.message })
  }
})

// POST /api/thirdweb/mint { to, metadataUri, metadata, campaignId }
router.post('/thirdweb/mint', async (req, res) => {
  try{
    const { to, metadataUri, metadata, campaignId } = req.body || {}
    if(!to) return res.status(400).json({ success: false, message: 'to required' })

    // If a campaignId is provided, attempt to reserve budget
    if(campaignId){
      const Campaigns = require('../services/campaigns')
      const Credit = require('../services/creditLedger')
      const cost = parseFloat(process.env.SPONSORED_MINT_COST || '1')
      const campaign = await Campaigns.getCampaign(campaignId)
      if(!campaign) return res.status(404).json({ success: false, message: 'campaign not found' })
      // reserve budget (RPC function will return true/false)
      try{
        const ok = await Campaigns.reserveBudget(campaignId, cost)
        if(!ok) return res.status(402).json({ success: false, message: 'campaign has insufficient funds' })
        // record ledger reservation
        await Credit.addEntry({ wallet: campaign.owner || `campaign:${campaignId}`, delta: -cost, reason: 'sponsored_mint_reserved', meta: { campaignId } })
      }catch(e){
        console.error('campaign reserve error', e)
        return res.status(502).json({ success: false, message: 'campaign reserve failed' })
      }
    }

    let result
    try{
      result = await Thirdweb.mintGasless({ to, metadataUri, metadata })
    }catch(err){
      // if we reserved campaign funds earlier, refund
      if(campaignId){
        const Campaigns = require('../services/campaigns')
        const Credit = require('../services/creditLedger')
        const cost = parseFloat(process.env.SPONSORED_MINT_COST || '1')
        try{ await Campaigns.addFunds(campaignId, cost) }catch(e){ console.warn('refund failed', e && e.message) }
        try{ await Credit.addEntry({ wallet: `campaign:${campaignId}`, delta: cost, reason: 'sponsored_mint_refund', meta: { campaignId } }) }catch(e){}
      }
      throw err
    }

    res.json({ success: true, result })
  }catch(err){
    console.error('thirdweb mint error', err)
    res.status(500).json({ success: false, message: err && err.message })
  }
})

// GET /api/thirdweb/pending - returns the pending_mints.json array
router.get('/thirdweb/pending', async (req, res) => {
  try{
    const pending = await Jobs.listPending(200)
    res.json({ success: true, pending })
  }catch(err){
    console.error('thirdweb pending error', err)
    res.status(500).json({ success: false, message: err && err.message })
  }
})

// POST /api/thirdweb/process-queue - run the processPendingQueue worker (optional admin)
router.post('/thirdweb/process-queue', adminAuth, async (req, res) => {
  try{
    const { limit } = req.body || {}
    // Prefer processing via Supabase-backed Jobs claim -> forward
    const workerId = `worker-${Date.now()}-${Math.floor(Math.random()*1000)}`
    const limitN = limit || 50
    const claimed = await Jobs.claimJobs(workerId, limitN)
    const results = []
    for(const job of claimed){
      try{
        // forward each job to relayer if configured
        const outcome = await Thirdweb.processPendingQueue ? await Thirdweb.processPendingQueue({ limit: 1 }) : null
        results.push({ jobId: job.id, outcome })
      }catch(err){
        console.error('process-queue job forward error', err)
        results.push({ jobId: job.id, error: err && err.message })
      }
    }
    res.json({ success: true, claimed: claimed.length, results })
  }catch(err){
    console.error('thirdweb process-queue error', err)
    res.status(500).json({ success: false, message: err && err.message })
  }
})

module.exports = router

