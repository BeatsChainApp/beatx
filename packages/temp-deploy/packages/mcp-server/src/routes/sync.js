const express = require('express');
const realTimeSync = require('../services/realTimeSync');
const { verifySession } = require('../middleware/auth');

const router = express.Router();

// POST /api/sync/user - Sync user data
router.post('/user', verifySession, async (req, res) => {
  try {
    const { walletAddress, userData } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address required' 
      });
    }

    const result = await realTimeSync.syncUserData(walletAddress, userData);
    res.json(result);
  } catch (error) {
    console.error('User sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/sync/beat - Sync beat data
router.post('/beat', verifySession, async (req, res) => {
  try {
    const { beatData } = req.body;
    
    if (!beatData || !beatData.id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Beat data with ID required' 
      });
    }

    const result = await realTimeSync.syncBeatData(beatData);
    res.json(result);
  } catch (error) {
    console.error('Beat sync error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/sync/play - Track beat play
router.post('/play', async (req, res) => {
  try {
    const { beatId, userAddress, playData } = req.body;
    
    if (!beatId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Beat ID required' 
      });
    }

    const result = await realTimeSync.trackBeatPlay(beatId, userAddress, playData);
    res.json(result);
  } catch (error) {
    console.error('Play tracking error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// POST /api/sync/session - Create cross-platform session
router.post('/session', async (req, res) => {
  try {
    const { walletAddress, deviceType } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet address required' 
      });
    }

    const result = await realTimeSync.createSession(walletAddress, { deviceType });
    res.json(result);
  } catch (error) {
    console.error('Session creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/sync/session/:token - Validate session
router.get('/session/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const result = await realTimeSync.validateSession(token);
    res.json(result);
  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// GET /api/sync/health - Health check for sync service
router.get('/health', async (req, res) => {
  try {
    const health = {
      sync: true,
      supabase: !!realTimeSync.supabase,
      timestamp: new Date()
    };
    res.json(health);
  } catch (error) {
    res.status(500).json({ 
      sync: false, 
      error: error.message 
    });
  }
});

module.exports = router;