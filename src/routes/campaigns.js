const express = require('express')
const router = express.Router()
const supabase = require('../services/supabaseClient')

// Track sponsor revenue
router.post('/campaigns/track-revenue', async (req, res) => {
  try {
    const { type, amount, metadata = {} } = req.body

    // Record revenue in credit ledger
    const { error } = await supabase
      .from('credit_ledger')
      .insert({
        wallet: 'sponsor-system',
        delta: amount,
        reason: `sponsor_revenue_${type}`,
        meta: {
          type,
          ...metadata,
          timestamp: new Date().toISOString()
        },
        created_at: new Date().toISOString()
      })

    if (error) throw error

    // Update campaign statistics if campaignId provided
    if (metadata.campaignId) {
      await supabase
        .from('sponsored_campaigns')
        .update({
          total_revenue: supabase.raw('total_revenue + ?', [amount]),
          updated_at: new Date().toISOString()
        })
        .eq('id', metadata.campaignId)
    }

    res.json({
      success: true,
      revenue: amount,
      type,
      message: 'Revenue tracked successfully'
    })

  } catch (error) {
    console.error('Revenue tracking error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track revenue'
    })
  }
})

// Get campaign statistics
router.get('/campaigns/stats', async (req, res) => {
  try {
    // Get total sponsor revenue
    const { data: revenueData } = await supabase
      .from('credit_ledger')
      .select('delta')
      .like('reason', 'sponsor_revenue_%')

    const totalRevenue = revenueData?.reduce((sum, entry) => sum + entry.delta, 0) || 0

    // Get active campaigns
    const { data: campaigns } = await supabase
      .from('sponsored_campaigns')
      .select('*')
      .eq('active', true)

    // Get recent revenue entries
    const { data: recentRevenue } = await supabase
      .from('credit_ledger')
      .select('*')
      .like('reason', 'sponsor_revenue_%')
      .order('created_at', { ascending: false })
      .limit(10)

    res.json({
      success: true,
      stats: {
        totalRevenue,
        activeCampaigns: campaigns?.length || 0,
        campaigns: campaigns || [],
        recentRevenue: recentRevenue || []
      }
    })

  } catch (error) {
    console.error('Campaign stats error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch campaign stats'
    })
  }
})

// Create new sponsored campaign
router.post('/campaigns/create', async (req, res) => {
  try {
    const {
      name,
      description,
      budget,
      costPerMint = 2.50,
      dailyLimit = 100,
      owner = 'system'
    } = req.body

    const { data: campaign, error } = await supabase
      .from('sponsored_campaigns')
      .insert({
        name,
        description,
        budget: parseFloat(budget),
        remaining_budget: parseFloat(budget),
        cost_per_mint: parseFloat(costPerMint),
        daily_limit: parseInt(dailyLimit),
        owner,
        active: true,
        total_revenue: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      campaign,
      message: 'Campaign created successfully'
    })

  } catch (error) {
    console.error('Campaign creation error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create campaign'
    })
  }
})

// Get sponsor content for placement
router.get('/campaigns/sponsor-content/:type', async (req, res) => {
  try {
    const { type } = req.params

    // Mock sponsor content - in production, this would come from active campaigns
    const sponsorContent = {
      'enhanced-mint': {
        name: 'BeatsChain Pro',
        logo: '/images/beatschain-logo.png',
        title: 'Upgrade to Professional Features',
        description: 'Get unlimited uploads, priority support, and advanced analytics',
        url: 'https://beatschain.app/pro',
        ctaText: 'Upgrade Now',
        revenue: 2.50
      },
      'isrc-minting': {
        name: 'Music Distribution Partner',
        logo: '/images/distribution-partner.png',
        title: 'Global Music Distribution',
        description: 'Distribute your music to Spotify, Apple Music, and 150+ platforms',
        url: 'https://partner.beatschain.app/distribute',
        ctaText: 'Start Distribution',
        revenue: 2.50
      }
    }

    const content = sponsorContent[type]
    
    if (!content) {
      return res.json({
        success: true,
        content: null,
        message: 'No sponsor content available for this type'
      })
    }

    res.json({
      success: true,
      content,
      type
    })

  } catch (error) {
    console.error('Sponsor content error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch sponsor content'
    })
  }
})

module.exports = router