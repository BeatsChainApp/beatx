/**
 * Recommendations API Routes
 * Phase 4: Advanced Features + Optimization
 */

const express = require('express');
const router = express.Router();
const RecommendationEngine = require('../services/recommendationEngine');
const PerformanceOptimizer = require('../services/performanceOptimizer');
const { authenticateUser } = require('../middleware/auth');

const recommendations = new RecommendationEngine();
const optimizer = new PerformanceOptimizer();

// Get personalized recommendations
router.get('/personalized', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 10 } = req.query;

    const recs = await optimizer.getCached(
      `personalized_${userId}_${limit}`,
      () => recommendations.getPersonalizedRecommendations(userId, parseInt(limit)),
      600000 // 10 minutes
    );

    res.json(recs);
  } catch (error) {
    console.error('Personalized recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

// Get trending beats
router.get('/trending', async (req, res) => {
  try {
    const { timeRange = '24h', limit = 20 } = req.query;

    const trending = await optimizer.getCached(
      `trending_${timeRange}_${limit}`,
      () => recommendations.getTrendingBeats(timeRange, parseInt(limit)),
      300000 // 5 minutes
    );

    res.json(trending);
  } catch (error) {
    console.error('Trending recommendations error:', error);
    res.status(500).json({ error: 'Failed to get trending beats' });
  }
});

// Get similar beats
router.get('/similar/:beatId', async (req, res) => {
  try {
    const { beatId } = req.params;
    const { limit = 10 } = req.query;

    const similar = await optimizer.getCached(
      `similar_${beatId}_${limit}`,
      () => recommendations.getSimilarBeats(beatId, parseInt(limit)),
      1800000 // 30 minutes
    );

    res.json(similar);
  } catch (error) {
    console.error('Similar beats error:', error);
    res.status(500).json({ error: 'Failed to get similar beats' });
  }
});

// Get genre recommendations
router.get('/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 20 } = req.query;
    const userId = req.user?.uid;

    const genreRecs = await optimizer.getCached(
      `genre_${genre}_${userId || 'anonymous'}_${limit}`,
      () => recommendations.getGenreRecommendations(genre, userId, parseInt(limit)),
      600000 // 10 minutes
    );

    res.json(genreRecs);
  } catch (error) {
    console.error('Genre recommendations error:', error);
    res.status(500).json({ error: 'Failed to get genre recommendations' });
  }
});

// Get new releases
router.get('/new', async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const newReleases = await optimizer.getCached(
      `new_releases_${limit}`,
      () => recommendations.getNewReleases(parseInt(limit)),
      300000 // 5 minutes
    );

    res.json(newReleases);
  } catch (error) {
    console.error('New releases error:', error);
    res.status(500).json({ error: 'Failed to get new releases' });
  }
});

// Track recommendation interaction
router.post('/track', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { beatId, interactionType } = req.body;

    if (!beatId || !interactionType) {
      return res.status(400).json({ error: 'Beat ID and interaction type required' });
    }

    await recommendations.trackInteraction(userId, beatId, interactionType);
    res.json({ success: true });
  } catch (error) {
    console.error('Track interaction error:', error);
    res.status(500).json({ error: 'Failed to track interaction' });
  }
});

// Get user preferences
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const preferences = await optimizer.getCached(
      `preferences_${userId}`,
      () => recommendations.getUserPreferences(userId),
      1800000 // 30 minutes
    );

    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to get preferences' });
  }
});

// Advanced search with recommendations
router.get('/search', async (req, res) => {
  try {
    const searchParams = {
      search_query: req.query.q || '',
      genre_filter: req.query.genre || null,
      limit_count: parseInt(req.query.limit) || 20,
      offset_count: parseInt(req.query.offset) || 0
    };

    const results = await optimizer.searchBeatsOptimized(searchParams);
    
    // Compress response for better performance
    const compressed = optimizer.compressResponse(results, 'medium');
    
    res.json(compressed);
  } catch (error) {
    console.error('Search recommendations error:', error);
    res.status(500).json({ error: 'Failed to search beats' });
  }
});

module.exports = router;