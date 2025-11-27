/**
 * Notification System - Real-time notifications and alerts
 * Handles Web3 events, user notifications, and system alerts
 */

const { createClient } = require('@supabase/supabase-js');
const EventEmitter = require('events');

class NotificationSystem extends EventEmitter {
  constructor() {
    super();
    this.supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.subscribers = new Map();
    this.notificationQueue = [];
    this.processing = false;
  }

  // Subscribe to real-time notifications
  subscribe(userId, callback) {
    if (!this.subscribers.has(userId)) {
      this.subscribers.set(userId, new Set());
    }
    this.subscribers.get(userId).add(callback);
    
    // Set up Supabase real-time subscription
    this.setupRealtimeSubscription(userId);
    
    return () => this.unsubscribe(userId, callback);
  }

  unsubscribe(userId, callback) {
    const userCallbacks = this.subscribers.get(userId);
    if (userCallbacks) {
      userCallbacks.delete(callback);
      if (userCallbacks.size === 0) {
        this.subscribers.delete(userId);
      }
    }
  }

  // Send notification to user
  async sendNotification(userId, notification) {
    try {
      const enrichedNotification = {
        ...notification,
        id: this.generateId(),
        user_id: userId,
        created_at: new Date().toISOString(),
        read: false,
        delivered: false
      };

      // Store in database
      const { data, error } = await this.supabase
        .from('notifications')
        .insert([enrichedNotification])
        .select()
        .single();

      if (error) throw error;

      // Send to real-time subscribers
      this.notifySubscribers(userId, data);

      // Add to processing queue for external delivery
      this.queueNotification(data);

      return data;
    } catch (error) {
      console.error('Notification System - Send error:', error);
      throw error;
    }
  }

  // Web3 event notifications
  async handleWeb3Event(eventType, eventData) {
    try {
      switch (eventType) {
        case 'BeatMinted':
          await this.handleBeatMinted(eventData);
          break;
        case 'BeatPurchased':
          await this.handleBeatPurchased(eventData);
          break;
        case 'RoyaltyPaid':
          await this.handleRoyaltyPaid(eventData);
          break;
        case 'OwnershipTransferred':
          await this.handleOwnershipTransferred(eventData);
          break;
        default:
          console.log('Unknown Web3 event:', eventType);
      }
    } catch (error) {
      console.error('Notification System - Web3 event error:', error);
    }
  }

  // Beat minted notification
  async handleBeatMinted(eventData) {
    const { producer, beatId, tokenId } = eventData;
    
    await this.sendNotification(producer, {
      type: 'beat_minted',
      title: '🎵 Beat Successfully Minted!',
      message: `Your beat has been minted as NFT #${tokenId}`,
      data: { beatId, tokenId },
      priority: 'high',
      category: 'web3'
    });

    // Notify followers
    await this.notifyFollowers(producer, {
      type: 'new_beat',
      title: '🎵 New Beat Available',
      message: 'A producer you follow just released a new beat!',
      data: { beatId, producer },
      priority: 'medium',
      category: 'social'
    });
  }

  // Beat purchased notification
  async handleBeatPurchased(eventData) {
    const { producer, buyer, beatId, amount } = eventData;
    
    // Notify producer
    await this.sendNotification(producer, {
      type: 'beat_sold',
      title: '💰 Beat Sold!',
      message: `Your beat was purchased for ${amount} ETH`,
      data: { beatId, buyer, amount },
      priority: 'high',
      category: 'sales'
    });

    // Notify buyer
    await this.sendNotification(buyer, {
      type: 'beat_purchased',
      title: '🎵 Beat Purchased Successfully!',
      message: 'You now own this beat as an NFT',
      data: { beatId, amount },
      priority: 'high',
      category: 'purchases'
    });
  }

  // Royalty payment notification
  async handleRoyaltyPaid(eventData) {
    const { producer, amount, beatId } = eventData;
    
    await this.sendNotification(producer, {
      type: 'royalty_received',
      title: '💎 Royalty Payment Received',
      message: `You received ${amount} ETH in royalties`,
      data: { beatId, amount },
      priority: 'medium',
      category: 'earnings'
    });
  }

