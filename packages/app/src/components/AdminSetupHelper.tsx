'use client'

import { useState } from 'react'
import { useActiveAccount } from 'thirdweb/react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

// Super admin wallets (same as UnifiedAuthContext)
const SUPER_ADMIN_WALLETS = [
  process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase(),
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10', // Your wallet address
].filter(Boolean) as string[]

export default function AdminSetupHelper() {
  const account = useActiveAccount()
  const address = account?.address
  const isConnected = !!account
  const { user, hasRole } = useUnifiedAuth()
  const [showHelper, setShowHelper] = useState(false)
  
  // Only show helper if:
  // 1. Wallet is connected
  // 2. Address is in SUPER_ADMIN_WALLETS list
  // 3. User doesn't already have super_admin role
  const shouldShowHelper = isConnected && 
    address && 
    SUPER_ADMIN_WALLETS.includes(address.toLowerCase()) && 
    !hasRole('super_admin')
  
  if (!shouldShowHelper) {
    return null
  }

  const setupSuperAdmin = () => {
    if (!address) return

    // Add to localStorage for immediate effect
    const adminConfig = {
      adminWallets: [address.toLowerCase()],
      setupComplete: true,
      createdAt: new Date()
    }
    localStorage.setItem('admin_config', JSON.stringify(adminConfig))

    // Create super admin profile
    const superAdminProfile = {
      address: address,
      displayName: 'Super Admin',
      bio: 'Platform super administrator',
      role: 'super_admin',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    localStorage.setItem(`web3_profile_${address.toLowerCase()}`, JSON.stringify(superAdminProfile))

    alert(`✅ Super admin setup complete for wallet: ${address}`)
    // Force context refresh by dispatching a custom event
    window.dispatchEvent(new CustomEvent('admin-setup-complete'))
    setTimeout(() => window.location.reload(), 500)
  }



  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-blue-800 mb-1">🛡️ Admin Setup Helper</h3>
          <p className="text-blue-700 text-sm">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        </div>
        <button
          onClick={() => setShowHelper(!showHelper)}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
        >
          {showHelper ? 'Hide' : 'Setup Admin'}
        </button>
      </div>
      
      {showHelper && (
        <div className="mt-4 pt-4 border-t border-blue-200">
          <p className="text-blue-700 text-sm mb-3">
            This will grant super admin access to your connected wallet address.
          </p>
          <div className="bg-blue-100 p-3 rounded mb-3">
            <p className="text-blue-800 text-xs font-mono break-all">
              Wallet: {address}
            </p>
          </div>
          <button
            onClick={setupSuperAdmin}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 mr-2"
          >
            ✅ Grant Super Admin Access
          </button>
          <button
            onClick={() => setShowHelper(false)}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  )
}