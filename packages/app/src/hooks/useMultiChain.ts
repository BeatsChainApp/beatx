'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { SUPPORTED_CHAINS, getChainById, getChainIcon } from '@/config/chains'

export function useMultiChain() {
  const [supportedChains] = useState(SUPPORTED_CHAINS)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { chainId, isConnected } = useAccount()
  const { switchChain } = useSwitchChain()

  const currentChain = chainId ? getChainById(chainId) : undefined
  const currentChainIcon = chainId ? getChainIcon(chainId) : '⛓️'

  const switchToChain = async (targetChainId: number) => {
    if (!isConnected) {
      setError('Wallet not connected')
      return false
    }

    if (chainId === targetChainId) {
      return true
    }

    try {
      setIsLoading(true)
      setError(null)
      
      await switchChain({ chainId: targetChainId })
      return true
    } catch (err: any) {
      console.error('Chain switch failed:', err)
      setError(err.message || 'Failed to switch chain')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const isChainSupported = (chainId: number): boolean => {
    return supportedChains.some(chain => chain.id === chainId)
  }

  const getOptimalChain = (operation: 'mint' | 'purchase' | 'transfer'): number => {
    // Recommend chains based on operation type
    switch (operation) {
      case 'mint':
        return SUPPORTED_CHAINS.find(c => c.name === 'Polygon')?.id || 1 // Low gas for minting
      case 'purchase':
        return chainId || 1 // Stay on current chain
      case 'transfer':
        return SUPPORTED_CHAINS.find(c => c.name === 'Arbitrum')?.id || 1 // Fast transfers
      default:
        return 1 // Ethereum mainnet
    }
  }

  const getChainGasCost = (chainId: number): 'low' | 'medium' | 'high' => {
    const chain = getChainById(chainId)
    switch (chain?.gasPrice) {
      case 'low': return 'low'
      case 'high': return 'high'
      default: return 'medium'
    }
  }

  return {
    supportedChains,
    currentChain,
    currentChainIcon,
    switchToChain,
    isChainSupported,
    getOptimalChain,
    getChainGasCost,
    isLoading,
    error
  }
}