/**
 * Notifications API Routes - Real-time notifications and alerts
 */

const express = require('express');
const router = express.Router();
const NotificationSystem = require('../services/notificationSystem');
const { authenticateUser } = require('../middleware/auth');

const notifications = new NotificationSystem();

// Get user notifications
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { limit = 20, offset = 0, unreadOnly = false } = req.query;
    
    const userNotifications = await notifications.getUserNotifications(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      unreadOnly: unreadOnly === 'true'
    });
    
    res.json(userNotifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
});

// Get notification statistics
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const stats = await notifications.getNotificationStats(userId);
    res.json(stats);
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({ error: 'Failed to load notification stats' });
  }
});

// Mark notifications as read
router.patch('/read', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { notificationIds } = req.body;
    
    if (!Array.isArray(notificationIds)) {
      return res.status(400).json({ error: 'notificationIds must be an array' });
    }
    
    await notifications.markAsRead(userId, notificationIds);
    res.json({ message: 'Notifications marked as read' });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// Send notification (admin only)
router.post('/send', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { userId, notification } = req.body;
    
    if (!userId || !notification) {
      return res.status(400).json({ error: 'userId and notification required' });
    }
    
    const result = await notifications.sendNotification(userId, notification);
    res.json(result);
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send system notification (admin only)
router.post('/system', authenticateUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const { type, data } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'Notification type required' });
    }
    
    await notifications.sendSystemNotification(type, data);
    res.json({ message: 'System notification sent' });
  } catch (error) {
    console.error('Send system notification error:', error);
    res.status(500).json({ error: 'Failed to send system notification' });
  }
});

// Real-time notification stream
router.get('/stream', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    // Subscribe to notifications
    const unsubscribe = notifications.subscribe(userId, (notification) => {
      res.write(`data: ${JSON.stringify(notification)}\n\n`);
    });

    // Send heartbeat every 30 seconds
    const heartbeat = setInterval(() => {
      res.write(`data: ${JSON.stringify({ type: 'heartbeat', timestamp: Date.now() })}\n\n`);
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
      unsubscribe();
      clearInterval(heartbeat);
    });

  } catch (error) {
    console.error('Notification stream error:', error);
    res.status(500).json({ error: 'Failed to start notification stream' });
  }
});

// Web3 event webhook
router.post('/web3-event', async (req, res) => {
  try {
    const { eventType, eventData, signature } = req.body;
    
    // Verify webhook signature (implement signature verification)
    // if (!verifyWebhookSignature(req.body, signature)) {
    //   return res.status(401).json({ error: 'Invalid signature' });
    // }
    
    await notifications.handleWeb3Event(eventType, eventData);
    res.json({ message: 'Web3 event processed' });
  } catch (error) {
    console.error('Web3 event error:', error);
    res.status(500).json({ error: 'Failed to process Web3 event' });
  }
});

// Notification preferences
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Get user notification preferences from database
    const { data } = await notifications.supabase
      .from('user_preferences')
      .select('notification_settings')
      .eq('user_id', userId)
      .single();
    
    const preferences = data?.notification_settings || {
      web3_events: true,
      social_updates: true,
      system_alerts: true,
      email_notifications: false,
      push_notifications: true
    };
    
    res.json(preferences);
  } catch (error) {
    console.error('Get preferences error:', error);
    res.status(500).json({ error: 'Failed to load notification preferences' });
  }
});

// Update notification preferences
router.patch('/preferences', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { preferences } = req.body;
    
    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({ error: 'Valid preferences object required' });
    }
    
    const { error } = await notifications.supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        notification_settings: preferences,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    
    res.json({ message: 'Notification preferences updated' });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update notification preferences' });
  }
});

module.exports = router;