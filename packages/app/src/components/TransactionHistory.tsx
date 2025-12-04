'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// Add relative time plugin
dayjs.extend(relativeTime)

interface Transaction {
  hash: string
  type: 'credit_purchase' | 'pro_nft_upgrade' | 'beat_purchase' | 'credit_use'
  timestamp: string
  amount?: number
  currency?: string
  credits?: number
  beatId?: string
  beatTitle?: string
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const account = useActiveAccount(); const address = account?.address
  
  useEffect(() => {
    if (!address) return
    
    const loadTransactions = async () => {
      setLoading(true)
      
      try {
        // Load from localStorage for now
        // In production, this would fetch from a backend or directly from blockchain
        const creditTxs = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
        const proNftTxs = JSON.parse(localStorage.getItem('pro_nft_transactions') || '[]')
        const beatTxs = JSON.parse(localStorage.getItem('beat_transactions') || '[]')
        
        // Combine and sort by timestamp (newest first)
        const allTxs = [
          ...creditTxs.map((tx: any) => ({ ...tx, type: 'credit_purchase' })),
          ...proNftTxs.map((tx: any) => ({ ...tx, type: 'pro_nft_upgrade' })),
          ...beatTxs.map((tx: any) => ({ ...tx, type: 'beat_purchase' }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        
        setTransactions(allTxs)
      } catch (error) {
        console.error('Failed to load transactions:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadTransactions()
  }, [address])
  
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'credit_purchase':
        return '🎫'
      case 'pro_nft_upgrade':
        return '⭐'
      case 'beat_purchase':
        return '🎵'
      case 'credit_use':
        return '📤'
      default:
        return '💰'
    }
  }
  
  const getTransactionTitle = (tx: Transaction) => {
    switch (tx.type) {
      case 'credit_purchase':
        return `Purchased ${tx.credits} credits`
      case 'pro_nft_upgrade':
        return 'Upgraded to Pro BeatNFT'
      case 'beat_purchase':
        return `Purchased beat "${tx.beatTitle || 'Unknown'}"`
      case 'credit_use':
        return `Used ${tx.credits} credits`
      default:
        return 'Transaction'
    }
  }
  
  const getTransactionLink = (hash: string) => {
    // Get chain ID from localStorage or default to Sepolia
    const chainId = localStorage.getItem('last_chain_id') || '11155111'
    
    if (chainId === '1') {
      return `https://etherscan.io/tx/${hash}`
    } else if (chainId === '11155111') {
      return `https://sepolia.etherscan.io/tx/${hash}`
    } else {
      return `https://etherscan.io/tx/${hash}`
    }
  }
  
  if (loading) {
    return (
      <div className="p-4 flex justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }
  
  if (transactions.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>No transactions found</p>
        <p className="text-sm mt-2">Your transaction history will appear here</p>
      </div>
    )
  }
  
  return (
    <div className="divide-y divide-gray-200">
      {transactions.map((tx) => (
        <div key={tx.hash} className="p-4 hover:bg-gray-50">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-1 text-2xl">
              {getTransactionIcon(tx.type)}
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{getTransactionTitle(tx)}</h3>
              
              {tx.amount && (
                <p className="text-sm text-gray-600">
                  Amount: {tx.amount} {tx.currency || 'ETH'}
                </p>
              )}
              
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span>{dayjs(tx.timestamp).fromNow()}</span>
                <span className="mx-2">•</span>
                <a 
                  href={getTransactionLink(tx.hash)} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View on Etherscan
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}