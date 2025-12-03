'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import ProtectedRoute from '@/components/ProtectedRoute'
import { SUBSCRIPTION_PLANS } from '@/types/subscription'
import { BackToDashboard } from '@/components/BackToDashboard'
import BuyBeatNFTModal from '@/components/BuyBeatNFTModal'

function ManageSubscriptionContent() {
  const { user } = useUnifiedAuth()
  const { balance, loading: balanceLoading } = useBeatNFT()
  const [currentPlan, setCurrentPlan] = useState('free')
  const [showBuyModal, setShowBuyModal] = useState(false)
  const [uploadsThisMonth, setUploadsThisMonth] = useState(0)

  useEffect(() => {
    // Determine current plan based on balance
    if (balance.hasProNFT) {
      setCurrentPlan('pro-nft')
    } else {
      setCurrentPlan('free')
    }
    
    // Calculate uploads this month (mock for now)
    setUploadsThisMonth(balance.totalUsed)
  }, [balance])

  const handleUpgrade = (planId: string) => {
    if (planId === 'free') {
      alert('You are already on the free tier!')
    } else if (planId === 'pro-nft') {
      setShowBuyModal(true)
    } else {
      setShowBuyModal(true)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        color: 'white',
        padding: '4rem 2rem',
        marginBottom: '2rem'
      }}>
        <div className="container mx-auto mobile-container">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 mobile-heading">🎫 BeatNFT Credits</h1>
            <p className="text-xl opacity-90 mb-6">Web3-native upload system using BeatNFT tokens</p>
            <div className="flex justify-center gap-4 text-sm">
              <div className="bg-white/10 px-4 py-2 rounded-full">
                🎁 10 Free Credits
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-full">
                💰 Buy More Credits
              </div>
              <div className="bg-white/10 px-4 py-2 rounded-full">
                ⚡ Full Web3 System
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8 mobile-container">
        <BackToDashboard />

      <div className={`border rounded-lg p-6 mb-8 ${
        balance.hasProNFT 
          ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`text-xl font-semibold ${
              balance.hasProNFT ? 'text-purple-900' : 'text-blue-900'
            }`}>
              Current Tier: {balance.hasProNFT ? 'Pro BeatNFT (Unlimited)' : `Free (${balance.credits + balance.totalUsed} BeatNFTs)`}
            </h2>
            <p className={balance.hasProNFT ? 'text-purple-700' : 'text-blue-700'}>
              {balance.hasProNFT 
                ? 'Unlimited uploads forever!' 
                : `You have ${balance.credits} upload credits remaining`
              }
            </p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${
              balance.hasProNFT ? 'text-purple-900' : 'text-blue-900'
            }`}>
              {balance.hasProNFT ? '♾️' : `🎫 ${balance.credits}`}
            </div>
            <div className={`text-sm ${
              balance.hasProNFT ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {balance.hasProNFT ? 'unlimited' : 'credits left'}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div 
            key={plan.id} 
            className={`bg-white rounded-lg shadow-lg p-6 ${
              plan.id === 'pro-nft' ? 'ring-2 ring-purple-500 relative' : ''
            }`}
          >
            {plan.id === 'pro-nft' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  ♾️ Web3 Native
                </span>
              </div>
            )}
            
            <div className="text-center mb-6">
              <div className="text-4xl mb-3 mobile-heading">
                {plan.id === 'free' ? '🎁' : '♾️'}
              </div>
              <h3 className="text-2xl font-bold mb-2 mobile-heading">{plan.name}</h3>
              <div className="text-3xl font-bold text-gray-900 mb-2 mobile-heading">
                {plan.id === 'free' ? (
                  <span>Free</span>
                ) : (
                  <>
                    {plan.price} ETH
                    <div className="text-sm text-gray-500 font-normal">
                      (~R{Math.round(plan.price * 18000).toLocaleString()} once-off)
                    </div>
                  </>
                )}
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={plan.id === currentPlan}
              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                plan.id === currentPlan
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : plan.id === 'pro-nft'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                  : 'bg-gray-900 text-white hover:bg-gray-800'
              }`}
            >
              {plan.id === currentPlan ? 'Current Tier' : 
               plan.id === 'free' ? 'Get Started' : 'Upgrade to Pro BeatNFT'}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">BeatNFT Credit Usage</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Credits Remaining</span>
              <span className="text-sm text-gray-500">
                {balance.hasProNFT ? '∞' : `${balance.credits} / ${balance.credits + balance.totalUsed}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={balance.hasProNFT ? 'bg-purple-600' : 'bg-blue-600'} 
                style={{ 
                  width: balance.hasProNFT 
                    ? '100%' 
                    : `${Math.max(10, (balance.credits / (balance.credits + balance.totalUsed)) * 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {balance.hasProNFT ? '♾️ Unlimited Credits' : '🎫 BeatNFT Credits'}
            </p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Uploads This Month</span>
              <span className="text-sm text-gray-500">{uploadsThisMonth} uploads</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${Math.min(100, (uploadsThisMonth / 10) * 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Various file types</p>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Total Credits Used</span>
              <span className="text-sm text-gray-500">{balance.totalUsed} credits</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ 
                  width: `${Math.min(100, (balance.totalUsed / (balance.credits + balance.totalUsed || 1)) * 100)}%` 
                }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Since joining platform</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Credit System Guide:</h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• MP3 uploads: 1 BeatNFT credit</p>
            <p>• WAV uploads: 2 BeatNFT credits</p>
            <p>• ZIP (stems): 3-5 BeatNFT credits</p>
            <p>• Pro BeatNFT: Unlimited uploads (all formats)</p>
          </div>
        </div>
      </div>
      </div>
      
      {/* Buy Credits Modal */}
      <BuyBeatNFTModal 
        isOpen={showBuyModal} 
        onClose={() => setShowBuyModal(false)} 
      />
    </div>
  )
}

export default function ManageSubscriptionPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["user","producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <ManageSubscriptionPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ManageSubscriptionPageContent() {
  return (
    <ProtectedRoute requireWallet={true}>
      <ManageSubscriptionContent />
    </ProtectedRoute>
  )
}