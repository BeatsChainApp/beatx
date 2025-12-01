const express = require('express');
const { verifySession, requirePermission } = require('../middleware/auth');
const router = express.Router();

// Create campaign
router.post('/', verifySession, requirePermission('admin_panel'), async (req, res) => {
    const { name, type, content, targetContext } = req.body;
    
    try {
        const campaign = {
            id: Date.now().toString(),
            name,
            type,
            content,
            targetContext: targetContext || 'both',
            status: 'active',
            createdBy: req.userEmail,
            createdAt: new Date().toISOString()
        };
        
        res.json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get campaigns by context
router.get('/', verifySession, async (req, res) => {
    const { context } = req.query;
    
    try {
        // Mock campaigns for now
        const campaigns = [
            {
                id: '1',
                name: 'Legal Services Promotion',
                type: 'sponsor',
                targetContext: context || 'extension',
                status: 'active'
            }
        ];
        
        res.json({ success: true, campaigns });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;