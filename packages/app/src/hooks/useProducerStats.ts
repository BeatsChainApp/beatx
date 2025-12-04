'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useWeb3Events } from './useWeb3Events'
import { useRoyalties } from './useRoyalties'

export interface ProducerStats {
  totalBeats: number
  totalSales: number
  totalEarnings: string
  averagePrice: string
  topBeat?: string
  recentActivity: Array<{
    type: 'mint' | 'sale' | 'royalty'
    beatId: string
    amount?: string
    timestamp: Date
  }>
}

export function useProducerStats() {
  const [stats, setStats] = useState<ProducerStats>({
    totalBeats: 0,
    totalSales: 0,
    totalEarnings: '0',
    averagePrice: '0',
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  
  const account = useActiveAccount()
  const address = account?.address
  const { events } = useWeb3Events()
  const { royalties, stats: royaltyStats } = useRoyalties()

  useEffect(() => {
    if (!address) {
      setLoading(false)
      return
    }

    // Filter events for current producer
    const producerEvents = events.filter(event => 
      event.data.producer?.toLowerCase() === address.toLowerCase() ||
      event.data.seller?.toLowerCase() === address.toLowerCase()
    )

    // Calculate stats from blockchain events
    const mintEvents = producerEvents.filter(e => e.type === 'mint')
    const saleEvents = producerEvents.filter(e => e.type === 'purchase')
    
    const totalBeats = mintEvents.length
    const totalSales = saleEvents.length
    
    const salesRevenue = saleEvents.reduce((sum, event) => 
      sum + parseFloat(event.data.price || '0'), 0
    )
    
    const royaltyEarnings = parseFloat(royaltyStats.totalEarned)
    const totalEarnings = (salesRevenue + royaltyEarnings).toString()
    
    const averagePrice = totalSales > 0 
      ? (salesRevenue / totalSales).toString()
      : '0'

    // Recent activity from all events
    const recentActivity = producerEvents
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10)
      .map(event => ({
        type: event.type,
        beatId: event.tokenId,
        amount: event.data.price || event.data.amount,
        timestamp: event.timestamp
      }))

    // Find top performing beat
    const beatSales = saleEvents.reduce((acc, event) => {
      acc[event.tokenId] = (acc[event.tokenId] || 0) + parseFloat(event.data.price || '0')
      return acc
    }, {} as Record<string, number>)

    const topBeat = Object.entries(beatSales)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    setStats({
      totalBeats,
      totalSales,
      totalEarnings,
      averagePrice,
      topBeat: topBeat ? `Beat #${topBeat}` : undefined,
      recentActivity
    })

    setLoading(false)
  }, [address, events, royaltyStats])

  return { stats, loading }
}