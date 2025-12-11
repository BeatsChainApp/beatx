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
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-green-800 mb-2">✅ RECOMMENDED: Email Authentication</h3>
              <p className="text-sm text-green-700 mb-3">
                Sign in with <strong>info@unamifoundation.org</strong> for instant admin access
              </p>
              <ConnectButton 
                client={client}
                wallets={[inAppWallet({ auth: { providers: ["google"] } })]}
                connectButton={{
                  label: "🔐 Sign in with Google (Recommended)",
                  className: "w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors"
                }}
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">🔄 Alternative: Import Wallet</h3>
              <p className="text-sm text-blue-700 mb-3">
                Import your existing wallet with the super admin private key
              </p>
              <ConnectButton 
                client={client}
                connectButton={{
                  label: "💼 Connect External Wallet",
                  className: "w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
                }}
              />
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