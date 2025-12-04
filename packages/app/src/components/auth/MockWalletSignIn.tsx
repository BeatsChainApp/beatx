'use client'

import { useMockAuth as useUnifiedAuth } from '@/context/MockAuthContext'
import { useActiveAccount } from "thirdweb/react"

export default function MockWalletSignIn() {
  const { user, updateProfile } = useUnifiedAuth()
  const { address, isConnected } = useAccount()

  const handleLinkWallet = async () => {
    if (address) {
      await updateProfile({ walletAddress: address })
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-600 mb-2">Connect your wallet to link it to your account</p>
        <p className="text-sm text-gray-500">Use the Connect button in the header first</p>
      </div>
    )
  }

  if (user?.walletAddress === address) {
    return (
      <div className="text-center p-4 bg-green-50 rounded-lg">
        <p className="text-green-700">✅ Wallet linked successfully</p>
        <p className="text-sm text-gray-600">{address}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-gray-700 mb-4">
          Link your wallet ({address?.slice(0, 6)}...{address?.slice(-4)}) to your account
        </p>
        
        <button
          onClick={handleLinkWallet}
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700"
        >
          Link Wallet
        </button>
        
        <p className="text-xs text-gray-500 mt-2">
          Mock wallet linking for development
        </p>
      </div>
    </div>
  )
}