'use client'

import { thirdwebClient, walletConfig } from '@/lib/thirdweb-config'
import { useState } from 'react'

export default function ThirdwebWalletConnect() {
  const [account, setAccount] = useState(null)
  const [connecting, setConnecting] = useState(false)

  const connectGoogle = async () => {
    setConnecting(true)
    try {
      const connectedAccount = await walletConfig.inApp.connect({
        client: thirdwebClient,
        strategy: "google",
      })
      setAccount(connectedAccount)
      console.log("Connected as:", connectedAccount?.address)
    } catch (error) {
      console.error("Connection failed:", error)
    } finally {
      setConnecting(false)
    }
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm">Connected: {account.address?.slice(0, 6)}...{account.address?.slice(-4)}</div>
        <button 
          onClick={() => setAccount(null)}
          className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={connectGoogle}
      disabled={connecting}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {connecting ? 'Connecting...' : 'Sign in with Google'}
    </button>
  )
}