'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { db } from '@/lib/firebase'
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore'

interface Notification {
  id: string
  type: 'purchase' | 'sale' | 'earning' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  data?: any
}

export function useRealTimeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { user } = useUnifiedAuth()

  useEffect(() => {
    if (!user) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Listen to user's notifications
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(50)
    )

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const newNotifications: Notification[] = []
      let unread = 0

      snapshot.forEach((doc) => {
        const data = doc.data()
        const notification: Notification = {
          id: doc.id,
          type: data.type || 'system',
          title: data.title || 'Notification',
          message: data.message || '',
          read: data.read || false,
          createdAt: data.createdAt?.toDate() || new Date(),
          data: data.data
        }
        
        newNotifications.push(notification)
        if (!notification.read) unread++
      })

      setNotifications(newNotifications)
      setUnreadCount(unread)
    })

    return () => unsubscribe()
  }, [user])

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          notificationId,
          read: true
        })
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user?.getIdToken()}`
        },
        body: JSON.stringify({
          markAllRead: true
        })
      })
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  }
}