'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import { useState, useEffect } from 'react'
import { Beat } from '@/types'
import { useWeb3Auth } from '@/hooks/useWeb3Auth'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'
import { useActiveAccount } from 'thirdweb/react'
import { getEthExchangeRate, getCurrencySymbol } from '@/utils/currency'

interface PurchaseModalProps {
  beat: Beat
  isOpen: boolean
  onClose: () => void
  onPurchaseComplete: (beatId: string, licenseType: string) => void
}

interface License {
  type: string
  name: string
  price: number
  originalPrice?: number
  popular?: boolean
  features: string[]
  description: string
  downloads: string[]
  usage: string[]
  limitations?: string[]
}

export default function PurchaseModal({ 
  beat, 
  isOpen, 
  onClose, 
  onPurchaseComplete 
}: PurchaseModalProps) {
  const { user, isAuthenticated } = useWeb3Auth()
  const account = useActiveAccount()
  const address = account?.address
  const isConnected = !!account
  const [selectedLicense, setSelectedLicense] = useState('premium')
  const [processing, setProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('crypto')
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [currency] = useState('ZAR')
  const { success, error } = useEnhancedToast()
  
  // Fetch exchange rate on component mount
  useEffect(() => {
    async function fetchExchangeRate() {
      try {
        const rate = await getEthExchangeRate(currency)
        setExchangeRate(rate)
      } catch (error) {
        console.error('Failed to fetch exchange rate:', error)
        // Use fallback rate
        setExchangeRate(18000) // Fallback: 1 ETH ≈ R18,000
      }
    }
    
    fetchExchangeRate()
  }, [currency])

  const licenses: License[] = [
    {
      type: 'basic',
      name: 'Basic License',
      price: beat.price * 0.8,
      originalPrice: beat.price,
      features: ['MP3 Download (320kbps)', 'Non-exclusive rights', 'Personal use only'],
      description: 'Perfect for personal projects and demos',
      downloads: ['MP3 (320kbps)'],
      usage: ['Personal use', 'Demos', 'Non-commercial projects'],
      limitations: ['No commercial use', 'No radio play', 'No streaming platforms']
    },
    {
      type: 'premium',
      name: 'Premium License',
      price: beat.price,
      popular: true,
      features: ['WAV + MP3 Downloads', 'Non-exclusive rights', 'Commercial use', 'Up to 100K streams'],
      description: 'Most popular choice for artists and content creators',
      downloads: ['WAV (24-bit)', 'MP3 (320kbps)', 'Tagged versions'],
      usage: ['Commercial use', 'Streaming platforms', 'Radio play', 'Music videos', 'Live performances'],
      limitations: ['Up to 100,000 streams/plays', 'Credit required']
    },
    {
      type: 'exclusive',
      name: 'Exclusive License',
      price: beat.price * 8,
      features: ['Full exclusive rights', 'WAV + Stems', 'Unlimited usage', 'Producer credit removal'],
      description: 'Complete ownership and unlimited commercial rights',
      downloads: ['WAV (24-bit)', 'MP3 (320kbps)', 'Trackout/Stems', 'MIDI files (if available)'],
      usage: ['Unlimited streams/sales', 'Full commercial rights', 'Sync licensing', 'Resale rights'],
      limitations: []
    }
  ]

  const selectedLicenseData = licenses.find(l => l.type === selectedLicense) || licenses[1]

  const formatPrice = (ethPrice: number) => {
    return `${ethPrice.toFixed(4)} ETH`
  }
  
  const formatPriceWithFiat = (ethPrice: number) => {
    if (!exchangeRate) return formatPrice(ethPrice)
    
    const fiatPrice = ethPrice * exchangeRate
    const symbol = getCurrencySymbol(currency)
    return `${ethPrice.toFixed(4)} ETH (~${symbol}${fiatPrice.toLocaleString()})`
  }

  const handlePurchase = async () => {
    // Check wallet connection for crypto payments only if using crypto
    if (paymentMethod === 'crypto' && !isConnected) {
      error('Please connect your wallet to purchase with crypto', { 
        throttleKey: 'wallet-required',
        throttleMs: 10000
      })
      return
    }

    setProcessing(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // In a real app, this would integrate with payment processors
      // like Stripe, PayFast, or PayPal for fiat
      // or smart contracts for crypto
      
      onPurchaseComplete(beat.id, selectedLicense)
      success(`Beat purchased successfully with ${selectedLicenseData.name}!`, { 
        throttleKey: `purchase-success-${beat.id}`,
        throttleMs: 5000
      })
      
    } catch (purchaseError) {
      error('Purchase failed. Please try again.', { 
        throttleKey: `purchase-error-${beat.id}`,
        throttleMs: 5000
      })
    } finally {
      setProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-xl">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white overflow-hidden">
                {beat.coverImageUrl ? (
                  <img
                    src={beat.coverImageUrl}
                    alt={beat.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">🎵</span>
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{beat.title}</h2>
                <p className="text-gray-600">{beat.genre} • {beat.bpm} BPM • {beat.key}</p>
                <div className="flex gap-2 mt-1">
                  {beat.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* License Selection */}
            <div className="lg:col-span-2">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Choose Your License</h3>
              
              <div className="space-y-4">
                {licenses.map((license) => (
                  <div
                    key={license.type}
                    className={`relative border rounded-xl p-6 cursor-pointer transition-all ${
                      selectedLicense === license.type
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                    onClick={() => setSelectedLicense(license.type)}
                  >
                    {license.popular && (
                      <div className="absolute -top-3 left-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedLicense === license.type
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-300'
                          }`}>
                            {selectedLicense === license.type && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900">{license.name}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{license.description}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <div className="text-xl font-bold text-gray-900">
                          {formatPrice(license.price)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {exchangeRate ? 
                            `~${getCurrencySymbol(currency)}${(license.price * exchangeRate).toLocaleString()}` : 
                            'Loading...'}
                        </div>
                        {license.originalPrice && license.originalPrice > license.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatPrice(license.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Downloads Include:</h5>
                        <ul className="space-y-1">
                          {license.downloads.map((download, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {download}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-gray-900 mb-2">Usage Rights:</h5>
                        <ul className="space-y-1">
                          {license.usage.map((usage, index) => (
                            <li key={index} className="flex items-center gap-2 text-gray-600">
                              <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              {usage}
                            </li>
                          ))}
                        </ul>
                        
                        {license.limitations && license.limitations.length > 0 && (
                          <div className="mt-3">
                            <h5 className="font-medium text-gray-900 mb-2">Limitations:</h5>
                            <ul className="space-y-1">
                              {license.limitations.map((limitation, index) => (
                                <li key={index} className="flex items-center gap-2 text-gray-500">
                                  <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                  {limitation}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Purchase Summary</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beat:</span>
                      <span className="font-medium">{beat.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">License:</span>
                      <span className="font-medium">{selectedLicenseData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{formatPriceWithFiat(selectedLicenseData.price)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total:</span>
                        <span className="text-green-600">{formatPriceWithFiat(selectedLicenseData.price)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-4 border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg cursor-pointer transition-all shadow-md hover:shadow-lg">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="crypto"
                          checked={paymentMethod === 'crypto'}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="sr-only"
                        />
                        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full text-white font-bold text-lg shadow-sm">
                          ₿
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Cryptocurrency</span>
                          <div className="text-sm text-amber-700 font-medium">✨ Recommended • Instant • Secure</div>
                        </div>
                        <div className="ml-auto">
                          <div className="w-5 h-5 rounded-full border-2 border-yellow-500 bg-yellow-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Crypto Wallet Connection Notice */}
                  {paymentMethod === 'crypto' && !isConnected && (
                    <div className="mb-4 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border border-yellow-300">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-yellow-600">🔗</span>
                        <span className="font-medium text-yellow-900">Connect Wallet to Continue</span>
                      </div>
                      <p className="text-yellow-700 text-sm mb-3">
                        Connect your Web3 wallet to purchase beats with cryptocurrency
                      </p>
                      <div className="flex gap-2">
                        <ConnectButton client={client} />
                      </div>
                    </div>
                  )}

                  {/* Purchase Button */}
                  <button
                    onClick={handlePurchase}
                    disabled={processing || (paymentMethod === 'crypto' && !isConnected)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
                  >
                    {processing ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing Payment...
                      </div>
                    ) : (paymentMethod === 'crypto' && !isConnected) ? (
                      'Connect Wallet to Continue'
                    ) : (
                      `Purchase for ${formatPrice(selectedLicenseData.price)}`
                    )}
                  </button>

                  {/* Security Notice */}
                  <div className="mt-4 text-sm text-gray-700 text-center bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold text-green-800">Secure Payment</span>
                    </div>
                    <p className="text-green-700">Your payment information is encrypted and secure. You'll receive download links immediately after purchase.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}