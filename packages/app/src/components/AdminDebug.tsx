'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useActiveAccount } from 'thirdweb/react'

const SUPER_ADMIN_WALLETS = ['0xc84799a904eeb5c57abbbc40176e7db8be202c10']

export function AdminDebug() {
  const auth = useUnifiedAuth()
  const account = useActiveAccount()
  const address = account?.address

  if (typeof window === 'undefined') return null

  const isInSuperAdminList = address ? SUPER_ADMIN_WALLETS.includes(address.toLowerCase()) : false

  return (
    <div className="fixed top-4 right-4 bg-red-900 text-white p-3 rounded text-xs max-w-xs z-50">
      <h4 className="font-bold mb-1">🚨 Admin Debug</h4>
      <div className="space-y-1">
        <div>Address: {address?.slice(0, 8)}...{address?.slice(-4)}</div>
        <div>In Super Admin List: {isInSuperAdminList ? '✅' : '❌'}</div>
        <div>Current Role: <span className="font-bold">{auth.user?.role || 'None'}</span></div>
        <div>Is Super Admin: {auth.hasRole('super_admin') ? '✅' : '❌'}</div>
        <div>Loading: {auth.loading ? '⏳' : '✅'}</div>
      </div>
      
      {isInSuperAdminList && !auth.hasRole('super_admin') && (
        <button 
          onClick={() => {
            if (address) {
              const profile = {
                address,
                displayName: 'Super Admin',
                bio: 'Platform administrator',
                role: 'super_admin',
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
              }
              if (typeof window !== 'undefined') {
                localStorage.setItem(`web3_profile_${address.toLowerCase()}`, JSON.stringify(profile))
              }
              window.location.reload()
            }
          }}
          className="mt-2 bg-yellow-600 text-white px-2 py-1 rounded text-xs"
        >
          Force Super Admin
        </button>
      )}
    </div>
  )
}