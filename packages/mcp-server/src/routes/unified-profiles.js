const express = require('express');
const { getClient } = require('../services/supabaseClient');
const { UnifiedProfileSystem } = require('../../../shared/auth/unified-profile-system');

const router = express.Router();
const profileSystem = new UnifiedProfileSystem();

// Initialize profile system
profileSystem.initialize().catch(console.error);

// Authenticate user and create/merge profile
router.post('/profiles/authenticate', async (req, res) => {
  try {
    const userData = req.body;
    
    if (!userData.email && !userData.wallet_address && !userData.google_id && !userData.whatsapp_id) {
      return res.status(400).json({
        success: false,
        message: 'At least one identifier required (email, wallet_address, google_id, or whatsapp_id)'
      });
    }

    const result = await profileSystem.authenticateUser(userData);
    
    // Log authentication event
    if (result.success) {
      const supabase = getClient();
      if (supabase) {
        await supabase.from('user_activity_log').insert({
          user_id: result.profile.user_id,
          platform: userData.platform || 'mcp',
          activity_type: 'authentication',
          details: {
            method: userData.auth_method || 'unknown',
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
          }
        }).catch(console.warn);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile by any identifier
router.get('/profiles/find', async (req, res) => {
  try {
    const { email, wallet_address, google_id, whatsapp_id, user_id } = req.query;
    
    if (!email && !wallet_address && !google_id && !whatsapp_id && !user_id) {
      return res.status(400).json({
        success: false,
        message: 'At least one identifier required'
      });
    }

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { data, error } = await supabase.rpc('get_unified_profile', {
      p_email: email || null,
      p_wallet_address: wallet_address || null,
      p_google_id: google_id || null,
      p_whatsapp_id: whatsapp_id || null,
      p_user_id: user_id || null
    });

    if (error) throw error;

    res.json({
      success: true,
      profile: data[0] || null
    });
  } catch (error) {
    console.error('Find profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user profile
router.put('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    const result = await profileSystem.updateProfile(userId, updates);
    
    // Log update event
    if (result.success) {
      const supabase = getClient();
      if (supabase) {
        await supabase.from('user_activity_log').insert({
          user_id: userId,
          platform: updates.platform || 'mcp',
          activity_type: 'profile_update',
          details: {
            updated_fields: Object.keys(updates),
            ip_address: req.ip,
            user_agent: req.headers['user-agent']
          }
        }).catch(console.warn);
      }
    }

    res.json(result);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user profile
router.get('/profiles/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await profileSystem.getProfile(userId);
    res.json(result);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync profile across platforms
router.post('/profiles/:userId/sync', async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform } = req.body;

    const profileResult = await profileSystem.getProfile(userId);
    if (!profileResult.success || !profileResult.profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    await profileSystem.syncProfileToAllPlatforms(profileResult.profile);

    // Log sync event
    const supabase = getClient();
    if (supabase) {
      await supabase.from('profile_sync_events').insert({
        user_id: userId,
        platform: platform || 'mcp',
        event_type: 'sync',
        data: { triggered_by: 'api' },
        success: true
      }).catch(console.warn);
    }

    res.json({
      success: true,
      message: 'Profile synced across all platforms'
    });
  } catch (error) {
    console.error('Sync profile error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user activity log
router.get('/profiles/:userId/activity', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, platform } = req.query;

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    let query = supabase
      .from('user_activity_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq('platform', platform);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      activity: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data.length
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get wallet mappings for user
router.get('/profiles/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { data, error } = await supabase
      .from('wallet_mappings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      wallets: data
    });
  } catch (error) {
    console.error('Get wallets error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Add wallet mapping
router.post('/profiles/:userId/wallets', async (req, res) => {
  try {
    const { userId } = req.params;
    const { platform, wallet_address, wallet_type = 'connected', is_primary = false, metadata = {} } = req.body;

    if (!platform || !wallet_address) {
      return res.status(400).json({
        success: false,
        message: 'platform and wallet_address required'
      });
    }

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    // If setting as primary, unset other primary wallets
    if (is_primary) {
      await supabase
        .from('wallet_mappings')
        .update({ is_primary: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('wallet_mappings')
      .insert({
        user_id: userId,
        platform,
        wallet_address: wallet_address.toLowerCase(),
        wallet_type,
        is_primary,
        metadata
      })
      .select()
      .single();

    if (error) throw error;

    // Log wallet addition
    await supabase.from('user_activity_log').insert({
      user_id: userId,
      platform,
      activity_type: 'wallet_added',
      details: {
        wallet_address: wallet_address.toLowerCase(),
        wallet_type,
        is_primary
      }
    }).catch(console.warn);

    res.json({
      success: true,
      wallet: data
    });
  } catch (error) {
    console.error('Add wallet error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get active users summary
router.get('/profiles/summary/active', async (req, res) => {
  try {
    const { platform, limit = 100, offset = 0 } = req.query;

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    let query = supabase
      .from('active_users_summary')
      .select('*')
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (platform) {
      query = query.eq(`${platform}_active`, true);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      users: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: data.length
      }
    });
  } catch (error) {
    console.error('Get active users error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Merge duplicate profiles
router.post('/profiles/merge', async (req, res) => {
  try {
    const { primary_user_id, duplicate_user_ids } = req.body;

    if (!primary_user_id || !Array.isArray(duplicate_user_ids) || duplicate_user_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'primary_user_id and duplicate_user_ids array required'
      });
    }

    const supabase = getClient();
    if (!supabase) {
      return res.status(503).json({
        success: false,
        message: 'Database not available'
      });
    }

    const { data, error } = await supabase.rpc('merge_duplicate_profiles', {
      p_primary_user_id: primary_user_id,
      p_duplicate_user_ids: duplicate_user_ids
    });

    if (error) throw error;

    // Log merge event
    await supabase.from('user_activity_log').insert({
      user_id: primary_user_id,
      platform: 'mcp',
      activity_type: 'profiles_merged',
      details: {
        merged_profiles: duplicate_user_ids,
        ip_address: req.ip,
        user_agent: req.headers['user-agent']
      }
    }).catch(console.warn);

    res.json({
      success: true,
      message: `Successfully merged ${duplicate_user_ids.length} profiles into ${primary_user_id}`
    });
  } catch (error) {
    console.error('Merge profiles error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// WhatsApp profile integration
router.post('/profiles/whatsapp/sync', async (req, res) => {
  try {
    const { whatsapp_id, profile_data, user_id } = req.body;

    if (!whatsapp_id) {
      return res.status(400).json({
        success: false,
        message: 'whatsapp_id required'
      });
    }

    const userData = {
      whatsapp_id,
      whatsapp_profile: profile_data,
      user_id,
      display_name: profile_data?.name || `WhatsApp User ${whatsapp_id}`,
      platform: 'whatsapp'
    };

    const result = await profileSystem.authenticateUser(userData);

    res.json(result);
  } catch (error) {
    console.error('WhatsApp sync error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// N8N webhook integration
router.post('/profiles/n8n/webhook', async (req, res) => {
  try {
    const { event, profile, user_data } = req.body;

    if (event === 'user_signup' && user_data) {
      const result = await profileSystem.authenticateUser({
        ...user_data,
        platform: 'n8n'
      });
      
      return res.json(result);
    }

    if (event === 'profile_update' && profile) {
      const result = await profileSystem.updateProfile(profile.user_id, profile);
      return res.json(result);
    }

    res.json({
      success: true,
      message: 'Webhook received',
      event
    });
  } catch (error) {
    console.error('N8N webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Health check for profile system
router.get('/profiles/health', async (req, res) => {
  try {
    const supabase = getClient();
    const dbStatus = supabase ? 'connected' : 'disconnected';
    
    let profileCount = 0;
    if (supabase) {
      try {
        const { count } = await supabase
          .from('unified_profiles')
          .select('*', { count: 'exact', head: true });
        profileCount = count || 0;
      } catch (e) {
        // Ignore count errors
      }
    }

    res.json({
      success: true,
      status: {
        profile_system_initialized: profileSystem.isInitialized,
        database_status: dbStatus,
        total_profiles: profileCount,
        storage_adapters: Array.from(profileSystem.storageAdapters.keys()),
        sync_queue_size: profileSystem.syncQueue.length
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;