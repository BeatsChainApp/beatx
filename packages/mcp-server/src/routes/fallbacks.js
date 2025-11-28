// Fallback routes for graceful degradation
module.exports = function(app) {
  // Catch-all for missing API endpoints
  app.use('/api/*', (req, res, next) => {
    if (!res.headersSent) {
      res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.originalUrl,
        method: req.method,
        hint: 'Check /api for available endpoints'
      });
    }
  });
  
  // Health check fallback
  app.get('/ping', (req, res) => {
    res.json({ pong: true, timestamp: Date.now() });
  });
  
  // Status endpoint
  app.get('/status', (req, res) => {
    res.json({
      status: 'operational',
      service: 'beatschain-mcp-server',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    });
  });
};