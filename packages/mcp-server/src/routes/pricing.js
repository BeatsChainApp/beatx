const express = require('express');
const { getClient } = require('../services/supabaseClient');
const router = express.Router();

// GET /api/pricing/:beatId - Get beat pricing
router.get('/pricing/:beatId', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, pricing: { basic: 10, premium: 25, exclusive: 100 }, mock: true });
    }

    const { data, error } = await supabase
      .from('beats')
      .select('pricing, price')
      .eq('id', req.params.beatId)
      .single();

    if (error) throw error;

    const pricing = data?.pricing || { basic: data?.price || 25, premium: (data?.price || 25) * 2, exclusive: (data?.price || 25) * 4 };
    res.json({ success: true, pricing });
  } catch (error) {
    res.json({ success: true, pricing: { basic: 10, premium: 25, exclusive: 100 }, error: error.message });
  }
});

// PUT /api/pricing/:beatId - Update beat pricing
router.put('/pricing/:beatId', async (req, res) => {
  try {
    const supabase = getClient();
    const { pricing } = req.body;
    
    if (!supabase) {
      return res.json({ success: true, mock: true, pricing });
    }

    const { error } = await supabase
      .from('beats')
      .update({ pricing, price: pricing.premium, updated_at: new Date().toISOString() })
      .eq('id', req.params.beatId);

    if (error) throw error;
    res.json({ success: true, pricing });
  } catch (error) {
    res.json({ success: true, pricing: req.body.pricing, error: error.message });
  }
});

module.exports = router;