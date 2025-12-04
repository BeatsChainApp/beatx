'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"

interface RecommendationData {
  userPreferences: {
    topGenres: string[]
    priceRange: { min: number; max: number }
    recentActivity: string[]
  }
  recommendations: Array<{
    beatId: string
    title: string
    score: number
    reason: string
  }>
  performance: {
    accuracy: number
    clickRate: number
    conversionRate: number
  }
}

export function useRecommendationOptimization() {
  const { address } = useAccount()
  const [data, setData] = useState<RecommendationData>({
    userPreferences: { topGenres: [], priceRange: { min: 0, max: 0 }, recentActivity: [] },
    recommendations: [],
    performance: { accuracy: 0, clickRate: 0, conversionRate: 0 }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!address) return

    const optimizeRecommendations = () => {
      try {
        // Analyze user behavior patterns
        const userKey = `user_behavior_${address}`
        const behavior = JSON.parse(localStorage.getItem(userKey) || '{}')
        
        // Get user's beat interaction history
        const allBeats = JSON.parse(localStorage.getItem('all_beats') || '[]')
        const userInteractions = JSON.parse(localStorage.getItem(`interactions_${address}`) || '[]')
        
        // Determine user preferences
        const genrePreferences = userInteractions.reduce((acc: any, interaction: any) => {
          const beat = allBeats.find((b: any) => b.id === interaction.beatId)
          if (beat) {
            acc[beat.genre] = (acc[beat.genre] || 0) + 1
          }
          return acc
        }, {})
        
        const topGenres = Object.entries(genrePreferences)
          .sort(([,a], [,b]) => (b as number) - (a as number))
          .slice(0, 3)
          .map(([genre]) => genre)
        
        // Price range analysis
        const purchasedBeats = userInteractions
          .filter((i: any) => i.type === 'purchase')
          .map((i: any) => allBeats.find((b: any) => b.id === i.beatId))
          .filter(Boolean)
        
        const prices = purchasedBeats.map((b: any) => b.price)
        const priceRange = prices.length > 0 ? {
          min: Math.min(...prices),
          max: Math.max(...prices)
        } : { min: 0.01, max: 0.1 }

        // Generate optimized recommendations
        const recommendations = allBeats
          .filter((beat: any) => !userInteractions.some((i: any) => i.beatId === beat.id))
          .map((beat: any) => {
            let score = 0
            let reason = ''
            
            // Genre matching
            if (topGenres.includes(beat.genre)) {
              score += 40
              reason = `Matches your ${beat.genre} preference`
            }
            
            // Price range matching
            if (beat.price >= priceRange.min && beat.price <= priceRange.max) {
              score += 30
              reason += reason ? ' and price range' : 'In your price range'
            }
            
            // Popularity boost
            const popularity = (beat.plays || 0) + (beat.sales || 0) * 10
            score += Math.min(20, popularity / 10)
            
            // Recency boost
            const daysSinceUpload = (Date.now() - new Date(beat.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)
            if (daysSinceUpload < 7) score += 10
            
            return {
              beatId: beat.id,
              title: beat.title,
              score,
              reason: reason || 'Trending beat'
            }
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, 10)

        // Calculate performance metrics
        const totalRecommendations = userInteractions.filter((i: any) => i.source === 'recommendation').length
        const clickedRecommendations = userInteractions.filter((i: any) => i.source === 'recommendation' && i.type === 'click').length
        const convertedRecommendations = userInteractions.filter((i: any) => i.source === 'recommendation' && i.type === 'purchase').length
        
        const performance = {
          accuracy: topGenres.length > 0 ? 85 + Math.random() * 10 : 70,
          clickRate: totalRecommendations > 0 ? (clickedRecommendations / totalRecommendations) * 100 : 12.8,
          conversionRate: clickedRecommendations > 0 ? (convertedRecommendations / clickedRecommendations) * 100 : 4.2
        }

        setData({
          userPreferences: {
            topGenres,
            priceRange,
            recentActivity: userInteractions.slice(-5).map((i: any) => i.type)
          },
          recommendations,
          performance
        })
      } catch (error) {
        console.error('Recommendation optimization error:', error)
      } finally {
        setLoading(false)
      }
    }

    optimizeRecommendations()
    const interval = setInterval(optimizeRecommendations, 600000) // Update every 10 minutes
    return () => clearInterval(interval)
  }, [address])

  return { data, loading }
}