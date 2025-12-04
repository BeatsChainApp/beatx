'use client'

import { useEffect } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

const SUPER_ADMIN_WALLETS = [
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
]

export function ForceAdminRefresh() {
  const account = useActiveAccount()
  const address = account?.address
  const { user, hasRole } = useUnifiedAuth()

  useEffect(() => {
    if (address && SUPER_ADMIN_WALLETS.includes(address.toLowerCase()) && !hasRole('super_admin')) {
      // Force super admin profile creation
      const profileKey = `web3_profile_${address.toLowerCase()}`
      const superAdminProfile = {
        address,
        displayName: 'Super Admin',
        bio: 'Platform super administrator',
        role: 'super_admin',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      localStorage.setItem(profileKey, JSON.stringify(superAdminProfile))
      
      // Force page refresh to reload context
      setTimeout(() => window.location.reload(), 500)
    }
  }, [address, hasRole])

  return null
}