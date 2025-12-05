'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

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
  requireWallet = false, // CHANGED: Default to false - email auth prioritized
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

  // PRIORITY: Check email authentication first
  if (!auth.isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-2xl font-bold mb-4">Email Authentication Required</h2>
          <p className="text-gray-600 mb-6">Please sign in with your email to continue</p>
          <div className="space-y-4">
            <ConnectButton client={client} />
            <p className="text-xs text-gray-400">Connect wallet to access admin features</p>
          </div>
        </div>
      </div>
    )
  }

  // SECONDARY: Check wallet connection only if specifically required AND user is authenticated
  if (requireWallet && auth.isAuthenticated && !auth.wallet.isConnected) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-6">👛</div>
          <h2 className="text-2xl font-bold mb-4">Wallet Connection Required</h2>
          <p className="text-gray-600 mb-6">Connect your wallet for blockchain features</p>
          <ConnectButton client={client} />
          <p className="text-xs text-gray-400 mt-4">Required for uploading and minting NFTs</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}