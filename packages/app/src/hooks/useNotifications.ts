import { useState, useEffect, useRef } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  read: boolean;
  created_at: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  categories: Record<string, number>;
}

export function useNotifications() {
  const { user } = useUnifiedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats>({ total: 0, unread: 0, categories: {} });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      loadStats();
      setupRealtimeConnection();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [user?.uid]);

  const loadNotifications = async (options?: { limit?: number; offset?: number; unreadOnly?: boolean }) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options?.limit) params.append('limit', options.limit.toString());
      if (options?.offset) params.append('offset', options.offset.toString());
      if (options?.unreadOnly) params.append('unreadOnly', 'true');

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load notifications');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Load notifications error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/notifications/stats', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Load stats error:', err);
    }
  };

  const setupRealtimeConnection = async () => {
    try {
      const token = await user?.getIdToken();
      eventSourceRef.current = new EventSource(`/api/notifications/stream?token=${token}`);
      
      eventSourceRef.current.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        
        if (notification.type === 'heartbeat') return;
        
        // Add new notification to the list
        setNotifications(prev => [notification, ...prev]);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          total: prev.total + 1,
          unread: prev.unread + 1
        }));
        
        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico'
          });
        }
      };

      eventSourceRef.current.onerror = () => {
        console.error('Notification stream error');
        // Reconnect after 5 seconds
        setTimeout(setupRealtimeConnection, 5000);
      };
    } catch (err) {
      console.error('Setup realtime connection error:', err);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const response = await fetch('/api/notifications/read', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({ notificationIds })
      });

      if (response.ok) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notificationIds.includes(notif.id) 
              ? { ...notif, read: true }
              : notif
          )
        );
        
        // Update stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - notificationIds.length)
        }));
      }
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  const markAllAsRead = () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return Notification.permission === 'granted';
  };

  const getFilteredNotifications = (filter: string) => {
    if (filter === 'all') return notifications;
    if (filter === 'unread') return notifications.filter(n => !n.read);
    return notifications.filter(n => n.category === filter);
  };

  return {
    notifications,
    stats,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    requestPermission,
    getFilteredNotifications
  };
}