'use client'

import { toast } from 'react-hot-toast'

export function useEnhancedToast() {
  const success = (message: string) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10b981',
        color: 'white',
      },
    })
  }

  const error = (message: string) => {
    toast.error(message, {
      duration: 6000,
      position: 'top-right',
      style: {
        background: '#ef4444',
        color: 'white',
      },
    })
  }

  const info = (message: string) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3b82f6',
        color: 'white',
      },
    })
  }

  const warning = (message: string) => {
    toast(message, {
      duration: 5000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#f59e0b',
        color: 'white',
      },
    })
  }

  return {
    success,
    error,
    info,
    warning
  }
}