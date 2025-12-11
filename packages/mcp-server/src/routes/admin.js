const express = require('express');
const router = express.Router();

// Admin wallets and emails configuration
const SUPER_ADMIN_WALLETS = [
  process.env.SUPER_ADMIN_WALLET?.toLowerCase(),
  process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase(),
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10', // Your wallet address
].filter(Boolean);

// Debug admin configuration
console.log('🔧 MCP SUPER_ADMIN_WALLETS:', SUPER_ADMIN_WALLETS);
console.log('🔧 MCP ENV WALLETS:', {
  SUPER_ADMIN_WALLET: process.env.SUPER_ADMIN_WALLET,
  NEXT_PUBLIC_SUPER_ADMIN_WALLET: process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET
});

const ADMIN_EMAILS = [
  'info@unamifoundation.org',
  'admin@beatschain.app',
  'support@beatschain.app'
];

// Admin authentication middleware
function adminAuth(req, res, next) {
  const walletAddress = req.headers['x-wallet-address']?.toLowerCase();
  const userEmail = req.headers['x-user-email']?.toLowerCase();
  const authToken = req.headers['authorization'];
  
  // Check if wallet is super admin
  if (walletAddress && SUPER_ADMIN_WALLETS.includes(walletAddress)) {
    req.adminLevel = 'super_admin';
    req.adminWallet = walletAddress;
    return next();
  }
  
  // Check if email is admin
  if (userEmail && ADMIN_EMAILS.includes(userEmail)) {
    req.adminLevel = 'admin';
    req.adminEmail = userEmail;
    return next();
  }
  
  // Check API key for server-to-server admin access
  const adminApiKey = process.env.ADMIN_API_KEY;
  if (adminApiKey && authToken === `Bearer ${adminApiKey}`) {
    req.adminLevel = 'api_admin';
    return next();
  }
  
  return res.status(403).json({ 
    success: false, 
    message: 'Admin access required',
    hint: 'Connect with admin wallet or email'
  });
}

// Admin dashboard data
router.get('/dashboard', adminAuth, async (req, res) => {
  try {
    let supabaseClient = null;
    try {
      supabaseClient = require('../services/supabaseClient');
    } catch (e) {
      console.warn('Supabase not available for admin dashboard');
    }
    
    const dashboardData = {
      overview: {
        totalRevenue: 0,
        totalBeats: 0,
        totalUsers: 0,
        totalSales: 0
      },
      systemHealth: {
        mcp: 'healthy',
        supabase: supabaseClient ? 'healthy' : 'unavailable',
        ipfs: process.env.PINATA_JWT || process.env.WEB3STORAGE_TOKEN ? 'healthy' : 'unavailable',
        blockchain: 'healthy'
      },
      adminInfo: {
        level: req.adminLevel,
        wallet: req.adminWallet,
        email: req.adminEmail,
        timestamp: new Date().toISOString()
      }
    };
    
    // Get real data if Supabase is available
    if (supabaseClient) {
      try {
        const { getClient } = supabaseClient;
        const sb = getClient();
        if (sb) {
          // Get beats count
          const { count: beatsCount } = await sb
            .from('beats')
            .select('*', { count: 'exact', head: true });
          
          // Get users count (from profiles or auth)
          const { count: usersCount } = await sb
            .from('profiles')
            .select('*', { count: 'exact', head: true });
          
          dashboardData.overview.totalBeats = beatsCount || 0;
          dashboardData.overview.totalUsers = usersCount || 0;
        }
      } catch (dbError) {
        console.warn('Database query failed:', dbError);
      }
    }
    
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Dashboard data unavailable',
      error: error.message 
    });
  }
});

// Admin user management
router.get('/users', adminAuth, async (req, res) => {
  try {
    let supabaseClient = null;
    try {
      supabaseClient = require('../services/supabaseClient');
    } catch (e) {
      // Return mock data if no database
      return res.json({
        success: true,
        users: [
          { id: 1, email: 'admin@beatx.app', role: 'super_admin', status: 'active' },
          { id: 2, email: 'producer@beatx.app', role: 'producer', status: 'active' }
        ],
        message: 'Mock data - database not configured'
      });
    }
    
    const { getClient } = supabaseClient;
    const sb = getClient();
    if (!sb) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database unavailable' 
      });
    }
    
    const { data: users, error } = await sb
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json({ success: true, users: users || [] });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
});

