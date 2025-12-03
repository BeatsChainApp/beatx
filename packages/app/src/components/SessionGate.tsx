'use client'

import { ReactNode, useEffect, useState } from 'react'
import { createWalletAdapter, WalletAdapter } from '@/lib/walletAdapter'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface SessionGateProps {
  children: ReactNode
  requireWallet?: boolean
  fallback?: ReactNode
}

export default function SessionGate({ 
  children, 
  requireWallet = true, 
  fallback 
}: SessionGateProps) {
  const [walletAdapter, setWalletAdapter] = useState<WalletAdapter | null>(null)
  const [walletReady, setWalletReady] = useState(false)
  const [mounted, setMounted] = useState(false)
  const auth = useUnifiedAuth()

  useEffect(() => {
    setMounted(true)
    const adapter = createWalletAdapter()
    setWalletAdapter(adapter)

    adapter.onChange((address) => {
      setWalletReady(!!address)
    })

    // Initialize wallet if needed
    if (requireWallet) {
      adapter.initWallet().catch(console.error)
    }
  }, [requireWallet])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-600">Initializing...</p>
        </div>
      </div>
    )
  }

  // Check authentication first
  if (!auth.isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to continue</p>
          <w3m-button size="md" />
        </div>
      </div>
    )
  }

  // Check wallet connection if required
  if (requireWallet && !walletReady) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">👛</div>
          <h2 className="text-2xl font-bold mb-4">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">Connect your wallet to access this feature</p>
          <button 
            onClick={() => walletAdapter?.initWallet()}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}