const express = require('express');
const router = express.Router();

// Streamlined contract operations via MCP
router.post('/mint', async (req, res) => {
  try {
    const { beatId, metadata, userAddress } = req.body;
    
    // Trigger N8N workflow for contract minting
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const response = await fetch(`${n8nUrl}/webhook/contract-mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mint',
        beatId,
        metadata,
        userAddress,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      res.json({ success: true, transaction: result });
    } else {
      // Fallback to mock
      res.json({
        success: true,
        transaction: {
          hash: `0x${Date.now().toString(16)}`,
          status: 'pending',
          mock: true
        }
      });
    }
  } catch (error) {
    console.error('Contract mint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Purchase contract operation
router.post('/purchase', async (req, res) => {
  try {
    const { beatId, buyerAddress, amount } = req.body;
    
    // Trigger N8N workflow for purchase
    const n8nUrl = process.env.N8N_BASE_URL || 'http://localhost:5678';
    const response = await fetch(`${n8nUrl}/webhook/contract-purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'purchase',
        beatId,
        buyerAddress,
        amount,
        timestamp: new Date().toISOString()
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      res.json({ success: true, transaction: result });
    } else {
      res.json({
        success: true,
        transaction: {
          hash: `0x${Date.now().toString(16)}`,
          status: 'completed',
          mock: true
        }
      });
    }
  } catch (error) {
    console.error('Contract purchase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;