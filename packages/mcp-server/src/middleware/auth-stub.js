// Minimal auth stub to prevent server crashes
const verifySession = async (req, res, next) => {
  // Skip auth for development/testing
  req.userAddress = 'test-address';
  req.userEmail = 'test@example.com';
  req.userRole = 'USER';
  req.sessionToken = 'test-token';
  next();
};

const requirePermission = (permission) => {
  return (req, res, next) => {
    // Allow all permissions for testing
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  next();
};

module.exports = {
  verifySession,
  optionalAuth,
  requirePermission,
  authenticateUser: verifySession
};