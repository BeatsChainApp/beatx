'use client'

import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { parseEther } from 'viem'
import { toast } from 'react-toastify'

const MarketplaceAbi = [
  {
    type: 'function',
    name: 'listBeatNFT',
    inputs: [
      { name: '_tokenId', type: 'uint256' },
      { name: '_price', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  },
  {
    type: 'function',
    name: 'buyBeatNFT',
    inputs: [{ name: '_tokenId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'createRoyaltyStream',
    inputs: [
      { name: '_tokenId', type: 'uint256' },
      { name: '_sharePercentage', type: 'uint256' },
      { name: '_price', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'nonpayable'
  }
] as const

const MARKETPLACE_ADDRESS = '0x0000000000000000000000000000000000000000'

export function useBeatNFTTrading() {
  const [loading, setLoading] = useState(false)
  const { address } = useAccount()
  const { writeContract } = useWriteContract()

  const listForSale = async (tokenId: string, price: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceAbi,
        functionName: 'listBeatNFT',
        args: [BigInt(tokenId), parseEther(price.toString())]
      })
      
      toast.success(`🏪 BeatNFT™ listed for sale! TX: ${hash.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Listing failed: ${error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const buyBeatNFT = async (tokenId: string, price: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceAbi,
        functionName: 'buyBeatNFT',
        args: [BigInt(tokenId)],
        value: parseEther(price.toString())
      })
      
      toast.success(`🎉 BeatNFT™ purchased! TX: ${hash.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Purchase failed: ${error.message}`)
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
      const hash = await writeContract({
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MarketplaceAbi,
        functionName: 'createRoyaltyStream',
        args: [
          BigInt(tokenId), 
          BigInt(sharePercentage * 100), // Convert to basis points
          parseEther(price.toString())
        ]
      })
      
      toast.success(`💰 Royalty stream created! TX: ${hash.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Stream creation failed: ${error.message}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    listForSale,
    buyBeatNFT,
    createRoyaltyStream
  }
}