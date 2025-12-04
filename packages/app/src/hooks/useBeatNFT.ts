'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount, useSendTransaction } from "thirdweb/react"
import { parseEther } from 'viem'
import { toast } from 'react-toastify'

// Smart contract ABI for BeatNFT Credit System
const BeatNFTCreditSystemAbi = [
  {
    type: 'function',
    name: 'purchaseCredits',
    inputs: [{ name: 'packageId', type: 'uint256' }],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function', 
    name: 'upgradeToProNFT',
    inputs: [],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    type: 'function',
    name: 'getCreditBalance', 
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'hasProNFT',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
  {
    type: 'function',
    name: 'canUpload',
    inputs: [{ name: 'user', type: 'address' }, { name: 'requiredCredits', type: 'uint256' }],
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view'
  },
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
  }
] as const

// Contract addresses
const BeatNFTCreditSystemAddress = {
  1: '0x0000000000000000000000000000000000000000', // Mainnet - not deployed
  11155111: '0x8fa4e195010615d2376381e5de7a8099e2413d75', // Sepolia - deployed
  31337: '0x0000000000000000000000000000000000000000' // Local - deploy needed
} as const

export interface BeatNFTBalance {
  credits: number
  hasProNFT: boolean
  totalUsed: number
  totalPurchased?: number
  lastPurchase?: string
  proNFTUpgradedAt?: string
  proNFTTransactionHash?: string
}