  // System notifications
  async sendSystemNotification(type, data) {
    const notifications = {
      maintenance: {
        title: '🔧 Scheduled Maintenance',
        message: 'Platform will be under maintenance from 2-4 AM UTC',
        priority: 'high',
        category: 'system'
      },
      feature_update: {
        title: '✨ New Features Available',
        message: 'Check out the latest updates to BeatsChain!',
        priority: 'medium',
        category: 'updates'
      },
      security_alert: {
        title: '🔒 Security Alert',
        message: 'Please review your account security settings',
        priority: 'critical',
        category: 'security'
      }
    };

    const notification = notifications[type];
    if (!notification) return;

    // Send to all active users
    const { data: activeUsers } = await this.supabase
      .from('user_sessions')
      .select('user_id')
      .gte('last_activity', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const promises = activeUsers?.map(user => 
      this.sendNotification(user.user_id, {
        ...notification,
        data: data || {}
      })
    ) || [];

    await Promise.all(promises);
  }

  // Get user notifications
  async getUserNotifications(userId, options = {}) {
    try {
      const { limit = 20, offset = 0, unreadOnly = false } = options;
      
      let query = this.supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (unreadOnly) {
        query = query.eq('read', false);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Notification System - Get notifications error:', error);
      throw error;
    }
  }

  // Mark notifications as read
  async markAsRead(userId, notificationIds) {
    try {
      const { error } = await this.supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .in('id', notificationIds);

      if (error) throw error;

      // Notify subscribers of read status change
      this.notifySubscribers(userId, { type: 'notifications_read', ids: notificationIds });
    } catch (error) {
      console.error('Notification System - Mark as read error:', error);
      throw error;
    }
  }

  // Get notification stats
  async getNotificationStats(userId) {
    try {
      const { data: stats } = await this.supabase
        .rpc('get_notification_stats', { user_id: userId });

      return stats?.[0] || {
        total: 0,
        unread: 0,
        categories: {}
      };
    } catch (error) {
      console.error('Notification System - Get stats error:', error);
      return { total: 0, unread: 0, categories: {} };
    }
  }

  // Setup real-time subscription
  setupRealtimeSubscription(userId) {
    if (this.realtimeSubscription) return;

    this.realtimeSubscription = this.supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        this.notifySubscribers(userId, payload.new);
      })
      .subscribe();
  }

  // Notify subscribers
  notifySubscribers(userId, notification) {
    const userCallbacks = this.subscribers.get(userId);
    if (userCallbacks) {
      userCallbacks.forEach(callback => {
        try {
          callback(notification);
        } catch (error) {
          console.error('Notification callback error:', error);
        }
      });
    }
  }

  // Queue notification for external delivery
  queueNotification(notification) {
    this.notificationQueue.push(notification);
    if (!this.processing) {
      this.processQueue();
    }
  }

  // Process notification queue
  async processQueue() {
    if (this.processing || this.notificationQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.notificationQueue.length > 0) {
      const notification = this.notificationQueue.shift();
      
      try {
        // Send push notification, email, etc.
        await this.deliverNotification(notification);
        
        // Mark as delivered
        await this.supabase
          .from('notifications')
          .update({ delivered: true, delivered_at: new Date().toISOString() })
          .eq('id', notification.id);
          
      } catch (error) {
        console.error('Notification delivery error:', error);
        // Re-queue for retry
        this.notificationQueue.push(notification);
      }
    }
    
    this.processing = false;
  }

  // Deliver notification via external services
  async deliverNotification(notification) {
    // Implement push notifications, email, SMS, etc.
    // For now, just log
    console.log('Delivering notification:', notification.title);
  }

  // Notify followers
  async notifyFollowers(producerId, notification) {
    try {
      const { data: followers } = await this.supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', producerId);

      const promises = followers?.map(follow => 
        this.sendNotification(follow.follower_id, notification)
      ) || [];

      await Promise.all(promises);
    } catch (error) {
      console.error('Notify followers error:', error);
    }
  }

  // Generate unique ID
  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Cleanup old notifications
  async cleanup() {
    try {
      const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
      
      await this.supabase
        .from('notifications')
        .delete()
        .lt('created_at', cutoff.toISOString())
        .eq('read', true);
        
      console.log('Notification cleanup completed');
    } catch (error) {
      console.error('Notification cleanup error:', error);
    }
  }
}

module.exports = NotificationSystem;