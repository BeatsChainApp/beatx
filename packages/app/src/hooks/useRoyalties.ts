'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useWeb3Events } from './useWeb3Events'

export interface RoyaltyPayment {
  id: string
  tokenId: string
  amount: string
  token: string
  recipient: string
  txHash: string
  timestamp: Date
  beatTitle?: string
}

export interface RoyaltyStats {
  totalEarned: string
  totalPayments: number
  averagePayment: string
  topEarningBeat?: string
}

export function useRoyalties() {
  const [royalties, setRoyalties] = useState<RoyaltyPayment[]>([])
  const [stats, setStats] = useState<RoyaltyStats>({
    totalEarned: '0',
    totalPayments: 0,
    averagePayment: '0'
  })
  const [loading, setLoading] = useState(true)
  
  const { address } = useAccount()
  const { events } = useWeb3Events()

  useEffect(() => {
    if (!address) {
      setRoyalties([])
      setLoading(false)
      return
    }

    // Filter royalty events for current user
    const royaltyEvents = events.filter(event => 
      event.type === 'royalty' && 
      event.data.recipient?.toLowerCase() === address.toLowerCase()
    )

    const payments: RoyaltyPayment[] = royaltyEvents.map(event => ({
      id: event.id,
      tokenId: event.tokenId,
      amount: event.data.amount || '0',
      token: 'ETH', // Default to ETH for now
      recipient: event.data.recipient,
      txHash: event.txHash,
      timestamp: event.timestamp,
      beatTitle: `Beat #${event.tokenId}`
    }))

    setRoyalties(payments)

    // Calculate stats
    const totalEarned = payments.reduce((sum, payment) => 
      sum + parseFloat(payment.amount), 0
    ).toString()

    const averagePayment = payments.length > 0 
      ? (parseFloat(totalEarned) / payments.length).toString()
      : '0'

    // Find top earning beat
    const beatEarnings = payments.reduce((acc, payment) => {
      acc[payment.tokenId] = (acc[payment.tokenId] || 0) + parseFloat(payment.amount)
      return acc
    }, {} as Record<string, number>)

    const topEarningBeat = Object.entries(beatEarnings)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    setStats({
      totalEarned,
      totalPayments: payments.length,
      averagePayment,
      topEarningBeat: topEarningBeat ? `Beat #${topEarningBeat}` : undefined
    })

    setLoading(false)
  }, [address, events])

  const getRoyaltiesForBeat = (tokenId: string) => {
    return royalties.filter(royalty => royalty.tokenId === tokenId)
  }

  const getTotalEarnedForBeat = (tokenId: string) => {
    return getRoyaltiesForBeat(tokenId)
      .reduce((sum, royalty) => sum + parseFloat(royalty.amount), 0)
      .toString()
  }

  return {
    royalties,
    stats,
    loading,
    getRoyaltiesForBeat,
    getTotalEarnedForBeat
  }
}