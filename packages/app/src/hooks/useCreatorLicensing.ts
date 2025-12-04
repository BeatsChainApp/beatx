'use client'

import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { parseEther } from 'viem'
import { toast } from 'react-toastify'

import { CreatorLicensingABI } from '../contracts/CreatorLicensing'

const CreatorLicensingAbi = CreatorLicensingABI

const CONTRACT_ADDRESS = '0x0ae18b951a38ef7464e77ec9b309c3505c4eb4a0' // CreatorLicensing deployed address

export function useCreatorLicensing() {
  const [loading, setLoading] = useState(false)
  const account = useActiveAccount()
  const address = account?.address
  const writeContract = () => { console.warn('writeContract disabled'); return Promise.resolve('0x0') }

  const createNegotiation = async (
    beatNftId: string,
    producerAddress: string,
    proposedPrice: number,
    creatorRoyaltyShare: number,
    message: string
  ): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CreatorLicensingAbi,
        functionName: 'createNegotiation',
        args: [
          BigInt(beatNftId),
          producerAddress as `0x${string}`,
          parseEther(proposedPrice.toString()),
          BigInt(creatorRoyaltyShare * 100), // Convert to basis points
          message
        ]
      })
      
      toast.success(`🤝 Negotiation created! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const acceptNegotiation = async (negotiationId: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CreatorLicensingAbi,
        functionName: 'acceptNegotiation',
        args: [BigInt(negotiationId)]
      })
      
      toast.success(`✅ Negotiation accepted! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  const payLicense = async (negotiationId: number, amount: number): Promise<boolean> => {
    if (!address) return false
    
    setLoading(true)
    try {
      const hash = await // writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CreatorLicensingAbi,
        functionName: 'payLicense',
        args: [BigInt(negotiationId)],
        value: parseEther(amount.toString())
      })
      
      toast.success(`💰 License paid! TX: ${hash?.slice(0, 10)}...`)
      return true
    } catch (error: any) {
      toast.error(`Payment failed: ${error.message || 'Unknown error'}`)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createNegotiation,
    acceptNegotiation,
    payLicense
  }
}