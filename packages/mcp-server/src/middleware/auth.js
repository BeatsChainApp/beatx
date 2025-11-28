const realTimeSync = require('../services/realTimeSync');

const verifySession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization header required' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const validation = await realTimeSync.validateSession(token);
    
    if (!validation.valid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session' 
      });
    }

    req.userAddress = validation.userAddress;
    req.sessionToken = token;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validation = await realTimeSync.validateSession(token);
      
      if (validation.valid) {
        req.userAddress = validation.userAddress;
        req.sessionToken = token;
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth for optional auth
    next();
  }
};

module.exports = {
  verifySession,
  optionalAuth,
  authenticateUser: verifySession // Alias for compatibility
};