'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { ConnectButton, useConnect } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'
import { inAppWallet } from 'thirdweb/wallets'
import AdminWalletManager from '@/components/AdminWalletManager'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

export default function AdminSetupPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="admin">
        <AdminSetupPageContent />
        <AdminWalletManager />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminSetupPageContent() {
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useUnifiedAuth()
  const router = useRouter()
  
  // Thirdweb handles authentication internally
  
  // If already authenticated as admin, redirect
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      router.push('/admin')
    }
  }, [isAuthenticated, user, router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🛡️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Setup</h1>
            <p className="text-gray-600">Sign in with admin email to access admin panel</p>
          </div>
          
          <div className="space-y-4">
            <ConnectButton 
              client={client}
              wallets={[inAppWallet({ auth: { providers: ["google", "email"] } })]}
              connectButton={{
                label: "🔐 Sign in with Google or Email",
                className: "w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors"
              }}
            />
            <div className="text-xs text-gray-500 text-center">
              Uses Thirdweb embedded wallet with Google OAuth
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Admin Access:</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p><strong>Email:</strong> info@unamifoundation.org</p>
              <p><strong>Wallet:</strong> 0xc84799a904eeb5c57abbbc40176e7db8be202c10</p>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              Use Google sign-in with admin email or connect super admin wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}