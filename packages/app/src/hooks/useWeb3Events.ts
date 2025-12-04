'use client'

import { useState, useEffect, useCallback } from 'react'
import { EventIndexer, IndexedEvent } from '@/lib/indexing'
import { BEAT_NFT_EVENTS } from '@/utils/web3Events'

export function useWeb3Events(contractAddress?: string) {
  const defaultAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x58cab6383b346c08775d1340301fabbfc3a66239'
  const address = contractAddress || defaultAddress
  const [events, setEvents] = useState<IndexedEvent[]>([])
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  // Load stored events on mount (client-side only)
  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined') {
      const storedEvents = EventIndexer.getStoredEvents()
      setEvents(storedEvents)
    }
  }, [])

  const handleNewEvent = useCallback((eventData: any, eventType: string) => {
    if (!mounted || typeof window === 'undefined') return
    
    const newEvent: IndexedEvent = {
      id: `${eventType}-${eventData.transactionHash}-${Date.now()}`,
      type: eventType as any,
      tokenId: eventData.args?.tokenId?.toString() || '',
      blockNumber: eventData.blockNumber,
      txHash: eventData.transactionHash,
      timestamp: new Date(),
      data: eventData.args
    }

    setEvents(prev => [newEvent, ...prev.slice(0, 99)])
    EventIndexer.storeEvents([newEvent])
  }, [mounted])

  // TODO: Replace with Thirdweb contract event watching
  // For now, use polling or manual event fetching
  useEffect(() => {
    if (!address || !mounted) return
    
    // Simulate event watching with periodic checks
    const interval = setInterval(() => {
      // This would be replaced with actual Thirdweb event listening
      console.log('Checking for contract events...')
    }, 30000) // Check every 30 seconds
    
    return () => clearInterval(interval)
  }, [address, mounted])

  const indexHistoricalEvents = async () => {
    if (!address || !mounted || typeof window === 'undefined') return
    
    try {
      setError(null)
      await EventIndexer.indexContractEvents(address)
      const updatedEvents = EventIndexer.getStoredEvents()
      setEvents(updatedEvents)
    } catch (err: any) {
      setError(err.message)
    }
  }

  const getEventsByTokenId = (tokenId: string) => {
    return events.filter(event => event.tokenId === tokenId)
  }

  const getEventsByType = (type: IndexedEvent['type']) => {
    return events.filter(event => event.type === type)
  }

  const clearEvents = () => {
    setEvents([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('web3-events-index')
    }
  }

  useEffect(() => {
    setIsListening(!!address)
  }, [address])

  return {
    events,
    isListening,
    error,
    indexHistoricalEvents,
    getEventsByTokenId,
    getEventsByType,
    clearEvents
  }
}