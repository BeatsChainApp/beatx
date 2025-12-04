'use client'

import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { parseEther } from 'viem'
import { toast } from 'react-toastify'
import { BeatNFTMarketplaceABI, BeatNFTMarketplaceAddress } from '../contracts/BeatNFTMarketplace'

export function useMarketplace() {
  const [loading, setLoading] = useState(false)
  const account = useActiveAccount()
  const address = account?.address
  const writeContract = () => { console.warn('writeContract disabled'); return Promise.resolve('0x0') }

  const listBeatNFT = async (tokenId: string, price: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: BeatNFTMarketplaceAddress as `0x${string}`,
        abi: BeatNFTMarketplaceABI,
        functionName: 'listBeatNFT',
        args: [BigInt(tokenId), parseEther(price.toString())]
      })
      
      toast.success(`🏪 BeatNFT listed for sale! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Failed to list: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const buyBeatNFT = async (tokenId: string, price: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: BeatNFTMarketplaceAddress as `0x${string}`,
        abi: BeatNFTMarketplaceABI,
        functionName: 'buyBeatNFT',
        args: [BigInt(tokenId)],
        value: parseEther(price.toString())
      })
      
      toast.success(`🎵 BeatNFT purchased! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const createRoyaltyStream = async (
    tokenId: string, 
    sharePercentage: number, 
    price: number
  ): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: BeatNFTMarketplaceAddress as `0x${string}`,
        abi: BeatNFTMarketplaceABI,
        functionName: 'createRoyaltyStream',
        args: [
          BigInt(tokenId), 
          BigInt(sharePercentage * 100), // Convert to basis points
          parseEther(price.toString())
        ]
      })
      
      toast.success(`💰 Royalty stream created! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Failed to create stream: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Read active listings
  const { data: activeListings } = useReadContract({
    address: BeatNFTMarketplaceAddress as `0x${string}`,
    abi: BeatNFTMarketplaceABI,
    functionName: 'getActiveListings'
  })

  return {
    loading,
    listBeatNFT,
    buyBeatNFT,
    createRoyaltyStream,
    activeListings: activeListings as bigint[] || []
  }
}