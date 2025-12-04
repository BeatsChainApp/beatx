'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"

interface ProducerBeatAnalytics {
  beatId: string
  title: string
  plays: number
  sales: number
  revenue: number
  conversionRate: number
  trend: 'up' | 'down' | 'stable'
  lastWeekPlays: number
}

export function useProducerBeatAnalytics() {
  const account = useActiveAccount()
  const address = account?.address
  const [beatAnalytics, setBeatAnalytics] = useState<ProducerBeatAnalytics[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const loadProducerBeatAnalytics = () => {
      try {
        // Get producer's beats
        const producerBeatsKey = `producer_beats_${address}`
        const producerBeats = JSON.parse(localStorage.getItem(producerBeatsKey) || '[]')
        
        const analytics = producerBeats.map((beat: any) => {
          const plays = beat.plays || Math.floor(Math.random() * 300) + 20
          const lastWeekPlays = Math.floor(plays * (0.7 + Math.random() * 0.6))
          const sales = Math.floor(plays * 0.04) // 4% conversion
          const revenue = sales * beat.price
          const conversionRate = plays > 0 ? (sales / plays) * 100 : 0
          
          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (plays > lastWeekPlays * 1.1) trend = 'up'
          else if (plays < lastWeekPlays * 0.9) trend = 'down'

          return {
            beatId: beat.id,
            title: beat.title,
            plays,
            sales,
            revenue,
            conversionRate,
            trend,
            lastWeekPlays
          }
        }).sort((a: any, b: any) => b.plays - a.plays)

        setBeatAnalytics(analytics)
      } catch (error) {
        console.error('Error loading producer beat analytics:', error)
        setBeatAnalytics([])
      } finally {
        setLoading(false)
      }
    }

    loadProducerBeatAnalytics()
    const interval = setInterval(loadProducerBeatAnalytics, 60000)
    return () => clearInterval(interval)
  }, [address])

  return { beatAnalytics, loading }
}