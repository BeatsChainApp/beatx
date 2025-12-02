'use client'

import { useState, useEffect } from 'react'
import { Beat } from '@/types/data'

const MCP_SERVER_URL = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'

export function useBeats() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBeats = async (params: {
    limit?: number
    offset?: number
    producer?: string
    genre?: string
    featured?: boolean
    search?: string
  } = {}) => {
    try {
      setLoading(true)
      setError(null)

      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`${MCP_SERVER_URL}/api/beats?${searchParams}`)
      const data = await response.json()

      if (data.success) {
        setBeats(data.beats || [])
      } else {
        throw new Error(data.error || 'Failed to fetch beats')
      }
    } catch (err: any) {
      setError(err.message)
      console.error('Failed to fetch beats:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFeaturedBeats = async (limit = 6) => {
    try {
      setLoading(true)
      const response = await fetch(`${MCP_SERVER_URL}/api/beats/featured?limit=${limit}`)
      const data = await response.json()
      
      if (data.success) {
        return data.beats || []
      }
      return []
    } catch (err) {
      console.error('Failed to fetch featured beats:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getBeat = async (id: string): Promise<Beat | null> => {
    try {
      const response = await fetch(`${MCP_SERVER_URL}/api/beats/${id}`)
      const data = await response.json()
      
      if (data.success && data.beat) {
        return data.beat
      }
      return null
    } catch (err) {
      console.error('Failed to fetch beat:', err)
      return null
    }
  }

  const trackPlay = async (beatId: string, userAddress?: string) => {
    try {
      await fetch(`${MCP_SERVER_URL}/api/beats/${beatId}/play`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_address: userAddress,
          source: 'web'
        })
      })
    } catch (err) {
      console.warn('Failed to track play:', err)
    }
  }

  const getGenres = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${MCP_SERVER_URL}/api/beats/genres`)
      const data = await response.json()
      
      if (data.success) {
        return data.genres || []
      }
      return []
    } catch (err) {
      console.error('Failed to fetch genres:', err)
      return ['Hip Hop', 'Trap', 'R&B', 'Afrobeats', 'Amapiano']
    }
  }

  return {
    beats,
    loading,
    error,
    fetchBeats,
    getFeaturedBeats,
    getBeat,
    trackPlay,
    getGenres
  }
}