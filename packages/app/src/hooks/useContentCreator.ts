'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { ContentCreator, BeatNFTLicense, NegotiationRecord } from '@/types'
import { toast } from 'react-toastify'

export interface CreatorRegistrationData {
  creatorType: ContentCreator['creatorType']
  platformConnections: ContentCreator['platformConnections']
  audienceSize: number
}

export function useContentCreator() {
  const [creator, setCreator] = useState<ContentCreator | null>(null)
  const [loading, setLoading] = useState(false)
  const [licenses, setLicenses] = useState<BeatNFTLicense[]>([])
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account

  useEffect(() => {
    if (isConnected && address) {
      loadCreatorProfile()
    }
  }, [address, isConnected])

  const loadCreatorProfile = async () => {
    if (!address || typeof window === 'undefined') return

    try {
      setLoading(true)
      
      // Load from localStorage (Phase 1 - will migrate to IPFS/blockchain)
      const stored = localStorage.getItem(`creator_profile_${address}`)
      if (stored) {
        const creatorData = JSON.parse(stored)
        setCreator(creatorData)
        await loadCreatorLicenses(address)
      }
    } catch (error) {
      console.error('Failed to load creator profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCreatorLicenses = async (walletAddress: string) => {
    try {
      const stored = localStorage.getItem(`creator_licenses_${walletAddress}`)
      if (stored) {
        const licensesData = JSON.parse(stored)
        setLicenses(licensesData)
      }
    } catch (error) {
      console.error('Failed to load creator licenses:', error)
    }
  }

  const registerCreator = async (data: CreatorRegistrationData): Promise<boolean> => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return false
    }

    try {
      setLoading(true)

      // Calculate verification tier based on audience size
      const tier = calculateVerificationTier(data.audienceSize, data.platformConnections)

      const newCreator: ContentCreator = {
        walletAddress: address,
        creatorType: data.creatorType,
        platformConnections: data.platformConnections,
        verificationTier: tier,
        audienceSize: data.audienceSize,
        isVerified: tier !== 'bronze',
        negotiationHistory: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Store in localStorage (Phase 1 - will migrate to IPFS)
      localStorage.setItem(`creator_profile_${address}`, JSON.stringify(newCreator))
      setCreator(newCreator)

      toast.success(`🎨 Creator profile registered! Tier: ${tier.toUpperCase()}`)
      return true
    } catch (error) {
      console.error('Failed to register creator:', error)
      toast.error('Failed to register creator profile')
      return false
    } finally {
      setLoading(false)
    }
  }

  const calculateVerificationTier = (
    audienceSize: number, 
    connections: ContentCreator['platformConnections']
  ): ContentCreator['verificationTier'] => {
    let score = 0

    // Base score from audience size
    if (audienceSize >= 1000000) score += 40 // 1M+
    else if (audienceSize >= 100000) score += 30 // 100K+
    else if (audienceSize >= 10000) score += 20 // 10K+
    else if (audienceSize >= 1000) score += 10 // 1K+

    // Platform verification bonuses
    if (connections.youtube?.verified) score += 15
    if (connections.tiktok?.verified) score += 15
    if (connections.twitch?.verified) score += 10
    if (connections.instagram?.verified) score += 10

    // Patreon revenue bonus
    if (connections.patreon?.monthlyRevenue) {
      if (connections.patreon.monthlyRevenue >= 5000) score += 20
      else if (connections.patreon.monthlyRevenue >= 1000) score += 15
      else if (connections.patreon.monthlyRevenue >= 100) score += 10
    }

    // Determine tier
    if (score >= 70) return 'platinum'
    if (score >= 50) return 'gold'
    if (score >= 30) return 'silver'
    return 'bronze'
  }

  const negotiateLicense = async (
    beatNftId: string,
    proposedPrice: number,
    proposedRoyaltyShare: number,
    message?: string
  ): Promise<boolean> => {
    if (!creator) {
      toast.error('Creator profile required for negotiations')
      return false
    }

    try {
      const negotiation: NegotiationRecord = {
        id: `neg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        beatNftId,
        proposedPrice,
        proposedRoyaltyShare,
        message,
        status: 'pending',
        createdAt: new Date()
      }

      // Add to creator's negotiation history
      const updatedCreator = {
        ...creator,
        negotiationHistory: [...creator.negotiationHistory, negotiation],
        updatedAt: new Date()
      }

      localStorage.setItem(`creator_profile_${address}`, JSON.stringify(updatedCreator))
      setCreator(updatedCreator)

      // Store negotiation for producer to review
      const negotiations = JSON.parse(localStorage.getItem('pending_negotiations') || '[]')
      negotiations.push({
        ...negotiation,
        creatorAddress: address,
        creatorTier: creator.verificationTier,
        creatorType: creator.creatorType
      })
      localStorage.setItem('pending_negotiations', JSON.stringify(negotiations))

      toast.success('🤝 License negotiation submitted!')
      return true
    } catch (error) {
      console.error('Failed to submit negotiation:', error)
      toast.error('Failed to submit negotiation')
      return false
    }
  }

  const acceptLicense = async (licenseId: string): Promise<boolean> => {
    try {
      const licenseIndex = licenses.findIndex(l => l.id === licenseId)
      if (licenseIndex === -1) return false

      const updatedLicenses = [...licenses]
      updatedLicenses[licenseIndex] = {
        ...updatedLicenses[licenseIndex],
        status: 'active',
        acceptedAt: new Date()
      }

      localStorage.setItem(`creator_licenses_${address}`, JSON.stringify(updatedLicenses))
      setLicenses(updatedLicenses)

      toast.success('✅ License accepted!')
      return true
    } catch (error) {
      console.error('Failed to accept license:', error)
      return false
    }
  }

  const getCreatorStats = () => {
    if (!creator) return null

    const activeLicenses = licenses.filter(l => l.status === 'active').length
    const totalSpent = licenses
      .filter(l => l.status === 'active')
      .reduce((sum, l) => sum + l.negotiatedPrice, 0)
    
    const pendingNegotiations = creator.negotiationHistory.filter(n => n.status === 'pending').length

    return {
      activeLicenses,
      totalSpent,
      pendingNegotiations,
      verificationTier: creator.verificationTier,
      audienceSize: creator.audienceSize
    }
  }

  return {
    creator,
    licenses,
    loading,
    isCreator: !!creator,
    registerCreator,
    negotiateLicense,
    acceptLicense,
    getCreatorStats,
    isConnected: isConnected && !!address
  }
}