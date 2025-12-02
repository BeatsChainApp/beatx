const realTimeSync = require('../services/realTimeSync');
const { UnifiedRBAC } = require('../../../shared/auth/unified-rbac');

const verifySession = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        error: 'Authorization header required' 
      });
    }

    const token = authHeader.substring(7);
    const validation = await realTimeSync.validateSession(token);
    
    if (!validation.valid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid or expired session' 
      });
    }

    // Determine context and role
    const context = req.headers['x-client-context'] || 'app';
    const rbac = new UnifiedRBAC(context);
    const role = rbac.determineRole(validation.email, validation.userAddress);

    req.userAddress = validation.userAddress;
    req.userEmail = validation.email;
    req.userRole = role;
    req.sessionToken = token;
    req.rbac = rbac;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Authentication failed' 
    });
  }
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.rbac || !req.userRole) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }
    
    if (!req.rbac.hasPermission(req.userRole, permission)) {
      return res.status(403).json({ success: false, error: 'Insufficient permissions' });
    }
    
    next();
  };
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
  requirePermission,
  authenticateUser: verifySession
};