export function useBeatNFT() {
  const [balance, setBalance] = useState<BeatNFTBalance>({
    credits: 10, // Default free credits
    hasProNFT: false,
    totalUsed: 0
  })
  const [loading, setLoading] = useState(false)
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account

  useEffect(() => {
    if (isConnected && address) {
      loadBalance()
    }
  }, [address, isConnected])

  const loadBalance = async () => {
    if (!address || typeof window === 'undefined') return

    try {
      setLoading(true)
      
      // Load from localStorage (temporary until smart contract integration)
      const stored = localStorage.getItem(`beatnft_balance_${address}`)
      if (stored) {
        const balanceData = JSON.parse(stored)
        setBalance(balanceData)
      } else {
        // New user gets 10 free credits
        const newBalance = {
          credits: 10,
          hasProNFT: false,
          totalUsed: 0,
          welcomeCreditsReceived: true,
          receivedAt: new Date().toISOString()
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
        
        // Welcome notification
        setTimeout(() => {
          toast.success('🎉 Welcome! You received 10 free BeatNFT credits to start uploading!')
        }, 1000)
      }
    } catch (error) {
      console.error('Failed to load BeatNFT balance:', error)
    } finally {
      setLoading(false)
    }
  }

  const canUpload = (fileType: string): { allowed: boolean; cost: number; reason?: string } => {
    const costs = {
      'mp3': 1,
      'wav': 2,
      'zip': 3
    }
    
    const cost = costs[fileType as keyof typeof costs] || 1
    
    if (balance.hasProNFT) {
      return { allowed: true, cost: 0 }
    }
    
    if (balance.credits >= cost) {
      return { allowed: true, cost }
    }
    
    return { 
      allowed: false, 
      cost, 
      reason: `Need ${cost} BeatNFT credits. You have ${balance.credits}.`
    }
  }

  const useCredits = async (amount: number): Promise<boolean> => {
    if (!address || balance.hasProNFT || typeof window === 'undefined') return true
    
    if (balance.credits < amount) return false
    
    try {
      const newBalance = {
        ...balance,
        credits: balance.credits - amount,
        totalUsed: balance.totalUsed + amount
      }
      
      localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
      setBalance(newBalance)
      return true
    } catch (error) {
      console.error('Failed to use credits:', error)
      return false
    }
  }

  const { mutate: sendTransaction } = useSendTransaction()
  
  const buyCredits = async (amount: number): Promise<boolean> => {
    if (!address) return false
    
    try {
      // Determine package ID based on amount
      let packageId = 0
      let cost = 0.01
      
      if (amount === 10) { packageId = 0; cost = 0.01 }
      else if (amount === 25) { packageId = 1; cost = 0.02 }
      else if (amount === 50) { packageId = 2; cost = 0.035 }
      else {
        toast.error('Invalid credit package')
        return false
      }
      
      // Check if contract is deployed
      const contractAddress = BeatNFTCreditSystemAddress[11155111] as `0x${string}`
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        // Fallback to simulation for now
        return await simulateCreditPurchase(amount, cost)
      }
      
      // Real smart contract call - fallback to simulation for now
      return await simulateCreditPurchase(amount, cost)
      
      toast.success(`🔄 Transaction submitted: ${hash.slice(0, 10)}...`)
      
      // Wait for transaction confirmation
      // Note: useWaitForTransactionReceipt would be used here in a real implementation
      
      // Update local balance for immediate UI feedback
      if (typeof window !== 'undefined') {
        const newBalance = {
          ...balance,
          credits: balance.credits + amount,
          totalPurchased: (balance.totalPurchased || 0) + amount,
          lastPurchase: new Date().toISOString()
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
      }
      
      return true
    } catch (error: any) {
      console.error('Failed to buy credits:', error)
      toast.error(`Transaction failed: ${error.message || 'Unknown error'}`)
      return false
    }
  }
  
  const simulateCreditPurchase = async (amount: number, cost: number): Promise<boolean> => {
    try {
      // Simulate blockchain transaction with localStorage
      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
      
      // Record transaction in blockchain-compatible format
      const transaction = {
        hash: transactionHash,
        from: address,
        amount,
        cost,
        timestamp: new Date().toISOString(),
        blockNumber: Date.now() // Placeholder for actual block number
      }
      
      // Store transaction record
      const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
      transactions.push(transaction)
      localStorage.setItem('credit_transactions', JSON.stringify(transactions))
      
      // Update balance
      if (typeof window !== 'undefined') {
        const newBalance = {
          ...balance,
          credits: balance.credits + amount,
          totalPurchased: (balance.totalPurchased || 0) + amount,
          lastPurchase: new Date().toISOString()
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
      }
      return true
    } catch (error) {
      console.error('Failed to simulate credit purchase:', error)
      return false
    }
  }

  const upgradeToProNFT = async (): Promise<boolean> => {
    if (!address) return false
    
    try {
      // Check if contract is deployed
      const contractAddress = BeatNFTCreditSystemAddress[11155111] as `0x${string}`
      if (contractAddress === '0x0000000000000000000000000000000000000000') {
        // Fallback to simulation for now
        return await simulateProNFTUpgrade()
      }
      
      // Real smart contract call - fallback to simulation for now
      return await simulateProNFTUpgrade()
      
      toast.success(`🔄 Pro BeatNFT upgrade submitted: ${hash.slice(0, 10)}...`)
      
      // Update local balance for immediate UI feedback
      if (typeof window !== 'undefined') {
        const newBalance = {
          ...balance,
          hasProNFT: true,
          proNFTUpgradedAt: new Date().toISOString(),
          proNFTTransactionHash: hash
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
      }
      return true
    } catch (error: any) {
      console.error('Failed to upgrade to Pro BeatNFT:', error)
      toast.error(`Pro BeatNFT upgrade failed: ${error.message || 'Unknown error'}`)
      return false
    }
  }
  
  const simulateProNFTUpgrade = async (): Promise<boolean> => {
    try {
      // Simulate blockchain transaction with localStorage
      const transactionHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`
      
      // Record Pro BeatNFT purchase transaction
      const transaction = {
        hash: transactionHash,
        from: address,
        type: 'pro_nft_upgrade',
        cost: 0.1,
        timestamp: new Date().toISOString(),
        blockNumber: Date.now() // Placeholder for actual block number
      }
      
      // Store transaction record
      const transactions = JSON.parse(localStorage.getItem('pro_nft_transactions') || '[]')
      transactions.push(transaction)
      localStorage.setItem('pro_nft_transactions', JSON.stringify(transactions))
      
      // Update balance
      if (typeof window !== 'undefined') {
        const newBalance = {
          ...balance,
          hasProNFT: true,
          proNFTUpgradedAt: new Date().toISOString(),
          proNFTTransactionHash: transactionHash
        }
        localStorage.setItem(`beatnft_balance_${address}`, JSON.stringify(newBalance))
        setBalance(newBalance)
      }
      return true
    } catch (error) {
      console.error('Failed to simulate Pro BeatNFT upgrade:', error)
      return false
    }
  }

  const openCreditTrading = (mode: 'buy' | 'sell' | 'gift') => {
    console.log(`Opening credit trading: ${mode}`)
  }

  return {
    balance,
    loading,
    canUpload,
    useCredits,
    buyCredits,
    upgradeToProNFT,
    openCreditTrading,
    isConnected: isConnected && !!address
  }
}