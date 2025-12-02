const express = require('express');
const { verifySession, requirePermission } = require('../middleware/auth-stub');
const router = express.Router();

// User management routes
router.post('/users', verifySession, requirePermission('user_management'), async (req, res) => {
    const { email, role, context, wallet_address } = req.body;
    
    try {
        // Create user with context-aware role
        const user = {
            id: Date.now().toString(),
            email,
            role: role || (context === 'app' ? 'PRODUCER' : 'ARTIST'),
            context: context || 'app',
            wallet_address,
            created_at: new Date().toISOString()
        };
        
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Role assignment
router.put('/users/:id/role', verifySession, requirePermission('user_management'), async (req, res) => {
    const { role } = req.body;
    const { id } = req.params;
    
    try {
        res.json({ success: true, message: `Role updated to ${role}` });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Permission check
router.get('/permissions/check', verifySession, async (req, res) => {
    const { permission } = req.query;
    
    try {
        const hasPermission = req.rbac.hasPermission(req.userRole, permission);
        res.json({ success: true, hasPermission, role: req.userRole });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;