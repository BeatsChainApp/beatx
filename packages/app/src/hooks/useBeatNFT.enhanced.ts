'use client'

import { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

export function useBeatNFT() {
  const [minting, setMinting] = useState(false)
  const { user, isAuthenticated } = useUnifiedAuth()

  const canUpload = isAuthenticated && (
    user?.role === 'producer' || 
    user?.role === 'admin' || 
    user?.role === 'super_admin'
  )

  const mintBeatNFT = async (metadata: any) => {
    if (!canUpload) {
      throw new Error('Not authorized to mint NFTs')
    }

    setMinting(true)
    try {
      const response = await fetch('/api/mint-beat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          producer: user?.address,
          metadata,
          creditsToUse: 1
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Minting failed')
      }

      const result = await response.json()
      return result
    } catch (error) {
      console.error('Minting error:', error)
      throw error
    } finally {
      setMinting(false)
    }
  }

  return {
    canUpload,
    minting,
    mintBeatNFT
  }
}