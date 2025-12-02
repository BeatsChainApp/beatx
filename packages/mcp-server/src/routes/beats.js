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

    const { limit = 20, offset = 0, producer, genre, featured, search } = req.query;

    let data = []
    let error = null
    
    try {
      let query = supabase
        .from('beats')
        .select(`
          id, title, description, producer_address, producer_name, genre, bpm, 
          key_signature, duration_seconds, audio_url, cover_image_url, 
          price, pricing, tags, mood, energy_level, play_count, 
          is_featured, source, created_at, updated_at
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (producer) query = query.eq('producer_address', producer);
      if (genre) query = query.eq('genre', genre);
      if (featured === 'true') query = query.eq('is_featured', true);
      if (search) {
        query = query.or(`title.ilike.%${search}%,producer_name.ilike.%${search}%,genre.ilike.%${search}%`);
      }

      const result = await query.range(offset, offset + limit - 1);
      data = result.data
      error = result.error
    } catch (schemaError) {
      console.warn('Beats schema error:', schemaError.message)
      data = []
      error = schemaError
    }

    if (error) {
      console.error('Beats fetch error:', error);
      return res.json({ 
        success: true, 
        beats: [], 
        warning: 'Database connection issue',
        error: error.message 
      });
    }

    res.json({ success: true, beats: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Beats endpoint error:', error);
    res.json({ 
      success: true, 
      beats: [], 
      warning: 'Service temporarily unavailable',
      error: error.message 
    });
  }
});

// GET /api/beats/featured - Get featured beats
router.get('/beats/featured', async (req, res) => {
  try {
    const supabase = getClient();
    const { limit = 6 } = req.query;
    
    if (!supabase) {
      return res.json({ success: true, beats: [], mock: true });
    }

    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json({ success: true, beats: data || [] });
  } catch (error) {
    res.json({ success: true, beats: [], error: error.message });
  }
});

// GET /api/beats/analytics - Get beat analytics
router.get('/beats/analytics', async (req, res) => {
  try {
    const supabase = getClient();
    const { producer } = req.query;
    
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

    const beatData = {
      ...req.body,
      is_active: true,
      play_count: 0,
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('beats')
      .insert(beatData)
      .select()
      .single();

    if (error) {
      console.error('Beat creation error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    // Log analytics event
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'beat_created',
        user_address: beatData.producer_address,
        beat_id: data.id,
        metadata: { source: beatData.source || 'api' }
      });
    } catch (analyticsError) {
      console.warn('Analytics logging failed:', analyticsError);
    }

    res.json({ success: true, beat: data });
  } catch (error) {
    console.error('Beat creation endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/beats/:beatId - Get single beat
router.get('/beats/:beatId', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, beat: null, mock: true });
    }

    const { data, error } = await supabase
      .from('beats')
      .select('*')
      .eq('id', req.params.beatId)
      .eq('is_active', true)
      .single();

    if (error) {
      return res.status(404).json({ success: false, error: 'Beat not found' });
    }

    res.json({ success: true, beat: data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    const updates = { ...req.body, updated_at: new Date().toISOString() };
    
    const { data, error } = await supabase
      .from('beats')
      .update(updates)
      .eq('id', beatId)
      .select()
      .single();

    if (error) {
      console.error('Beat update error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, beat: data });
  } catch (error) {
    console.error('Beat update endpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/beats/:beatId - Delete beat (soft delete)
router.delete('/beats/:beatId', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ success: true, mock: true });
    }

    const { error } = await supabase
      .from('beats')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', req.params.beatId);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
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
    const { user_address, source = 'api' } = req.body;
    
    // Insert play record
    const { error: playError } = await supabase
      .from('beat_plays')
      .insert({
        beat_id: beatId,
        user_address,
        source
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

    // Log analytics event
    try {
      await supabase.from('analytics_events').insert({
        event_type: 'beat_played',
        user_address,
        beat_id: beatId,
        metadata: { source }
      });
    } catch (analyticsError) {
      console.warn('Analytics logging failed:', analyticsError);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Play tracking endpoint error:', error);
    res.json({ 
      success: true,
      warning: 'Play tracking unavailable',
      error: error.message
    });
  }
});

// GET /api/beats/genres - Get available genres
router.get('/beats/genres', async (req, res) => {
  try {
    const supabase = getClient();
    if (!supabase) {
      return res.json({ 
        success: true, 
        genres: ['Hip Hop', 'Trap', 'R&B', 'Afrobeats', 'Amapiano'], 
        mock: true 
      });
    }

    const { data, error } = await supabase
      .from('beats')
      .select('genre')
      .eq('is_active', true)
      .not('genre', 'is', null);

    if (error) throw error;
    
    const genres = [...new Set(data.map(b => b.genre))].sort();
    res.json({ success: true, genres });
  } catch (error) {
    res.json({ 
      success: true, 
      genres: ['Hip Hop', 'Trap', 'R&B', 'Afrobeats', 'Amapiano'], 
      error: error.message 
    });
  }
});

module.exports = router;