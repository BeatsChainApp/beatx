'use client'

import { useState } from 'react'

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'

interface AnalyticsOverview {
  totalBeats: number
  totalUsers: number
  totalSales: number
  totalRevenue: string
}

interface BeatAnalytics {
  id: string
  title: string
  producer_name: string
  genre: string
  play_count: number
  total_sales: number
  total_revenue: string
  avg_rating?: number
}

export function useAnalytics() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getOverview = async (): Promise<AnalyticsOverview | null> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`${MCP_SERVER_URL}/api/analytics/overview`)
      const data = await response.json()

      if (data.success) {
        return data.overview
      }
      return null
    } catch (err: any) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  const getBeatAnalytics = async (producer?: string): Promise<BeatAnalytics[]> => {
    try {
      setLoading(true)
      const params = producer ? `?producer=${producer}` : ''
      const response = await fetch(`${MCP_SERVER_URL}/api/analytics/beats${params}`)
      const data = await response.json()

      if (data.success) {
        return data.analytics || []
      }
      return []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  const trackEvent = async (eventType: string, metadata: any = {}, beatId?: string, userAddress?: string) => {
    try {
      await fetch(`${MCP_SERVER_URL}/api/analytics/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          user_address: userAddress,
          beat_id: beatId,
          metadata
        })
      })
    } catch (err) {
      console.warn('Failed to track event:', err)
    }
  }

  const getProducerAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${MCP_SERVER_URL}/api/analytics/producers`)
      const data = await response.json()

      if (data.success) {
        return data.producers || []
      }
      return []
    } catch (err: any) {
      setError(err.message)
      return []
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    getOverview,
    getBeatAnalytics,
    getProducerAnalytics,
    trackEvent
  }
}