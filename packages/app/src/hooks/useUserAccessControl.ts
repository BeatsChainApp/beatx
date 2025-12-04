'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"

interface SuspensionRecord {
  reason: string
  suspendedAt: string
  suspendedBy: string
  blockNumber: number
}

export function useUserAccessControl() {
  const [isSuspended, setIsSuspended] = useState(false)
  const [suspensionReason, setSuspensionReason] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const { address } = useAccount()

  useEffect(() => {
    checkSuspensionStatus()
  }, [address])

  const checkSuspensionStatus = () => {
    if (!address || typeof window === 'undefined') {
      setLoading(false)
      return
    }

    try {
      const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
      const userSuspension = suspendedUsers[address.toLowerCase()] as SuspensionRecord | undefined
      
      if (userSuspension) {
        setIsSuspended(true)
        setSuspensionReason(userSuspension.reason)
      } else {
        setIsSuspended(false)
        setSuspensionReason('')
      }
    } catch (error) {
      console.error('Failed to check suspension status:', error)
    } finally {
      setLoading(false)
    }
  }

  const isUserSuspended = (userAddress: string): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
      return suspendedUsers[userAddress.toLowerCase()] !== undefined
    } catch {
      return false
    }
  }

  const getSuspensionReason = (userAddress: string): string => {
    if (typeof window === 'undefined') return ''
    
    try {
      const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
      return suspendedUsers[userAddress.toLowerCase()]?.reason || ''
    } catch {
      return ''
    }
  }

  return {
    isSuspended,
    suspensionReason,
    loading,
    isUserSuspended,
    getSuspensionReason,
    checkSuspensionStatus
  }
}