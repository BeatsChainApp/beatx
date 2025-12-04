'use client'

import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useActiveAccount } from "thirdweb/react"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useUnifiedAuth } from './UnifiedAuthContext'

// Add relative time plugin
dayjs.extend(relativeTime)

// Notification types
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'purchase' | 'royalty' | 'credit' | 'mint'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  timestamp: number
  read: boolean
  from?: string
  to?: string
  transactionHash?: string
  beatId?: string
  beatTitle?: string
  amount?: number
  currency?: string
  metadata?: Record<string, any>
}

interface NotificationContext {
  notifications: Notification[]
  unreadCount: number
  addNotification: (message: string, options?: Partial<Omit<Notification, 'id' | 'message' | 'timestamp' | 'read'>>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
  getNotificationsByType: (type: NotificationType) => Notification[]
}

const defaultNotificationContext: NotificationContext = {
  notifications: [],
  unreadCount: 0,
  addNotification: () => {},
  markAsRead: () => {},
  markAllAsRead: () => {},
  clearNotifications: () => {},
  getNotificationsByType: () => []
}

const NotificationContext = createContext(defaultNotificationContext)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export function NotificationProvider(props: PropsWithChildren) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const account = useActiveAccount(); const address = account?.address
  const { user } = useUnifiedAuth()

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length

  // Load notifications from localStorage on mount and when user changes
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return

    try {
      const userId = user.address || user.uid || 'guest'
      const storedNotifications = localStorage.getItem(`notifications_${userId}`)
      
      if (storedNotifications) {
        const parsedNotifications = JSON.parse(storedNotifications)
        setNotifications(parsedNotifications)
      }
    } catch (error) {
      console.warn('Failed to load notifications:', error)
    }
  }, [user])

  // Disabled blockchain event simulation to prevent persistent notifications
  // useEffect(() => {
  //   if (!address) return
  //   // Blockchain event listening disabled
  // }, [address])

  // Add a new notification
  const addNotification = (
    message: string, 
    options?: Partial<Omit<Notification, 'id' | 'message' | 'timestamp' | 'read'>>
  ) => {
    if (!user) return
    
    try {
      const newNotification: Notification = {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        message,
        type: options?.type || 'info',
        timestamp: Date.now(),
        read: false,
        from: options?.from,
        to: options?.to || address,
        ...options
      }
      
      const updatedNotifications = [newNotification, ...notifications]
      
      // Update state
      setNotifications(updatedNotifications)
      
      // Save to localStorage
      const userId = user.address || user.uid || 'guest'
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications))
      
      // Toast disabled to prevent persistent notifications
      // toast(message, { 
      //   type: mapNotificationTypeToToast(newNotification.type)
      // })
    } catch (error) {
      console.warn('Failed to add notification:', error)
    }
  }

  // Mark a notification as read
  const markAsRead = (id: string) => {
    if (!user) return
    
    try {
      const updatedNotifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
      
      // Update state
      setNotifications(updatedNotifications)
      
      // Save to localStorage
      const userId = user.address || user.uid || 'guest'
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications))
    } catch (error) {
      console.warn('Failed to mark notification as read:', error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    if (!user) return
    
    try {
      const updatedNotifications = notifications.map(notification => ({ ...notification, read: true }))
      
      // Update state
      setNotifications(updatedNotifications)
      
      // Save to localStorage
      const userId = user.address || user.uid || 'guest'
      localStorage.setItem(`notifications_${userId}`, JSON.stringify(updatedNotifications))
    } catch (error) {
      console.warn('Failed to mark all notifications as read:', error)
    }
  }

  // Clear all notifications
  const clearNotifications = () => {
    if (!user) return
    
    try {
      // Update state
      setNotifications([])
      
      // Save to localStorage
      const userId = user.address || user.uid || 'guest'
      localStorage.removeItem(`notifications_${userId}`)
    } catch (error) {
      console.warn('Failed to clear notifications:', error)
    }
  }

  // Get notifications by type
  const getNotificationsByType = (type: NotificationType) => {
    return notifications.filter(notification => notification.type === type)
  }

  // Map notification type to toast type
  const mapNotificationTypeToToast = (type: NotificationType) => {
    switch (type) {
      case 'success':
      case 'purchase':
      case 'mint':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'royalty':
      case 'credit':
        return 'info'
      default:
        return 'info'
    }
  }

  return (
    <NotificationContext.Provider 
      value={{ 
        notifications, 
        unreadCount,
        addNotification, 
        markAsRead, 
        markAllAsRead,
        clearNotifications,
        getNotificationsByType
      }}
    >
      {props.children}
    </NotificationContext.Provider>
  )
}