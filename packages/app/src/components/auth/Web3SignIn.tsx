'use client'

import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useSIWE } from '@/context/SIWEContext'

export default function Web3SignIn() {
  const [isConnecting, setIsConnecting] = useState(false)
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()
  const { user, signIn, signOut, loading, isAuthenticated } = useSIWE()

  const handleConnect = async () => {
    setIsConnecting(true)
    try {
      const connector = connectors[0] // Use first available connector
      if (connector) {
        connect({ connector })
      }
    } catch (error) {
      console.error('Connection failed:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSignIn = async () => {
    try {
      await signIn()
    } catch (error) {
      console.error('Sign in failed:', error)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    disconnect()
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {user.address.slice(2, 4).toUpperCase()}
            </span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900">
              {user.address.slice(0, 6)}...{user.address.slice(-4)}
            </p>
            <p className="text-xs text-gray-500">Connected</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Sign Out
        </button>
      </div>
    )
  }

  if (isConnected && address && !isAuthenticated) {
    return (
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          Wallet connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <button
          onClick={handleSignIn}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Signing...' : 'Sign In'}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  )
}