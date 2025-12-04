'use client'

import React, { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface Web3AccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function Web3AccountModal({ isOpen, onClose }: Web3AccountModalProps) {
  const [step, setStep] = useState<'connect' | 'profile' | 'complete'>('connect')
  const [profileData, setProfileData] = useState({
    displayName: '',
    bio: '',
    role: 'user' as 'user' | 'producer'
  })
  const [loading, setLoading] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signIn, user } = useUnifiedAuth()

  // Handle wallet connection state
  React.useEffect(() => {
    if (isConnected && address) {
      // If wallet is connected, move to profile creation
      setStep('profile')
    } else {
      // If wallet disconnects, go back to connect step
      setStep('connect')
    }
  }, [isConnected, address])

  const handleCreateProfile = async () => {
    if (!address) return
    
    setLoading(true)
    try {
      // Create Web3 profile
      const newProfile = {
        address: address,
        displayName: profileData.displayName || `User ${address.slice(0, 6)}...${address.slice(-4)}`,
        bio: profileData.bio || 'New BeatsChain user',
        role: profileData.role,
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      localStorage.setItem(`web3_profile_${address.toLowerCase()}`, JSON.stringify(newProfile))
      
      // Allocate 10 free BeatNFT credits for new users
      const beatNFTBalance = {
        credits: 10,
        hasProNFT: false,
        totalUsed: 0
      }
      localStorage.setItem(`beatnft_balance_${address.toLowerCase()}`, JSON.stringify(beatNFTBalance))
      
      // Sign in with wallet
      await signIn()
      
      setStep('complete')
    } catch (error) {
      console.error('Profile creation failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    onClose()
    // Redirect based on role
    if (profileData.role === 'producer') {
      window.location.href = '/dashboard'
    } else {
      window.location.href = '/marketplace'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">BeatsChain</h2>
              <p className="text-blue-100 text-sm">Web3 Music Marketplace</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === 'connect' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2">Connect Your Wallet</h3>
              <p className="text-gray-600 mb-6">
                Your wallet is connecting... Please wait.
              </p>
              
              <div className="flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {step === 'profile' && (
            <div>
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">👤</div>
                <h3 className="text-xl font-bold mb-2">Create Your Profile</h3>
                <p className="text-gray-600">Tell us about yourself</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                    placeholder="Your name or artist name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio (Optional)
                  </label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    placeholder="Tell us about your music journey..."
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I want to...
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="user"
                        checked={profileData.role === 'user'}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value as 'user'})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">🎧 Buy Beats</div>
                        <div className="text-sm text-gray-600">Discover and purchase beats for my projects</div>
                      </div>
                    </label>
                    <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="role"
                        value="producer"
                        checked={profileData.role === 'producer'}
                        onChange={(e) => setProfileData({...profileData, role: e.target.value as 'producer'})}
                        className="mr-3"
                      />
                      <div>
                        <div className="font-semibold">🎵 Sell Beats</div>
                        <div className="text-sm text-gray-600">Upload and sell my beats as NFTs</div>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-yellow-800 text-sm">
                    💡 <strong>Good news!</strong> You can always change your role later and do both - buy and sell beats!
                  </p>
                </div>

                <button
                  onClick={handleCreateProfile}
                  disabled={loading || !profileData.displayName.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Profile...
                    </div>
                  ) : (
                    'Create Profile →'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'complete' && (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-bold mb-2">Welcome to BeatsChain!</h3>
              <p className="text-gray-600 mb-6">
                Your Web3 music journey starts now
              </p>

              <div className="bg-green-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-green-800 mb-2">🎁 Welcome Bonus!</h4>
                <p className="text-green-700 text-sm">
                  You've received <strong>10 free BeatNFT credits</strong> to start uploading beats!
                </p>
              </div>

              <div className="space-y-3">
                {profileData.role === 'producer' ? (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">🎵 Next Steps for Producers:</h4>
                    <ul className="text-blue-700 text-sm space-y-1">
                      <li>• Upload your first beat</li>
                      <li>• Set up your producer profile</li>
                      <li>• Start earning from your music</li>
                    </ul>
                  </div>
                ) : (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">🎧 Next Steps for Music Lovers:</h4>
                    <ul className="text-purple-700 text-sm space-y-1">
                      <li>• Explore the marketplace</li>
                      <li>• Discover amazing beats</li>
                      <li>• Support your favorite producers</li>
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleComplete}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 font-semibold"
                >
                  {profileData.role === 'producer' ? '🚀 Go to Dashboard' : '🎵 Explore Marketplace'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg">
          <p className="text-xs text-gray-500 text-center">
            By connecting your wallet, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  )
}