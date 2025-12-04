const express = require('express');
const router = express.Router();

// Enhanced Radio Flow endpoints
router.post('/splitsheets', async (req, res) => {
  try {
    const { contributors, track_metadata, user_id } = req.body;
    
    if (!contributors || !Array.isArray(contributors)) {
      return res.status(400).json({ success: false, message: 'contributors array required' });
    }
    
    // Validate splitsheet data
    const totalPercentage = contributors.reduce((sum, c) => sum + (c.percentage || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      return res.status(400).json({ 
        success: false, 
        message: `Total percentage must equal 100% (current: ${totalPercentage}%)` 
      });
    }
    
    const splitsheetData = {
      contributors,
      track_metadata,
      user_id,
      total_percentage: totalPercentage,
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio'
    };
    
    res.json({ 
      success: true, 
      splitsheet_id: `splitsheet_${Date.now()}`,
      data: splitsheetData
    });
  } catch (error) {
    console.error('Splitsheet processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/samro', async (req, res) => {
  try {
    const { contributors, track_metadata, samro_member_number, user_id } = req.body;
    
    if (!contributors || !track_metadata) {
      return res.status(400).json({ 
        success: false, 
        message: 'contributors and track_metadata required' 
      });
    }
    
    const samroData = {
      contributors,
      track_metadata,
      samro_member_number: samro_member_number || null,
      user_id,
      document_generated: true,
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio'
    };
    
    res.json({ 
      success: true, 
      samro_id: `samro_${Date.now()}`,
      data: samroData,
      pdf_generated: true
    });
  } catch (error) {
    console.error('SAMRO processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/package', async (req, res) => {
  try {
    const { 
      track_metadata, 
      splitsheets, 
      samro_data, 
      isrc_data, 
      user_id,
      package_components 
    } = req.body;
    
    if (!track_metadata) {
      return res.status(400).json({ 
        success: false, 
        message: 'track_metadata required' 
      });
    }
    
    const packageData = {
      track_metadata,
      splitsheets: splitsheets || null,
      samro_data: samro_data || null,
      isrc_data: isrc_data || null,
      user_id,
      package_components: package_components || [],
      has_enhanced_components: !!(splitsheets || samro_data),
      created_at: new Date().toISOString(),
      flow_type: 'enhanced_radio',
      package_id: `radio_package_${Date.now()}`
    };
    
    res.json({ 
      success: true, 
      package_id: packageData.package_id,
      data: packageData,
      enhanced: packageData.has_enhanced_components
    });
  } catch (error) {
    console.error('Package processing error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;