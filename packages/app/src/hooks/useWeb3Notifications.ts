'use client'

import { useEffect, useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useEnhancedToast } from './useToast.enhanced'
import { useFeatureFlag } from '@/lib/featureFlags'

export function useWeb3Notifications() {
  const account = useActiveAccount()
  const address = account?.address
  const { success, info } = useEnhancedToast()
  const realTimeNotifications = useFeatureFlag('realTimeNotifications')
  const [notifications, setNotifications] = useState<any[]>([])

  // Watch for beat purchases
  useWatchContractEvent({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        type: 'event',
        name: 'BeatPurchased',
        inputs: [
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'buyer', type: 'address', indexed: true },
          { name: 'price', type: 'uint256' }
        ]
      }
    ],
    eventName: 'BeatPurchased',
    onLogs: (logs) => {
      if (!realTimeNotifications) return
      
      logs.forEach((log) => {
        const { tokenId, buyer, price } = log.args
        
        if (buyer === address) {
          success(`🎵 Beat #${tokenId} purchased successfully!`)
        }
        
        setNotifications(prev => [...prev, {
          id: Date.now(),
          type: 'purchase',
          tokenId,
          buyer,
          price,
          timestamp: new Date()
        }])
      })
    }
  })

  return { notifications }
}