// SAMRO Split Sheet Routes
const express = require('express');
const router = express.Router();

// Import split sheet functions (will be converted from TS)
// const { createSplitSheet, fillSAMROPDF } = require('../modules/split-sheet');

router.post('/samro/generate', async (req, res) => {
  try {
    // TODO: Implement after TS conversion
    res.json({ 
      success: true, 
      message: 'SAMRO split sheet generation ready',
      data: req.body 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/samro/fill', async (req, res) => {
  try {
    const { userData, contributors } = req.body;
    
    // Generate SAMRO completion instructions
    const instructions = {
      trackInfo: {
        title: userData.trackTitle || 'Track Title',
        artist: userData.artistName || 'Artist Name',
        isrc: userData.isrc || 'ZA-80G-25-XXXXX'
      },
      contributors: contributors || [],
      steps: [
        '1. Print the SAMRO Composer Split Confirmation PDF',
        '2. Fill in track title: ' + (userData.trackTitle || '[Track Title]'),
        '3. Fill in artist name: ' + (userData.artistName || '[Artist Name]'),
        '4. Add ISRC code: ' + (userData.isrc || '[ISRC Code]'),
        '5. List all contributors with percentages',
        '6. Ensure percentages total 100%',
        '7. Sign and date the form',
        '8. Submit to SAMRO for processing'
      ]
    };
    
    res.json({ success: true, instructions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;