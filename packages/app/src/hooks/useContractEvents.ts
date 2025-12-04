'use client'

import { useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useNotifications } from '@/context/NotificationsEnhanced'
import { formatEther } from 'viem'

// Import ABI and contract addresses
const BeatNFTCreditSystemAbi = [
  {
    type: 'event',
    name: 'CreditsPurchased',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'credits', type: 'uint256', indexed: false },
      { name: 'price', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'ProNFTUpgraded', 
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'price', type: 'uint256', indexed: false }
    ]
  },
  {
    type: 'event',
    name: 'CreditsUsed',
    inputs: [
      { name: 'user', type: 'address', indexed: true },
      { name: 'credits', type: 'uint256', indexed: false },
      { name: 'purpose', type: 'string', indexed: false }
    ]
  }
] as const

// Contract addresses
const BeatNFTCreditSystemAddress = {
  1: '0x0000000000000000000000000000000000000000', // Mainnet - not deployed
  11155111: '0xcf7f010edb33f5c8582e8f97e20ef76be8b83311', // Sepolia V2 - deployed
  31337: '0x5fbdb2315678afecb367f032d93f642f64180aa3' // Local - deployed
} as const

export function useContractEvents() {
  const account = useActiveAccount()
  const address = account?.address
  const { addNotification } = useNotifications()
  const publicClient = usePublicClient()
  
  // Get contract address based on current chain
  const chainId = publicClient?.chain?.id || 11155111 // Default to Sepolia
  const contractAddress = BeatNFTCreditSystemAddress[chainId as keyof typeof BeatNFTCreditSystemAddress] as `0x${string}`
  
  // Watch for CreditsPurchased events
  useWatchContractEvent({
    address: contractAddress,
    abi: BeatNFTCreditSystemAbi,
    eventName: 'CreditsPurchased',
    onLogs: (logs) => {
      logs.forEach(log => {
        const { args, transactionHash } = log
        
        // Only notify for events related to the current user
        if (args.user.toLowerCase() === address?.toLowerCase()) {
          const credits = Number(args.credits)
          const price = formatEther(args.price)
          
          addNotification(
            `You purchased ${credits} BeatNFT credits for ${price} ETH`,
            {
              type: 'credit',
              amount: Number(price),
              currency: 'ETH',
              transactionHash,
              metadata: {
                credits,
                price
              }
            }
          )
        }
      })
    }
  })
  
  // Watch for ProNFTUpgraded events
  useWatchContractEvent({
    address: contractAddress,
    abi: BeatNFTCreditSystemAbi,
    eventName: 'ProNFTUpgraded',
    onLogs: (logs) => {
      logs.forEach(log => {
        const { args, transactionHash } = log
        
        // Only notify for events related to the current user
        if (args.user.toLowerCase() === address?.toLowerCase()) {
          const price = formatEther(args.price)
          
          addNotification(
            `You upgraded to Pro BeatNFT for ${price} ETH`,
            {
              type: 'mint',
              amount: Number(price),
              currency: 'ETH',
              transactionHash,
              metadata: {
                type: 'ProNFT'
              }
            }
          )
        }
      })
    }
  })
  
  // Watch for CreditsUsed events
  useWatchContractEvent({
    address: contractAddress,
    abi: BeatNFTCreditSystemAbi,
    eventName: 'CreditsUsed',
    onLogs: (logs) => {
      logs.forEach(log => {
        const { args, transactionHash } = log
        
        // Only notify for events related to the current user
        if (args.user.toLowerCase() === address?.toLowerCase()) {
          const credits = Number(args.credits)
          const purpose = args.purpose
          
          addNotification(
            `You used ${credits} BeatNFT credits for ${purpose}`,
            {
              type: 'credit',
              transactionHash,
              metadata: {
                credits,
                purpose
              }
            }
          )
        }
      })
    }
  })
  
  return null
}