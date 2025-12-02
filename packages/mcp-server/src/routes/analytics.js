/**
 * Analytics API Routes - Dashboard metrics and user analytics
 */

const express = require('express');
const router = express.Router();
const AnalyticsEngine = require('../services/analyticsEngine');
const { authenticateUser } = require('../middleware/auth');

const analytics = new AnalyticsEngine();

// Dashboard metrics endpoint
router.get('/dashboard', async (req, res) => {
  try {
    const { userId, timeRange = '24h' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const metrics = await analytics.getDashboardMetrics(userId, timeRange);
    res.json(metrics);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
});

// User analytics endpoint
router.get('/user', authenticateUser, async (req, res) => {
  try {
    const { userId, timeRange = '7d' } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const userAnalytics = await analytics.getUserAnalytics(userId, timeRange);
    res.json(userAnalytics);
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Failed to load user analytics' });
  }
});

// Beat analytics endpoint
router.get('/beat/:beatId', authenticateUser, async (req, res) => {
  try {
    const { beatId } = req.params;
    const { timeRange = '7d' } = req.query;
    
    const beatAnalytics = await analytics.getBeatAnalytics(beatId, timeRange);
    res.json(beatAnalytics);
  } catch (error) {
    console.error('Beat analytics error:', error);
    res.status(500).json({ error: 'Failed to load beat analytics' });
  }
});

// Platform analytics (admin only)
router.get('/platform', authenticateUser, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { timeRange = '30d' } = req.query;
    const platformAnalytics = await analytics.getPlatformAnalytics(timeRange);
    res.json(platformAnalytics);
  } catch (error) {
    console.error('Platform analytics error:', error);
    res.status(500).json({ error: 'Failed to load platform analytics' });
  }
});

// Real-time metrics endpoint
router.get('/realtime', authenticateUser, async (req, res) => {
  try {
    const { userId } = req.query;
    
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Send initial data
    const initialMetrics = await analytics.getDashboardMetrics(userId, '1h');
    res.write(`data: ${JSON.stringify(initialMetrics)}\n\n`);

    // Set up periodic updates
    const interval = setInterval(async () => {
      try {
        const metrics = await analytics.getDashboardMetrics(userId, '1h');
        res.write(`data: ${JSON.stringify(metrics)}\n\n`);
      } catch (error) {
        console.error('Real-time metrics error:', error);
      }
    }, 30000); // Update every 30 seconds

    // Clean up on client disconnect
    req.on('close', () => {
      clearInterval(interval);
    });

  } catch (error) {
    console.error('Real-time analytics error:', error);
    res.status(500).json({ error: 'Failed to start real-time analytics' });
  }
});

// Analytics cache management
router.delete('/cache', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { pattern } = req.query;
    analytics.clearCache(pattern);
    
    res.json({ message: 'Cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Failed to clear cache' });
  }
});

module.exports = router;