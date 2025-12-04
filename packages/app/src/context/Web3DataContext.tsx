'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { formatEther } from 'viem'
import { useWeb3BeatsBridge } from '@/hooks/useWeb3BeatsBridge'

// Define Beat type
interface Beat {
  id: string
  tokenId?: string
  title: string
  description: string
  price: number
  genre: string
  bpm: number
  producerId: string
  coverImageUrl: string
  audioUrl?: string
  isActive: boolean
  tags?: string[]
}

interface Web3DataContextType {
  beats: Beat[]
  loading: boolean
  refreshBeats: () => Promise<void>
  communityBeats: Beat[]
  localBeats: Beat[]
}

const Web3DataContext = createContext<Web3DataContextType | undefined>(undefined)

// Metadata API endpoint
const METADATA_API = 'https://api.beatschain.app/metadata'

export function Web3DataProvider({ children }: { children: ReactNode }) {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const account = useActiveAccount()
  const address = account?.address
  const { allBeats, communityBeats, localBeats, loading: bridgeLoading, refreshCommunity } = useWeb3BeatsBridge()

  const refreshBeats = async () => {
    setLoading(true)
    try {
      // Fetch beats from blockchain and metadata API
      const beatData = await fetchBeatsData()
      
      // Combine with bridge beats (community + local)
      const combinedBeats = [
        ...beatData,
        ...allBeats.filter(beat => !beatData.some(b => b.id === beat.id))
      ]
      
      setBeats(combinedBeats)
      
      // Refresh community beats
      await refreshCommunity()
    } catch (error) {
      console.error('Failed to fetch beats:', error)
      setBeats(allBeats) // Fallback to bridge beats
    } finally {
      setLoading(false)
    }
  }

  const fetchBeatsData = async (): Promise<Beat[]> => {
    try {
      // For now, use local storage until Thirdweb contract integration is complete
      // TODO: Implement Thirdweb contract reading
      console.log('Using local storage for beats data')
      
      // Fallback to local storage
      return getLocalBeats()
    } catch (error) {
      console.error('Error in fetchBeatsData:', error)
      return getLocalBeats()
    }
  }

  // TODO: Implement Thirdweb contract reading
  const fetchBeatData = async (tokenId: bigint): Promise<Beat | null> => {
    // Placeholder for Thirdweb implementation
    return null
  }

  const getLocalBeats = (): Beat[] => {
    try {
      // Get all producer beats from localStorage
      const allBeats: Beat[] = []
      
      // Get beats from all producers
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key?.startsWith('producer_beats_')) {
          const beatsStr = localStorage.getItem(key)
          if (beatsStr) {
            const producerBeats = JSON.parse(beatsStr)
            allBeats.push(...producerBeats)
          }
        }
      }
      
      // Also check legacy beats_data key
      const legacyBeatsStr = localStorage.getItem('beats_data')
      if (legacyBeatsStr) {
        const legacyBeats = JSON.parse(legacyBeatsStr)
        allBeats.push(...legacyBeats)
      }
      
      console.log('Local beats found:', allBeats.length)
      console.log('Local beats data:', allBeats)
      
      // Convert date strings to Date objects for compatibility
      const processedBeats = allBeats.map(beat => ({
        ...beat,
        createdAt: beat.createdAt ? new Date(beat.createdAt) : new Date(),
        updatedAt: beat.updatedAt ? new Date(beat.updatedAt) : new Date()
      }))
      
      return processedBeats
    } catch (error) {
      console.error('Error getting local beats:', error)
      return []
    }
  }

  useEffect(() => {
    refreshBeats()
  }, [address, allBeats.length])
  
  // Update beats when bridge data changes
  useEffect(() => {
    if (!bridgeLoading && allBeats.length > 0) {
      setBeats(prevBeats => {
        const blockchainBeats = prevBeats.filter(beat => beat.tokenId)
        const combinedBeats = [
          ...blockchainBeats,
          ...allBeats.filter(beat => !blockchainBeats.some(b => b.id === beat.id))
        ]
        return combinedBeats
      })
    }
  }, [allBeats, bridgeLoading])
  
  // Expose beats data globally for adapters to access
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__WEB3_DATA_CONTEXT__ = { beats, loading }
    }
  }, [beats, loading])

  return (
    <Web3DataContext.Provider value={{ 
      beats, 
      loading: loading || bridgeLoading, 
      refreshBeats,
      communityBeats,
      localBeats
    }}>
      {children}
    </Web3DataContext.Provider>
  )
}

export function useWeb3Data() {
  const context = useContext(Web3DataContext)
  if (context === undefined) {
    console.warn('useWeb3Data must be used within a Web3DataProvider')
    return {
      beats: [],
      loading: false,
      refreshBeats: async () => {},
      communityBeats: [],
      localBeats: []
    }
  }
  return context
}