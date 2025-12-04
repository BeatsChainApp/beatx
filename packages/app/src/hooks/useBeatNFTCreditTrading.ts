'use client'

import { useState, useCallback, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { toast } from 'react-toastify'

interface CreditListing {
  id: string
  seller: string
  credits: number
  pricePerCredit: number
  totalPrice: number
  timestamp: Date
}

export function useBeatNFTCreditTrading() {
  const [loading, setLoading] = useState(false)
  const [listings, setListings] = useState<CreditListing[]>([])
  const { address } = useAccount()
  
  const loadMarketListings = useCallback(async () => {
    if (typeof window === 'undefined' || !address) return
    
    try {
      const stored = localStorage.getItem('credit_listings') || '[]'
      const allListings = JSON.parse(stored)
      setListings(allListings.filter((l: CreditListing) => l.seller !== address))
    } catch (error) {
      console.error('Failed to load listings:', error)
    }
  }, [address])
  
  useEffect(() => {
    let mounted = true
    
    const load = async () => {
      if (mounted && address) {
        await loadMarketListings()
      }
    }
    
    load()
    
    return () => {
      mounted = false
    }
  }, [loadMarketListings, address])

  const listCreditsForSale = async (credits: number, pricePerCredit: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const listing: CreditListing = {
        id: `listing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        seller: address,
        credits,
        pricePerCredit,
        totalPrice: credits * pricePerCredit,
        timestamp: new Date()
      }
      
      // Store in localStorage (Phase 1 - will move to smart contract)
      const existingListings = JSON.parse(localStorage.getItem('credit_listings') || '[]')
      existingListings.push(listing)
      localStorage.setItem('credit_listings', JSON.stringify(existingListings))
      
      toast.success(`🏪 ${credits} BeatNFT credits listed at $${pricePerCredit} each!`)
      return true
    } catch (error) {
      toast.error('Failed to list credits')
      return false
    } finally {
      setLoading(false)
    }
  }

  const buyCredits = async (listingId: string): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const existingListings = JSON.parse(localStorage.getItem('credit_listings') || '[]')
      const listingIndex = existingListings.findIndex((l: CreditListing) => l.id === listingId)
      
      if (listingIndex === -1) {
        toast.error('Listing not found')
        return false
      }
      
      const listing = existingListings[listingIndex]
      
      // Remove listing
      existingListings.splice(listingIndex, 1)
      localStorage.setItem('credit_listings', JSON.stringify(existingListings))
      
      // Add credits to buyer
      const buyerBalance = JSON.parse(localStorage.getItem(`beatnft_balance_${address}`) || '{}')
      buyerBalance.credits = (buyerBalance.credits || 0) + listing.credits
      localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(buyerBalance))
      
      toast.success(`🎉 Purchased ${listing.credits} credits for $${listing.totalPrice}!`)
      return true
    } catch (error) {
      toast.error('Failed to buy credits')
      return false
    } finally {
      setLoading(false)
    }
  }

  const giftCredits = async (recipientAddress: string, credits: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      // Remove credits from sender
      const senderBalance = JSON.parse(localStorage.getItem(`beatnft_balance_${address}`) || '{}')
      if ((senderBalance.credits || 0) < credits) {
        toast.error('Insufficient credits to gift')
        return false
      }
      
      senderBalance.credits -= credits
      localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(senderBalance))
      
      // Add credits to recipient
      const recipientBalance = JSON.parse(localStorage.getItem(`beatnft_balance_${recipientAddress}`) || '{}')
      recipientBalance.credits = (recipientBalance.credits || 0) + credits
      localStorage.setItem(`beatnft_balance_${recipientAddress}`, JSON.stringify(recipientBalance))
      
      // Record gift transaction
      const giftRecord = {
        from: address,
        to: recipientAddress,
        credits,
        timestamp: new Date().toISOString(),
        type: 'gift'
      }
      
      const gifts = JSON.parse(localStorage.getItem('credit_gifts') || '[]')
      gifts.push(giftRecord)
      localStorage.setItem('credit_gifts', JSON.stringify(gifts))
      
      toast.success(`🎁 Gifted ${credits} BeatNFT credits!`)
      return true
    } catch (error) {
      toast.error('Failed to gift credits')
      return false
    } finally {
      setLoading(false)
    }
  }



  return {
    loading,
    listings,
    listCreditsForSale,
    buyCredits,
    giftCredits,
    loadMarketListings
  }
}