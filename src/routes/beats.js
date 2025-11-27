const express = require('express');
const { getClient } = require('../services/supabaseClient');

const router = express.Router();

// GET /api/beats - Get all active beats
router.get('/beats', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      console.warn('Supabase not configured - returning mock data');
      return res.json({ 
        success: true, 
        beats: [],
        mock: true,
        message: 'Supabase not configured - using mock data'
      });
    }

    const { limit = 20, offset = 0, producer } = req.query;

    let query = supabase
      .from('beats')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (producer) {
      query = query.eq('producer_address', producer);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Beats fetch error:', error);
      // Return empty array instead of error for graceful degradation
      return res.json({ 
        success: true, 
        beats: [], 
        warning: 'Database connection issue',
        error: error.message 
      });
    }

    res.json({ success: true, beats: data || [] });
  } catch (error) {
    console.error('Beats endpoint error:', error);
    // Graceful degradation instead of 500 error
    res.json({ 
      success: true, 
      beats: [], 
      warning: 'Service temporarily unavailable',
      error: error.message 
    });
  }
});

// POST /api/beats - Create new beat
router.post('/beats', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      console.warn('Supabase not configured - returning mock response');
      const mockBeat = {
        id: `mock-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString(),
        is_active: true
      };
      return res.json({ 
        success: true, 
        beat: mockBeat,
        mock: true,
        message: 'Beat created in mock mode - database not configured'
      });
    }

    const beatData = req.body;
    
    const { data, error } = await supabase
      .from('beats')
      .insert(beatData)
      .select()
      .single();

    if (error) {
      console.error('Beat creation error:', error);
      // Return mock response instead of error
      const mockBeat = {
        id: `fallback-${Date.now()}`,
        ...beatData,
        created_at: new Date().toISOString(),
        is_active: true
      };
      return res.json({ 
        success: true, 
        beat: mockBeat,
        warning: 'Database unavailable - created mock beat',
        error: error.message
      });
    }

    res.json({ success: true, beat: data });
  } catch (error) {
    console.error('Beat creation endpoint error:', error);
    // Graceful fallback
    const mockBeat = {
      id: `error-fallback-${Date.now()}`,
      ...req.body,
      created_at: new Date().toISOString(),
      is_active: true
    };
    res.json({ 
      success: true, 
      beat: mockBeat,
      warning: 'Service error - created fallback beat',
      error: error.message
    });
  }
});

// PUT /api/beats/:beatId - Update beat
router.put('/beats/:beatId', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      const mockBeat = {
        id: req.params.beatId,
        ...req.body,
        updated_at: new Date().toISOString()
      };
      return res.json({ 
        success: true, 
        beat: mockBeat,
        mock: true,
        message: 'Beat updated in mock mode'
      });
    }

    const { beatId } = req.params;
    const updates = req.body;
    
    const { data, error } = await supabase
      .from('beats')
      .update(updates)
      .eq('beat_id', beatId)
      .select()
      .single();

    if (error) {
      console.error('Beat update error:', error);
      const mockBeat = {
        id: beatId,
        ...updates,
        updated_at: new Date().toISOString()
      };
      return res.json({ 
        success: true, 
        beat: mockBeat,
        warning: 'Database unavailable - mock update',
        error: error.message
      });
    }

    res.json({ success: true, beat: data });
  } catch (error) {
    console.error('Beat update endpoint error:', error);
    const mockBeat = {
      id: req.params.beatId,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    res.json({ 
      success: true, 
      beat: mockBeat,
      warning: 'Service error - mock update',
      error: error.message
    });
  }
});

// POST /api/beats/:beatId/play - Track beat play
router.post('/beats/:beatId/play', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      console.log('Play tracked in mock mode for beat:', req.params.beatId);
      return res.json({ 
        success: true,
        mock: true,
        message: 'Play tracked in mock mode'
      });
    }

    const { beatId } = req.params;
    const { user_address, source = 'api', optimized = false } = req.body;
    
    // Insert play record
    const { error: playError } = await supabase
      .from('beat_plays')
      .insert({
        beat_id: beatId,
        user_address,
        source,
        optimized
      });

    if (playError) {
      console.error('Play tracking error:', playError);
    }

    // Increment play count using RPC function
    const { error: incrementError } = await supabase
      .rpc('increment_beat_plays', { beat_id: beatId });

    if (incrementError) {
      console.error('Play increment error:', incrementError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Play tracking endpoint error:', error);
    // Graceful degradation - don't fail the request
    res.json({ 
      success: true,
      warning: 'Play tracking unavailable',
      error: error.message
    });
  }
});

module.exports = router;