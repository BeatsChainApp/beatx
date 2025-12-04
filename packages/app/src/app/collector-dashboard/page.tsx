'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import { useActiveAccount } from "thirdweb/react"
import DashboardLayout from '@/components/DashboardLayout'
import TransactionHistory from '@/components/TransactionHistory'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'

function CollectorDashboardContent() {
  const { user } = useUnifiedAuth()
  const { balance } = useBeatNFT()
  const account = useActiveAccount(); const address = account?.address
  const [collection, setCollection] = useState<any[]>([])
  const [portfolioValue, setPortfolioValue] = useState(0)
  const [stats, setStats] = useState({
    totalNFTs: 0,
    totalValue: 0,
    totalSpent: 0,
    avgPrice: 0,
    rareItems: 0
  })

  useEffect(() => {
    // Load user's NFT collection from localStorage
    if (address) {
      const userPurchases = JSON.parse(localStorage.getItem(`user_purchases_${address}`) || '[]')
      const nftCollection = userPurchases.filter((purchase: any) => purchase.licenseType === 'exclusive')
      
      setCollection(nftCollection)
      
      const totalValue = nftCollection.reduce((sum: number, nft: any) => sum + (nft.amount || 0), 0)
      const totalSpent = nftCollection.reduce((sum: number, nft: any) => sum + (nft.amount || 0), 0)
      
      setStats({
        totalNFTs: nftCollection.length,
        totalValue: totalValue * 1.2, // Simulate appreciation
        totalSpent,
        avgPrice: nftCollection.length > 0 ? totalSpent / nftCollection.length : 0,
        rareItems: nftCollection.filter((nft: any) => nft.amount > 0.1).length
      })
      
      setPortfolioValue(totalValue * 1.2)
    }
  }, [address])

  return (
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">🖼️ NFT Collector Dashboard</h1>
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2 mobile-heading">Welcome, Collector!</h2>
          <p className="opacity-90 mb-4">Manage your BeatNFT collection and track portfolio performance</p>
          <div className="flex gap-4 text-sm">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              🖼️ {stats.totalNFTs} NFTs Owned
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              💎 {stats.rareItems} Rare Items
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              {balance.hasProNFT ? '⭐ Pro Collector' : '🎫 Standard'}
            </div>
          </div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Portfolio Value</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{portfolioValue.toFixed(3)} ETH</p>
                <p className="text-xs text-green-600">+20% unrealized</p>
              </div>
              <div className="text-green-500 text-2xl mobile-heading">📈</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total NFTs</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalNFTs}</p>
              </div>
              <div className="text-purple-500 text-2xl mobile-heading">🖼️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalSpent.toFixed(3)} ETH</p>
              </div>
              <div className="text-blue-500 text-2xl mobile-heading">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.avgPrice.toFixed(3)} ETH</p>
              </div>
              <div className="text-orange-500 text-2xl mobile-heading">📊</div>
            </div>
          </div>
        </div>

        {/* NFT Collection */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your NFT Collection</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                View Gallery
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                Export Collection
              </button>
            </div>
          </div>
          
          {collection.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collection.slice(0, 6).map((nft, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="bg-gradient-to-br from-purple-100 to-pink-100 h-32 rounded-lg mb-3 flex items-center justify-center">
                    <span className="text-2xl mobile-heading">🎵</span>
                  </div>
                  <h3 className="font-medium mb-1">BeatNFT #{nft.beatId}</h3>
                  <p className="text-sm text-gray-600 mb-2">{nft.licenseType} License</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{nft.amount?.toFixed(3)} ETH</span>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Owned</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 mobile-heading">🖼️</div>
              <h3 className="text-xl font-semibold mb-2">No NFTs in Collection</h3>
              <p className="text-gray-600 mb-6">Start collecting exclusive BeatNFTs to build your portfolio</p>
              <LinkComponent 
                href="/browse"
                className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Browse BeatNFTs
              </LinkComponent>
            </div>
          )}
        </div>

        {/* Market Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Market Trends</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Hip Hop Beats</span>
                <span className="text-sm text-green-600">+15%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Amapiano</span>
                <span className="text-sm text-green-600">+8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Trap</span>
                <span className="text-sm text-red-600">-3%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Electronic</span>
                <span className="text-sm text-green-600">+12%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-xs">✓</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Purchased BeatNFT #1234</p>
                  <p className="text-xs text-gray-500">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-xs">📈</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Portfolio value increased</p>
                  <p className="text-xs text-gray-500">1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Transaction History</h3>
          <TransactionHistory />
        </div>
      </div>
  )
}

export default function CollectorDashboard() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["user","producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <CollectorDashboardContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}