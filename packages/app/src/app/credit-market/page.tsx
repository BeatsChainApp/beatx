'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useBeatNFTCreditTrading } from '@/hooks/useBeatNFTCreditTrading'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import CreditTradingModal from '@/components/CreditTradingModal'
import SocialShare from '@/components/SocialShare'

export default function CreditMarket() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["user","producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <CreditMarketContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function CreditMarketContent() {
  const { balance } = useBeatNFT()
  const { listings, loadMarketListings } = useBeatNFTCreditTrading()
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'buy' | 'sell' | 'gift'>('buy')

  useEffect(() => {
    loadMarketListings()
  }, [loadMarketListings])

  const openModal = (mode: 'buy' | 'sell' | 'gift') => {
    setModalMode(mode)
    setShowModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10 mobile-container">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent mobile-heading">
              💎 BeatNFT Credit Market
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed mobile-heading">
              The world's first peer-to-peer marketplace for beat upload credits
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <p className="text-lg mb-4">Why pay platform prices when you can trade with the community?</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">💰</div>
                  <div>Save 11-33% vs platform</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">⚡</div>
                  <div>Instant P2P trading</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">🌍</div>
                  <div>24/7 global market</div>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-4 mb-8">
              <div className="bg-gradient-to-br from-green-400/20 to-green-600/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-green-300/30">
                <span className="text-3xl font-bold text-green-100 mobile-heading">$1.20-1.60</span>
                <p className="text-sm opacity-80">Per Credit (vs $1.80 platform)</p>
              </div>
              <div className="bg-gradient-to-br from-blue-400/20 to-blue-600/20 backdrop-blur-sm px-6 py-4 rounded-xl border border-blue-300/30">
                <span className="text-3xl font-bold text-blue-100 mobile-heading">5%</span>
                <p className="text-sm opacity-80">Trading Fee Only</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-lg">
                🛒 Start Trading
              </button>
              <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all border border-white/30">
                📊 View Market
              </button>
            </div>
            <SocialShare 
              url="https://beatschain.app/credit-market"
              title="Save money on BeatNFT credits through peer-to-peer trading"
              hashtags={['BeatNFT', 'Web3Music', 'BeatsChain']}
            />
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mobile-container">

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-green-600 mobile-heading">{listings?.length || 0}</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-blue-600 mobile-heading">{balance?.credits || 0}</div>
            <div className="text-sm text-gray-600">Your Credits</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-purple-600 mobile-heading">33%</div>
            <div className="text-sm text-gray-600">Max Savings</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm text-center">
            <div className="text-2xl font-bold text-orange-600 mobile-heading">24/7</div>
            <div className="text-sm text-gray-600">Trading</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => openModal('buy')}
            className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors"
          >
            <div className="text-2xl mb-2 mobile-heading">🛒</div>
            <div className="font-medium">Buy Credits</div>
            <div className="text-sm opacity-90">Save up to 33%</div>
          </button>

          <button
            onClick={() => openModal('sell')}
            className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="text-2xl mb-2 mobile-heading">🏪</div>
            <div className="font-medium">Sell Credits</div>
            <div className="text-sm opacity-90">Monetize unused credits</div>
          </button>

          <button
            onClick={() => openModal('gift')}
            className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <div className="text-2xl mb-2 mobile-heading">🎁</div>
            <div className="font-medium">Gift Credits</div>
            <div className="text-sm opacity-90">Share with friends</div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current Market</h2>
          </div>
          <div className="p-6">
            {!listings || listings.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4 mobile-heading">🏪</div>
                <p className="text-gray-600 mb-2">No credits for sale</p>
                <p className="text-sm text-gray-500">Be the first to list credits!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings?.map((listing) => (
                  <div key={listing.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-medium text-lg">{listing.credits} credits</p>
                        <p className="text-sm text-gray-600">${listing.pricePerCredit}/credit</p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Save {((1.8 - listing.pricePerCredit) / 1.8 * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="font-bold text-xl">${listing.totalPrice.toFixed(2)}</p>
                      <button
                        onClick={() => openModal('buy')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <CreditTradingModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
    </div>
  )
}