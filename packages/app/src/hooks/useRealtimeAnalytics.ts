'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useWeb3Events } from './useWeb3Events'
import { useBlockchainCache } from './useBlockchainCache'

interface RealtimeMetrics {
  totalRevenue: number
  totalSales: number
  averagePrice: number
  topBeat: string | null
  recentSales: Array<{
    beatId: string
    price: number
    timestamp: Date
    buyer: string
  }>
  hourlyStats: Array<{
    hour: string
    sales: number
    revenue: number
  }>
}

export function useRealtimeAnalytics() {
  const account = useActiveAccount()
  const address = account?.address
  const { events } = useWeb3Events()
  const cache = useBlockchainCache<RealtimeMetrics>({ defaultTTL: 60000, maxSize: 50 })
  const [metrics, setMetrics] = useState<RealtimeMetrics>({
    totalRevenue: 0,
    totalSales: 0,
    averagePrice: 0,
    topBeat: null,
    recentSales: [],
    hourlyStats: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return
    
    calculateRealtimeMetrics()
  }, [address, events])

  const calculateRealtimeMetrics = async () => {
    if (!address) return

    const cacheKey = `analytics-${address}`
    const cached = cache.get(cacheKey)
    
    if (cached) {
      setMetrics(cached)
      setLoading(false)
      return
    }

    setLoading(true)
    
    try {
      // Filter sales events for current user
      const salesEvents = events.filter(event => 
        event.type === 'purchase' && 
        event.data?.seller?.toLowerCase() === address.toLowerCase()
      )

      // Calculate basic metrics
      const totalSales = salesEvents.length
      const totalRevenue = salesEvents.reduce((sum, event) => 
        sum + parseFloat(event.data?.price || '0'), 0
      )
      const averagePrice = totalSales > 0 ? totalRevenue / totalSales : 0

      // Find top performing beat
      const beatRevenue = salesEvents.reduce((acc, event) => {
        const beatId = event.tokenId
        acc[beatId] = (acc[beatId] || 0) + parseFloat(event.data?.price || '0')
        return acc
      }, {} as Record<string, number>)

      const topBeat = Object.entries(beatRevenue)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null

      // Recent sales (last 10)
      const recentSales = salesEvents
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 10)
        .map(event => ({
          beatId: event.tokenId,
          price: parseFloat(event.data?.price || '0'),
          timestamp: event.timestamp,
          buyer: event.data?.buyer || 'Unknown'
        }))

      // Hourly stats for last 24 hours
      const now = new Date()
      const hourlyStats = Array.from({ length: 24 }, (_, i) => {
        const hour = new Date(now.getTime() - (i * 60 * 60 * 1000))
        const hourStart = new Date(hour.getFullYear(), hour.getMonth(), hour.getDate(), hour.getHours())
        const hourEnd = new Date(hourStart.getTime() + 60 * 60 * 1000)
        
        const hourSales = salesEvents.filter(event => 
          event.timestamp >= hourStart && event.timestamp < hourEnd
        )
        
        return {
          hour: hourStart.toLocaleTimeString('en-US', { hour: '2-digit', hour12: false }),
          sales: hourSales.length,
          revenue: hourSales.reduce((sum, event) => sum + parseFloat(event.data?.price || '0'), 0)
        }
      }).reverse()

      const newMetrics: RealtimeMetrics = {
        totalRevenue,
        totalSales,
        averagePrice,
        topBeat,
        recentSales,
        hourlyStats
      }

      setMetrics(newMetrics)
      cache.set(cacheKey, newMetrics, 60000) // Cache for 1 minute
      
    } catch (error) {
      console.error('Failed to calculate realtime metrics:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshMetrics = () => {
    if (address) {
      cache.invalidate(`analytics-${address}`)
      calculateRealtimeMetrics()
    }
  }

  return {
    metrics,
    loading,
    refreshMetrics
  }
}