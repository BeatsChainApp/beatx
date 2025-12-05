import { useState, useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'

export function useWeb3Profile() {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const account = useActiveAccount()
  const address = account?.address
  
  useEffect(() => {
    if (!address) {
      setProfile(null)
      setLoading(false)
      return
    }
    
    try {
      // Load profile from localStorage
      const profileKey = `web3_profile_${address.toLowerCase()}`
      const stored = localStorage.getItem(profileKey)
      
      if (stored) {
        setProfile(JSON.parse(stored))
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.warn('Failed to load Web3 profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [address])
  
  return {
    profile,
    loading
  }
}