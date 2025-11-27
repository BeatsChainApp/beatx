/**
 * Content Management API Routes
 * Phase 3: Content Management + Streaming
 */

const express = require('express');
const router = express.Router();
const ContentModerator = require('../services/contentModerator');
const StreamingManager = require('../services/streamingManager');
const { authenticateUser } = require('../middleware/auth');

const moderator = new ContentModerator();
const streaming = new StreamingManager();

// Initialize upload
router.post('/upload/init', authenticateUser, async (req, res) => {
  try {
    const { fileInfo } = req.body;
    const userId = req.user.uid;

    if (!fileInfo || !fileInfo.name || !fileInfo.size) {
      return res.status(400).json({ error: 'File info required' });
    }

    const uploadSession = await streaming.initializeUpload(userId, fileInfo);
    res.json(uploadSession);
  } catch (error) {
    console.error('Initialize upload error:', error);
    res.status(500).json({ error: 'Failed to initialize upload' });
  }
});

// Update upload progress
router.patch('/upload/:uploadId/progress', authenticateUser, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const { progress, bytesUploaded } = req.body;

    const result = await streaming.updateUploadProgress(uploadId, progress, bytesUploaded);
    res.json(result);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Complete upload
router.post('/upload/:uploadId/complete', authenticateUser, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const result = await streaming.completeUpload(uploadId);
    res.json(result);
  } catch (error) {
    console.error('Complete upload error:', error);
    res.status(500).json({ error: 'Failed to complete upload' });
  }
});

// Get upload status
router.get('/upload/:uploadId', authenticateUser, async (req, res) => {
  try {
    const { uploadId } = req.params;
    const status = await streaming.getUploadStatus(uploadId);
    res.json(status);
  } catch (error) {
    console.error('Get upload status error:', error);
    res.status(500).json({ error: 'Failed to get upload status' });
  }
});

// Get user uploads
router.get('/uploads', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 20 } = req.query;
    
    const uploads = await streaming.getUserUploads(userId, parseInt(limit));
    res.json(uploads);
  } catch (error) {
    console.error('Get user uploads error:', error);
    res.status(500).json({ error: 'Failed to get uploads' });
  }
});

// Moderate content
router.post('/moderate', authenticateUser, async (req, res) => {
  try {
    const { contentId, contentType, contentData } = req.body;

    if (!contentId || !contentType || !contentData) {
      return res.status(400).json({ error: 'Content ID, type, and data required' });
    }

    const result = await moderator.moderateContent(contentId, contentType, contentData);
    res.json(result);
  } catch (error) {
    console.error('Moderate content error:', error);
    res.status(500).json({ error: 'Failed to moderate content' });
  }
});

// Get pending reviews (admin only)
router.get('/reviews/pending', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { limit = 20 } = req.query;
    const reviews = await moderator.getPendingReviews(parseInt(limit));
    res.json(reviews);
  } catch (error) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ error: 'Failed to get pending reviews' });
  }
});

// Manual review (admin only)
router.post('/review/:contentId', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { contentId } = req.params;
    const { action, reason } = req.body;
    const moderatorId = req.user.uid;

    if (!action || !['approved', 'rejected'].includes(action)) {
      return res.status(400).json({ error: 'Valid action required (approved/rejected)' });
    }

    const result = await moderator.reviewContent(contentId, action, reason, moderatorId);
    res.json(result);
  } catch (error) {
    console.error('Manual review error:', error);
    res.status(500).json({ error: 'Failed to review content' });
  }
});

// Bulk review (admin only)
router.post('/review/bulk', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { contentIds, action, reason } = req.body;
    const moderatorId = req.user.uid;

    if (!Array.isArray(contentIds) || !action) {
      return res.status(400).json({ error: 'Content IDs array and action required' });
    }

    const results = await moderator.bulkModerate(contentIds, action, reason, moderatorId);
    res.json(results);
  } catch (error) {
    console.error('Bulk review error:', error);
    res.status(500).json({ error: 'Failed to bulk review content' });
  }
});

// Moderation statistics (admin only)
router.get('/moderation/stats', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { timeRange = '7d' } = req.query;
    const stats = await moderator.getModerationStats(timeRange);
    res.json(stats);
  } catch (error) {
    console.error('Get moderation stats error:', error);
    res.status(500).json({ error: 'Failed to get moderation stats' });
  }
});

// Generate streaming token
router.post('/stream/token', authenticateUser, async (req, res) => {
  try {
    const { assetId } = req.body;
    const userId = req.user.uid;

    if (!assetId) {
      return res.status(400).json({ error: 'Asset ID required' });
    }

    const token = await streaming.generateStreamingToken(assetId, userId);
    res.json(token);
  } catch (error) {
    console.error('Generate streaming token error:', error);
    res.status(500).json({ error: 'Failed to generate streaming token' });
  }
});

module.exports = router;