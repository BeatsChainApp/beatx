'use client'

import { useState, useEffect } from 'react'
import { useWeb3Events } from './useWeb3Events'
import { useActiveAccount } from "thirdweb/react"

interface PlatformStats {
  totalBeats: number
  totalUsers: number
  totalRevenue: number
  totalSales: number
  activeProducers: number
  isLoading: boolean
}

export function usePlatformStats(): PlatformStats {
  const { events } = useWeb3Events()
  const account = useActiveAccount(); const isConnected = !!account
  const [stats, setStats] = useState<PlatformStats>({
    totalBeats: 0,
    totalUsers: 0,
    totalRevenue: 0,
    totalSales: 0,
    activeProducers: 0,
    isLoading: true
  })

  useEffect(() => {
    // Real-time Web3 data calculation
    const calculateRealTimeStats = () => {
      if (typeof window === 'undefined') return
      
      // Get unique wallets from localStorage (BeatNFT users)
      const beatNFTUsers = Object.keys(localStorage)
        .filter(key => key.startsWith('beatnft_balance_'))
        .length
      
      // Web3 events data
      const mintEvents = events.filter(e => e.type === 'mint')
      const saleEvents = events.filter(e => e.type === 'purchase')
      
      const totalBeats = mintEvents.length
      const totalSales = saleEvents.length
      const totalRevenue = saleEvents.reduce((sum, event) => 
        sum + parseFloat(event.data?.price || '0'), 0
      )
      
      // Count unique addresses from events + localStorage users
      const uniqueAddresses = new Set([
        ...events.map(e => e.data?.producer).filter(Boolean),
        ...events.map(e => e.data?.buyer).filter(Boolean)
      ])
      
      const totalUsers = Math.max(beatNFTUsers, uniqueAddresses.size, isConnected ? 1 : 0)
      const activeProducers = mintEvents.length > 0 ? 
        new Set(mintEvents.map(e => e.data?.producer)).size : 
        (isConnected ? 1 : 0)
      
      setStats({
        totalBeats,
        totalUsers,
        totalRevenue,
        totalSales,
        activeProducers,
        isLoading: false
      })
    }

    calculateRealTimeStats()
    
    // Update every 30 seconds
    const interval = setInterval(calculateRealTimeStats, 30000)
    return () => clearInterval(interval)
  }, [events, isConnected])

  return stats
}