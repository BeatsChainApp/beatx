'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount, useDisconnect } from 'thirdweb/react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'
import { inAppWallet, createWallet } from 'thirdweb/wallets'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

const SUPER_ADMIN_WALLET = '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
const ADMIN_EMAIL = 'info@unamifoundation.org'

export default function AdminWalletManager() {
  const [showManager, setShowManager] = useState(false)
  const [verificationStatus, setVerificationStatus] = useState<'checking' | 'verified' | 'failed' | 'mismatch'>('checking')
  const { user, isAuthenticated } = useUnifiedAuth()
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  
  useEffect(() => {
    if (isAuthenticated && user) {
      checkWalletStatus()
    }
  }, [isAuthenticated, user, account?.address])

  const checkWalletStatus = async () => {
    if (!account?.address) {
      setVerificationStatus('failed')
      return
    }

    const currentWallet = account.address.toLowerCase()
    const expectedWallet = SUPER_ADMIN_WALLET.toLowerCase()
    
    console.log('🔍 WALLET CHECK:', {
      current: currentWallet,
      expected: expectedWallet,
      match: currentWallet === expectedWallet,
      email: user?.email,
      role: user?.role
    })

    if (currentWallet === expectedWallet) {
      setVerificationStatus('verified')
      setShowManager(false)
    } else if (user?.email === ADMIN_EMAIL) {
      setVerificationStatus('verified') // Email auth is sufficient
      setShowManager(false)
    } else {
      setVerificationStatus('mismatch')
      setShowManager(true)
    }
  }

  const handleWalletSwitch = async () => {
    try {
      // Disconnect current wallet
      await disconnect()
      
      // Show connection options
      setVerificationStatus('checking')
      
      // Wait for new connection
      setTimeout(() => {
        checkWalletStatus()
      }, 2000)
    } catch (error) {
      console.error('Wallet switch failed:', error)
      setVerificationStatus('failed')
    }
  }

  if (!showManager && verificationStatus === 'verified') {
    return (
      <div className="fixed top-4 right-4 bg-green-50 border border-green-200 rounded-lg p-3 shadow-lg z-50">
        <div className="flex items-center gap-2">
          <div className="text-green-600">✅</div>
          <div className="text-sm">
            <div className="font-medium text-green-800">Admin Access Verified</div>
            <div className="text-green-600">
              {user?.email === ADMIN_EMAIL ? 'Email Auth' : 'Wallet Auth'}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!showManager) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Wallet Mismatch Detected</h2>
          <p className="text-gray-600">
            You need to connect with the correct admin wallet or email to access admin features.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">Current Connection:</h3>
            <div className="text-sm text-red-700 space-y-1">
              <p><strong>Wallet:</strong> {account?.address?.slice(0, 10)}...{account?.address?.slice(-8)}</p>
              <p><strong>Email:</strong> {user?.email || 'None'}</p>
              <p><strong>Role:</strong> {user?.role || 'user'}</p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Required for Admin Access:</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Admin Email:</strong> {ADMIN_EMAIL}</p>
              <p><strong>OR Super Admin Wallet:</strong></p>
              <p className="font-mono text-xs break-all">{SUPER_ADMIN_WALLET}</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ConnectButton 
            client={client}
            wallets={[inAppWallet({ auth: { providers: ["google", "email"] } })]}
            connectButton={{
              label: "🔐 Connect with Admin Email",
              className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            }}
          />
          
          <button
            onClick={handleWalletSwitch}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors"
          >
            🔄 Switch to Super Admin Wallet
          </button>
          
          <button
            onClick={() => setShowManager(false)}
            className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Continue with Limited Access
          </button>
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-700">
            <strong>Troubleshooting:</strong> If you have the correct credentials but still see this message, 
            check the browser console for wallet verification logs.
          </p>
        </div>
      </div>
    </div>
  )
}