const express = require('express');
const { getClient } = require('../services/supabaseClient');
const router = express.Router();

// GET /api/analytics/overview - System overview
router.get('/analytics/overview', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({
        success: true,
        overview: {
          totalBeats: 0,
          totalUsers: 0,
          totalSales: 0,
          totalRevenue: 0
        },
        mock: true
      });
    }

    const [beatsResult, usersResult, salesResult] = await Promise.all([
      supabase.from('beats').select('count', { count: 'exact' }).eq('is_active', true),
      supabase.from('users').select('count', { count: 'exact' }),
      supabase.from('transactions').select('amount').eq('status', 'completed')
    ]);

    const totalRevenue = salesResult.data?.reduce((sum, t) => sum + parseFloat(t.amount || 0), 0) || 0;

    res.json({
      success: true,
      overview: {
        totalBeats: beatsResult.count || 0,
        totalUsers: usersResult.count || 0,
        totalSales: salesResult.data?.length || 0,
        totalRevenue: totalRevenue.toFixed(2)
      }
    });
  } catch (error) {
    res.json({
      success: true,
      overview: { totalBeats: 0, totalUsers: 0, totalSales: 0, totalRevenue: 0 },
      error: error.message
    });
  }
});

// GET /api/analytics/beats - Beat analytics
router.get('/analytics/beats', async (req, res) => {
  try {
    const supabase = getClient();
    const { producer, timeframe = '30d' } = req.query;
    
    if (!supabase) {
      return res.json({ success: true, analytics: [], mock: true });
    }

    let query = supabase.from('beat_analytics').select('*');
    if (producer) {
      query = query.eq('producer_address', producer);
    }

    const { data, error } = await query.order('total_revenue', { ascending: false });
    if (error) throw error;

    res.json({ success: true, analytics: data || [] });
  } catch (error) {
    res.json({ success: true, analytics: [], error: error.message });
  }
});

// GET /api/analytics/producers - Producer analytics
router.get('/analytics/producers', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, producers: [], mock: true });
    }

    const { data, error } = await supabase
      .from('producer_dashboard')
      .select('*')
      .order('total_earnings', { ascending: false });

    if (error) throw error;
    res.json({ success: true, producers: data || [] });
  } catch (error) {
    res.json({ success: true, producers: [], error: error.message });
  }
});

// GET /api/analytics/events - Recent events
router.get('/analytics/events', async (req, res) => {
  try {
    const supabase = getClient();
    const { limit = 50, event_type } = req.query;
    
    if (!supabase) {
      return res.json({ success: true, events: [], mock: true });
    }

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (event_type) {
      query = query.eq('event_type', event_type);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, events: data || [] });
  } catch (error) {
    res.json({ success: true, events: [], error: error.message });
  }
});

// POST /api/analytics/track - Track custom event
router.post('/analytics/track', async (req, res) => {
  try {
    const supabase = getClient();
    const { event_type, user_address, beat_id, metadata = {} } = req.body;
    
    if (!supabase) {
      return res.json({ success: true, mock: true });
    }

    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type,
        user_address,
        beat_id,
        metadata,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.json({ success: true, error: error.message });
  }
});

module.exports = router;