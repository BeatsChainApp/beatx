'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface AdminStats {
  overview: {
    totalUsers: number
    totalBeats: number
    totalPurchases: number
    totalRevenue: number
    activeProducers: number
  }
  users: {
    byRole: {
      user: number
      producer: number
      admin: number
    }
    recentSignups: number
  }
  beats: {
    byGenre: Record<string, number>
    recentUploads: number
  }
  revenue: {
    total: number
    averagePerSale: number
    monthlyGrowth: number
  }
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, user } = useUnifiedAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user || user?.role !== 'admin') {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const idToken = await user.getIdToken()
        
        const response = await fetch('/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setStats(data.stats)

      } catch (err: any) {
        console.error('Error fetching admin stats:', err)
        setError(err.message)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, user])

  const refreshStats = async () => {
    if (!user || user?.role !== 'admin') return

    try {
      const idToken = await user.getIdToken()
      
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Error refreshing stats:', err)
    }
  }

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}