// Admin beats management
router.get('/beats', adminAuth, async (req, res) => {
  try {
    let supabaseClient = null;
    try {
      supabaseClient = require('../services/supabaseClient');
    } catch (e) {
      return res.json({
        success: true,
        beats: [],
        message: 'Database not configured'
      });
    }
    
    const { getClient } = supabaseClient;
    const sb = getClient();
    if (!sb) {
      return res.status(503).json({ 
        success: false, 
        message: 'Database unavailable' 
      });
    }
    
    const { data: beats, error } = await sb
      .from('beats')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json({ success: true, beats: beats || [] });
  } catch (error) {
    console.error('Admin beats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch beats',
      error: error.message 
    });
  }
});

// Admin system settings
router.get('/settings', adminAuth, async (req, res) => {
  try {
    const settings = {
      maintenanceMode: process.env.MAINTENANCE_MODE === 'true',
      adminApiKey: !!process.env.ADMIN_API_KEY,
      supabaseConfigured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY),
      ipfsConfigured: !!(process.env.PINATA_JWT || process.env.WEB3STORAGE_TOKEN),
      thirdwebConfigured: !!process.env.THIRDWEB_SECRET_KEY,
      livepeerConfigured: !!process.env.LIVEPEER_API_KEY,
      environment: process.env.NODE_ENV || 'development',
      version: '2.0.0'
    };
    
    res.json({ success: true, settings });
  } catch (error) {
    console.error('Admin settings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch settings',
      error: error.message 
    });
  }
});

// Admin wallet verification
router.post('/verify-wallet', async (req, res) => {
  try {
    const { walletAddress, email } = req.body;
    
    if (!walletAddress && !email) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address or email required'
      });
    }
    
    const verification = {
      isAdmin: false,
      isSuperAdmin: false,
      adminLevel: 'user',
      walletAddress: walletAddress?.toLowerCase(),
      email: email?.toLowerCase()
    };
    
    // Check wallet address
    if (walletAddress && SUPER_ADMIN_WALLETS.includes(walletAddress.toLowerCase())) {
      console.log('✅ MCP: SUPER ADMIN WALLET VERIFIED:', walletAddress.toLowerCase());
      verification.isAdmin = true;
      verification.isSuperAdmin = true;
      verification.adminLevel = 'super_admin';
    } else if (walletAddress) {
      console.log('❌ MCP: WALLET NOT IN ADMIN LIST:', walletAddress.toLowerCase());
      console.log('🔍 MCP: CHECKING AGAINST:', SUPER_ADMIN_WALLETS);
    }
    
    // Check email
    if (email && ADMIN_EMAILS.includes(email.toLowerCase())) {
      verification.isAdmin = true;
      verification.isSuperAdmin = true;
      verification.adminLevel = 'super_admin';
    }
    
    res.json({ success: true, verification });
  } catch (error) {
    console.error('Wallet verification error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Verification failed',
      error: error.message 
    });
  }
});

// Admin setup endpoint
router.post('/setup', async (req, res) => {
  try {
    const { walletAddress, email, setupType } = req.body;
    
    if (!walletAddress && !email) {
      return res.status(400).json({
        success: false,
        message: 'Wallet address or email required for admin setup'
      });
    }
    
    // Verify admin credentials
    const isWalletAdmin = walletAddress && SUPER_ADMIN_WALLETS.includes(walletAddress.toLowerCase());
    const isEmailAdmin = email && ADMIN_EMAILS.includes(email.toLowerCase());
    
    if (!isWalletAdmin && !isEmailAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for admin setup'
      });
    }
    
    const setupResult = {
      success: true,
      adminLevel: 'super_admin',
      walletAddress: walletAddress?.toLowerCase(),
      email: email?.toLowerCase(),
      setupComplete: true,
      timestamp: new Date().toISOString()
    };
    
    res.json(setupResult);
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Setup failed',
      error: error.message 
    });
  }
});

module.exports = router;