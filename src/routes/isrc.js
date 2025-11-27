const express = require('express')
const router = express.Router()
const supabase = require('../services/supabaseClient')

// Generate new ISRC code
router.post('/isrc/generate', async (req, res) => {
  try {
    const { trackTitle, artistName } = req.body

    // Generate ISRC format: CC-XXX-YY-NNNNN
    // CC = Country Code (ZA for South Africa)
    // XXX = Registrant Code (BTC for BeatsChain)
    // YY = Year (last 2 digits)
    // NNNNN = Designation Code (sequential)

    const year = new Date().getFullYear().toString().slice(-2)
    const countryCode = 'ZA'
    const registrantCode = 'BTC'
    
    // Get next designation number from database
    const { data: lastISRC } = await supabase
      .from('isrc_registry')
      .select('designation_code')
      .order('designation_code', { ascending: false })
      .limit(1)
      .single()

    const nextDesignation = lastISRC ? (parseInt(lastISRC.designation_code) + 1) : 1
    const designationCode = nextDesignation.toString().padStart(5, '0')
    
    const isrcCode = `${countryCode}-${registrantCode}-${year}-${designationCode}`

    // Store in database
    const { error } = await supabase
      .from('isrc_registry')
      .insert({
        isrc: isrcCode,
        track_title: trackTitle,
        artist_name: artistName,
        country_code: countryCode,
        registrant_code: registrantCode,
        year: year,
        designation_code: designationCode,
        generated_at: new Date().toISOString(),
        used: false
      })

    if (error) throw error

    res.json({
      success: true,
      isrc: isrcCode,
      breakdown: {
        countryCode,
        registrantCode,
        year,
        designationCode
      }
    })

  } catch (error) {
    console.error('ISRC generation error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'ISRC generation failed'
    })
  }
})

// Validate ISRC code
router.post('/isrc/validate', async (req, res) => {
  try {
    const { isrc } = req.body

    // Basic format validation
    const isrcPattern = /^[A-Z]{2}-[A-Z0-9]{3}-\d{2}-\d{5}$/
    const isValid = isrcPattern.test(isrc)

    if (!isValid) {
      return res.json({
        success: true,
        valid: false,
        reason: 'Invalid ISRC format'
      })
    }

    // Check if exists in our registry
    const { data: existing } = await supabase
      .from('isrc_registry')
      .select('*')
      .eq('isrc', isrc)
      .single()

    res.json({
      success: true,
      valid: true,
      exists: !!existing,
      data: existing || null
    })

  } catch (error) {
    console.error('ISRC validation error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'ISRC validation failed'
    })
  }
})

// Get ISRC registry
router.get('/isrc/registry', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query

    const { data: codes, error } = await supabase
      .from('isrc_registry')
      .select('*')
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    const { count } = await supabase
      .from('isrc_registry')
      .select('*', { count: 'exact', head: true })

    res.json({
      success: true,
      codes: codes || [],
      total: count || 0,
      limit: parseInt(limit),
      offset: parseInt(offset)
    })

  } catch (error) {
    console.error('ISRC registry error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch ISRC registry'
    })
  }
})

// Mark ISRC as used
router.post('/isrc/mark-used', async (req, res) => {
  try {
    const { isrc, trackTitle, artistName } = req.body

    const { error } = await supabase
      .from('isrc_registry')
      .update({
        used: true,
        track_title: trackTitle,
        artist_name: artistName,
        used_at: new Date().toISOString()
      })
      .eq('isrc', isrc)

    if (error) throw error

    res.json({
      success: true,
      message: 'ISRC marked as used'
    })

  } catch (error) {
    console.error('ISRC mark used error:', error)
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark ISRC as used'
    })
  }
})

module.exports = router