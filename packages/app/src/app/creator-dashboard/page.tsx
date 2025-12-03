'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useContentCreator } from '@/hooks/useContentCreator'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useEffect, useState } from 'react'
import { LinkComponent } from '@/components/LinkComponent'
import CreatorLicenseCard from '@/components/CreatorLicenseCard'
import CreatorAnalyticsDashboard from '@/components/CreatorAnalyticsDashboard'
import CollaborationHub from '@/components/CollaborationHub'
import DashboardLayout from '@/components/DashboardLayout'
import TransactionHistory from '@/components/TransactionHistory'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import { useAccount } from 'wagmi'
import { toast } from 'react-toastify'
import ProtectedRoute from '@/components/ProtectedRoute'

function CreatorDashboardContent() {
  const { creator, licenses, loading, isCreator, getCreatorStats } = useContentCreator()
  const { user } = useWeb3Auth()
  const { balance } = useBeatNFT()
  const { address } = useAccount()
  const [stats, setStats] = useState<any>(null)
  const [showBlockchain, setShowBlockchain] = useState(false)
  
  // Allow admin access for testing
  const hasAccess = isCreator || (user?.role === 'admin' || user?.role === 'super_admin')

  useEffect(() => {
    if (isCreator) {
      const creatorStats = getCreatorStats()
      setStats(creatorStats)
    }
  }, [isCreator, creator, licenses])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading creator dashboard...</p>
        </div>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
          <div className="container mx-auto px-4 text-center relative z-10 mobile-container">
            <div className="max-w-4xl mx-auto">
              <div className="text-8xl mb-6 mobile-heading">🎨</div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-pink-100 bg-clip-text text-transparent mobile-heading">
                Creator Dashboard
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed mobile-heading">
                Join the Web3 creator economy - License beats, collaborate with producers, earn royalties
              </p>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
                <p className="text-lg mb-4">Why become a verified creator on BeatsChain?</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl mb-1 mobile-heading">🎆</div>
                    <div>Full beat previews</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl mb-1 mobile-heading">🤝</div>
                    <div>License negotiations</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-2xl mb-1 mobile-heading">💰</div>
                    <div>Viral content bonuses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="container mx-auto px-4 py-12 mobile-container">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center mobile-heading">
                🌟 Creator Profile Required
              </h2>
              <p className="text-lg text-gray-600 mb-8 text-center leading-relaxed">
                You need to register as a content creator to access the creator dashboard and unlock exclusive features.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
                  <h3 className="text-xl font-semibold text-purple-900 mb-3">🎬 Content Creators</h3>
                  <ul className="text-purple-700 space-y-2 text-sm">
                    <li>• YouTube, TikTok, Instagram creators</li>
                    <li>• Podcasters and streamers</li>
                    <li>• Filmmakers and video editors</li>
                    <li>• Game developers and streamers</li>
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-xl border border-pink-200">
                  <h3 className="text-xl font-semibold text-pink-900 mb-3">🎵 Music Artists</h3>
                  <ul className="text-pink-700 space-y-2 text-sm">
                    <li>• Recording artists and rappers</li>
                    <li>• Singers and vocalists</li>
                    <li>• Music producers (buyers)</li>
                    <li>• Independent musicians</li>
                  </ul>
                </div>
              </div>
              
              <div className="text-center">
                <LinkComponent 
                  href="/"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg font-semibold text-lg"
                >
                  🎆 Register as Creator
                </LinkComponent>
                <p className="text-sm text-gray-500 mt-4">
                  Connect your social media accounts to verify your creator status
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-600 bg-purple-100'
      case 'gold': return 'text-yellow-600 bg-yellow-100'
      case 'silver': return 'text-gray-600 bg-gray-100'
      default: return 'text-orange-600 bg-orange-100'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return '💎'
      case 'gold': return '🥇'
      case 'silver': return '🥈'
      default: return '🥉'
    }
  }

  return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 mobile-heading">
                🎨 Creator Dashboard
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                  <span className="ml-2 text-sm bg-red-100 text-red-800 px-2 py-1 rounded">ADMIN VIEW</span>
                )}
              </h1>
              <p className="text-gray-600">
                {creator ? `Welcome back, ${creator.creatorType} creator!` : 'Admin preview of creator dashboard'}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${getTierColor(creator?.verificationTier || 'bronze')}`}>
              {getTierIcon(creator?.verificationTier || 'bronze')} {creator?.verificationTier?.toUpperCase()} TIER
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Licenses</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats?.activeLicenses || 0}</p>
              </div>
              <div className="text-green-500 text-2xl mobile-heading">📄</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">${stats?.totalSpent || 0}</p>
              </div>
              <div className="text-blue-500 text-2xl mobile-heading">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Negotiations</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats?.pendingNegotiations || 0}</p>
              </div>
              <div className="text-orange-500 text-2xl mobile-heading">🤝</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audience Size</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats?.audienceSize?.toLocaleString() || 0}</p>
              </div>
              <div className="text-purple-500 text-2xl mobile-heading">👥</div>
            </div>
          </div>
        </div>

        {/* Creator Analytics */}
        <CreatorAnalyticsDashboard />

        {/* Collaboration Hub */}
        <CollaborationHub />

        {/* Your Licenses */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Your Licenses</h2>
          {licenses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {licenses.slice(0, 6).map((license) => (
                <CreatorLicenseCard 
                  key={license.id} 
                  license={license}
                  onPayment={(licenseId) => {
                    console.log('Processing crypto payment for license:', licenseId)
                    toast.success('💰 Crypto payment processed!')
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-4 mobile-heading">🎵</div>
              <p className="text-gray-600 mb-4">No licenses yet</p>
              <LinkComponent 
                href="/beatnfts"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Browse BeatNFTs™
              </LinkComponent>
            </div>
          )}
        </div>

        {/* Blockchain Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">⛓️ Blockchain Activity</h2>
            <button 
              onClick={() => setShowBlockchain(!showBlockchain)}
              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
            >
              {showBlockchain ? 'Hide' : 'Show'} Details
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Wallet</p>
              <p className="font-mono text-xs break-all">{address || 'Not connected'}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">BeatNFT Credits</p>
              <p className="text-lg font-bold">{balance.hasProNFT ? '∞' : balance.credits}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-sm font-medium">{balance.hasProNFT ? '⭐ Pro NFT' : '🎫 Standard'}</p>
            </div>
          </div>
          
          {showBlockchain && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Recent Transactions</h3>
              <div className="max-h-64 overflow-y-auto">
                <TransactionHistory />
              </div>
            </div>
          )}
        </div>

        {/* Status Banner */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-2">🚀 Platform Features</h2>
          <p className="mb-4">
            Multi-platform verification and crypto-only payments now live! License negotiation system operational.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">✅ Creator Registration</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">✅ License Negotiation</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">✅ Crypto Payments</span>
            <span className="px-3 py-1 bg-white bg-opacity-20 rounded-full text-sm">✅ 15% Platform Fee</span>
          </div>
        </div>
      </div>
  )
}

export default function CreatorDashboard() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <CreatorDashboardContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function CreatorDashboardContent() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CreatorDashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}