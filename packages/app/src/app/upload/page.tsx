'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { Suspense } from 'react'
import EnhancedBeatUpload from '@/components/EnhancedBeatUpload'
import SessionGate from '@/components/SessionGate'

export const dynamic = 'force-dynamic'

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 mobile-heading">🎵</div>
        <p className="text-gray-600">Loading upload page...</p>
      </div>
    </div>
  )
}

function UploadFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
        <div className="container mx-auto px-4 text-center mobile-container">
          <div className="text-8xl mb-6 mobile-heading">🎵</div>
          <h1 className="text-5xl font-bold mb-4 mobile-heading">Upload Your Beats</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Transform your music into professional NFTs with ISRC codes and blockchain verification
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16 mobile-container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-3xl font-bold mb-6 text-center mobile-heading">Professional Beat Upload System</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl mb-4 mobile-heading">🏷️</div>
                <h3 className="text-xl font-bold mb-2">ISRC Generation</h3>
                <p className="text-gray-600">Professional ISRC codes for global distribution and royalty tracking</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl mb-4 mobile-heading">💎</div>
                <h3 className="text-xl font-bold mb-2">NFT Minting</h3>
                <p className="text-gray-600">Mint your beats as NFTs with comprehensive metadata and ownership proof</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-lg">
                <div className="text-4xl mb-4 mobile-heading">💰</div>
                <h3 className="text-xl font-bold mb-2">Instant Royalties</h3>
                <p className="text-gray-600">Automatic royalty distribution on every sale and resale</p>
              </div>
            </div>
            <div className="text-center">
              <ConnectButton client={client} />
              <p className="mt-4 text-gray-500">Connect your wallet to start uploading beats</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function UploadPage() {
  return (
    <UniversalLayout requireAuth={true} requireWallet={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="upload">
        <UploadPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function UploadPageContent() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SessionGate requireWallet={true} fallback={<UploadFallback />}>
        <EnhancedBeatUpload />
      </SessionGate>
    </Suspense>
  )
}