const express = require('express');
const { getClient } = require('../services/supabaseClient');
const router = express.Router();

// GET /api/purchases/:address - Get user purchases
router.get('/purchases/:address', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, purchases: [], mock: true });
    }

    const { data, error } = await supabase
      .from('purchases')
      .select(`
        *,
        beats(id, title, producer_name, audio_url),
        transactions(amount, payment_method, transaction_hash)
      `)
      .eq('buyer_address', req.params.address)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, purchases: data || [] });
  } catch (error) {
    res.json({ success: true, purchases: [], error: error.message });
  }
});

// POST /api/purchases/verify - Verify purchase access
router.post('/purchases/verify', async (req, res) => {
  try {
    const supabase = getClient();
    const { beatId, buyerAddress } = req.body;
    
    if (!supabase) {
      return res.json({ success: true, hasAccess: true, mock: true });
    }

    const { data, error } = await supabase
      .from('purchases')
      .select('license_type, download_url')
      .eq('beat_id', beatId)
      .eq('buyer_address', buyerAddress)
      .single();

    if (error || !data) {
      return res.json({ success: true, hasAccess: false });
    }

    res.json({ 
      success: true, 
      hasAccess: true, 
      licenseType: data.license_type,
      downloadUrl: data.download_url 
    });
  } catch (error) {
    res.json({ success: true, hasAccess: false, error: error.message });
  }
});

module.exports = router;