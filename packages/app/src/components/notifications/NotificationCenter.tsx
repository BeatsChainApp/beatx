'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

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

export function NotificationCenter() {
  const { user } = useUnifiedAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
    }
  }, [user?.uid]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock data for now
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'beat_sold',
          title: '💰 Beat Sold!',
          message: 'Your beat "Amapiano Vibes" was purchased for 0.05 ETH',
          priority: 'high',
          category: 'sales',
          read: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          type: 'new_follower',
          title: '👥 New Follower',
          message: 'DJ Mike started following you',
          priority: 'medium',
          category: 'social',
          read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.read).length);
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <>
      <div className="notification-bell">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="bell-button"
        >
          🔔
          {unreadCount > 0 && (
            <span className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3>Notifications</h3>
            <button onClick={() => setIsOpen(false)} className="close-button">
              ✕
            </button>
          </div>

          <div className="notifications-list">
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="empty-state">No notifications</div>
            ) : (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                  </div>
                  {!notification.read && <div className="unread-indicator" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .notification-bell {
          position: relative;
        }

        .bell-button {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          position: relative;
          padding: 0.5rem;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .bell-button:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          background: #ef4444;
          color: white;
          border-radius: 10px;
          padding: 2px 6px;
          font-size: 0.7rem;
          font-weight: bold;
          min-width: 18px;
          text-align: center;
        }

        .notification-panel {
          position: absolute;
          top: 100%;
          right: 0;
          width: 350px;
          max-height: 500px;
          background: #1a1a1a;
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
          z-index: 1000;
          overflow: hidden;
        }

        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .panel-header h3 {
          color: #fff;
          margin: 0;
          font-size: 1.2rem;
        }

        .close-button {
          background: none;
          border: none;
          color: #888;
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.25rem;
        }

        .notifications-list {
          max-height: 400px;
          overflow-y: auto;
        }

        .notification-item {
          display: flex;
          padding: 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }

        .notification-item:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .notification-item.unread {
          background: rgba(99, 102, 241, 0.1);
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.25rem;
        }

        .notification-header h4 {
          color: #fff;
          margin: 0;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .notification-time {
          color: #888;
          font-size: 0.7rem;
          flex-shrink: 0;
          margin-left: 0.5rem;
        }

        .notification-message {
          color: #ccc;
          margin: 0;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .unread-indicator {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          background: #6366f1;
          border-radius: 50%;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #888;
        }

        @media (max-width: 480px) {
          .notification-panel {
            width: 300px;
            right: -25px;
          }
        }
      `}</style>
    </>
  );
}