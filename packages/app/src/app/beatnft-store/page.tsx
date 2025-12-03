'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState } from 'react'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function BeatNFTStorePage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BeatNFTStorePageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BeatNFTStorePageContent() {
  const { balance, buyCredits, upgradeToProNFT } = useBeatNFT()
  const [purchasing, setPurchasing] = useState(false)
  const [creditAmount, setCreditAmount] = useState(10)

  const creditPrice = 18 // R18 per credit
  const totalPrice = creditAmount * creditPrice
  const ethPrice = totalPrice / 36000 // Assuming 1 ETH = R36,000

  const handlePurchase = async () => {
    setPurchasing(true)
    await buyCredits(creditAmount)
    setPurchasing(false)
  }

  const handleProUpgrade = async () => {
    setPurchasing('pro')
    await upgradeToProNFT()
    setPurchasing(null)
  }

  return (
    <ProtectedRoute requireWallet={true}>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 mobile-heading">🎫 BeatNFT Store</h1>
          <p className="text-xl mb-6 opacity-90">
            Power your music with BeatNFT credits - Upload beats and grow your producer business
          </p>
          <div className="flex items-center justify-center space-x-8 text-sm opacity-80">
            <div className="flex items-center space-x-2">
              <span>🎵</span>
              <span>MP3: R18</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🎧</span>
              <span>WAV: R36</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>📦</span>
              <span>ZIP: R54</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">

          {/* Current Balance */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Your Balance</h2>
                <p className="text-gray-600">
                  {balance.hasProNFT ? '♾️ Unlimited uploads' : `${balance.credits} credits available`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600 mobile-heading">
                  {balance.hasProNFT ? 'PRO' : balance.credits}
                </div>
                <div className="text-sm text-gray-500">
                  {balance.hasProNFT ? 'Member' : 'Credits'}
                </div>
              </div>
            </div>
          </div>

          {/* Pro BeatNFT Upgrade */}
          {!balance.hasProNFT && (
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 mb-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">♾️ Upgrade to Pro BeatNFT</h3>
                  <p className="opacity-90 mb-4">Unlimited uploads, priority support, and exclusive features</p>
                  <ul className="text-sm opacity-80 space-y-1">
                    <li>✓ Unlimited beat uploads</li>
                    <li>✓ All file formats supported</li>
                    <li>✓ Priority customer support</li>
                    <li>✓ Advanced analytics</li>
                  </ul>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2 mobile-heading">0.1 ETH</div>
                  <div className="text-sm opacity-80">~R1,800</div>
                  <button
                    onClick={handleProUpgrade}
                    disabled={purchasing === 'pro'}
                    className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50"
                  >
                    {purchasing === 'pro' ? 'Upgrading...' : 'Upgrade Now'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Flexible Credit Purchase */}
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Buy Credits</h2>
                <p className="text-gray-600">Pay as you go - R18 per credit</p>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Credits
                  </label>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setCreditAmount(Math.max(10, creditAmount - 10))}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="10"
                      max="1000"
                      value={creditAmount}
                      onChange={(e) => setCreditAmount(Math.max(10, parseInt(e.target.value) || 10))}
                      className="flex-1 text-center text-2xl font-bold py-3 border border-gray-300 rounded-lg mobile-heading"
                    />
                    <button
                      onClick={() => setCreditAmount(Math.min(1000, creditAmount + 10))}
                      className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-center mt-2 text-sm text-gray-500">
                    Minimum: 10 credits • Maximum: 1,000 credits
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">{creditAmount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Price per credit:</span>
                    <span className="font-medium">R{creditPrice}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total:</span>
                      <div className="text-right">
                        <div className="font-bold text-xl text-blue-600">R{totalPrice}</div>
                        <div className="text-sm text-gray-500">{ethPrice.toFixed(4)} ETH</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-gray-600 space-y-1">
                  <div>• {Math.floor(creditAmount / 1)} MP3 uploads</div>
                  <div>• {Math.floor(creditAmount / 2)} WAV uploads</div>
                  <div>• {Math.floor(creditAmount / 3)} ZIP uploads</div>
                </div>

                <button
                  onClick={handlePurchase}
                  disabled={purchasing}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {purchasing ? 'Purchasing...' : `Buy ${creditAmount} Credits`}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Purchase Options */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">Quick purchase options:</p>
            <div className="flex justify-center space-x-4">
              {[25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => setCreditAmount(amount)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
                >
                  {amount} credits (R{amount * 18})
                </button>
              ))}
            </div>
          </div>

          {/* Usage Guide */}
          <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">How Credits Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
              <div>
                <div className="font-medium text-gray-900 mb-2">🎵 MP3 Files</div>
                <div>1 credit per upload (R18)</div>
                <div>Perfect for demos and previews</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-2">🎧 WAV Files</div>
                <div>2 credits per upload (R36)</div>
                <div>High quality for professional use</div>
              </div>
              <div>
                <div className="font-medium text-gray-900 mb-2">📦 ZIP Files</div>
                <div>3 credits per upload (R54)</div>
                <div>Full stems and project files</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}