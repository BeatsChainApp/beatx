const express = require('express');
const router = express.Router();

// Extension auth endpoint
router.post('/extension', async (req, res) => {
  try {
    const { address, user, platform } = req.body;
    
    // Mock auth response for extension
    res.json({
      success: true,
      message: 'Extension auth processed',
      data: { address, platform: 'extension' }
    });
  } catch (error) {
    console.error('Extension auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// WhatsApp auth endpoint
router.post('/whatsapp', async (req, res) => {
  try {
    const { address, user, platform } = req.body;
    
    // Mock auth response for WhatsApp
    res.json({
      success: true,
      message: 'WhatsApp auth processed',
      data: { address, platform: 'whatsapp' }
    });
  } catch (error) {
    console.error('WhatsApp auth error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;