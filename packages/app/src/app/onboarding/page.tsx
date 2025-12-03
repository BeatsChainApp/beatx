'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    EnhancedOnboardingManager: any
  }
}

export default function OnboardingPage() {
  return (
    <UniversalLayout requireAuth={true}>
      <ResponsiveWrapper pageType="auth">
        <OnboardingPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function OnboardingPageContent() {
  const [currentStep, setCurrentStep] = useState(1)
  const [stepData, setStepData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState<any>({})
  const router = useRouter()

  useEffect(() => {
    // Check if already onboarded
    if (localStorage.getItem('onboarding_completed')) {
      router.push('/dashboard')
      return
    }

    // Initialize onboarding manager
    const initOnboarding = async () => {
      if (window.EnhancedOnboardingManager) {
        await window.EnhancedOnboardingManager.initialize()
        const data = await window.EnhancedOnboardingManager.renderStep(1)
        setStepData(data)
        setLoading(false)
      }
    }

    if (typeof window !== 'undefined') {
      initOnboarding()
    }
  }, [router])

  const handleNext = async () => {
    if (window.EnhancedOnboardingManager) {
      const nextData = await window.EnhancedOnboardingManager.nextStep()
      
      if (nextData.type === 'completion') {
        // Onboarding complete
        router.push('/dashboard')
      } else {
        setStepData(nextData)
        setCurrentStep(prev => prev + 1)
      }
    }
  }

  const handleRoleSelect = async (role: string) => {
    if (window.EnhancedOnboardingManager) {
      await window.EnhancedOnboardingManager.setUserRole(role)
      setUserData(prev => ({ ...prev, role }))
      handleNext()
    }
  }

  const handleProfileSetup = async (profileData: any) => {
    if (window.EnhancedOnboardingManager) {
      await window.EnhancedOnboardingManager.setupProfile(profileData)
      setUserData(prev => ({ ...prev, profile: profileData }))
      handleNext()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce mobile-heading">🎵</div>
          <p className="text-gray-600">Loading your BeatsChain experience...</p>
        </div>
      </div>
    )
  }

  if (!stepData) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Progress Bar */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of 6</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / 6) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 mobile-heading">{stepData.title}</h1>
            <p className="text-xl text-gray-600">{stepData.content}</p>
          </div>

          {/* Step-specific content */}
          {stepData.type === 'welcome' && (
            <div className="text-center">
              <div className="text-6xl mb-6 mobile-heading">🎵</div>
              <div className="max-w-2xl mx-auto mb-8">
                <h2 className="text-2xl font-semibold mb-4 mobile-heading">Welcome to the Future of Music</h2>
                <p className="text-gray-600 mb-6">
                  BeatsChain is the first decentralized marketplace where producers can sell beats as NFTs, 
                  and music lovers can truly own their favorite sounds forever.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-3xl mb-2 mobile-heading">🔒</div>
                    <h3 className="font-semibold mb-1">True Ownership</h3>
                    <p className="text-sm text-gray-600">Own your beats as NFTs</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2 mobile-heading">💰</div>
                    <h3 className="font-semibold mb-1">Earn Royalties</h3>
                    <p className="text-sm text-gray-600">Get paid on every resale</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2 mobile-heading">⚡</div>
                    <h3 className="font-semibold mb-1">Instant Payments</h3>
                    <p className="text-sm text-gray-600">Crypto payments, no delays</p>
                  </div>
                </div>
              </div>
              
              {/* Sponsor Content */}
              {stepData.sponsor && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-purple-800 mb-2">{stepData.sponsor.title}</h3>
                  <p className="text-purple-700 mb-4">{stepData.sponsor.description}</p>
                </div>
              )}
              
              <button
                onClick={handleNext}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Let's Get Started
              </button>
            </div>
          )}

          {stepData.type === 'account_setup' && (
            <div className="max-w-md mx-auto">
              <div className="space-y-4 mb-8">
                <button className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 p-4 rounded-lg flex items-center justify-center gap-3 transition-colors">
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
                
                <div className="text-center text-gray-500">or</div>
                
                <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white p-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all">
                  Connect Wallet
                </button>
              </div>
              
              <button
                onClick={handleNext}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Skip for now
              </button>
            </div>
          )}

          {stepData.type === 'role_selection' && (
            <div className="max-w-2xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stepData.roles.map((role: string) => {
                  const roleData = {
                    producer: { icon: '🎵', title: 'Producer', desc: 'Create and sell beats as NFTs' },
                    creator: { icon: '🎨', title: 'Content Creator', desc: 'License beats for your content' },
                    music_lover: { icon: '🎧', title: 'Music Lover', desc: 'Discover and collect beats' }
                  }[role]

                  return (
                    <button
                      key={role}
                      onClick={() => handleRoleSelect(role)}
                      className="p-6 border-2 border-gray-200 hover:border-purple-300 rounded-xl text-center transition-all hover:shadow-lg"
                    >
                      <div className="text-4xl mb-4 mobile-heading">{roleData?.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{roleData?.title}</h3>
                      <p className="text-gray-600 text-sm">{roleData?.desc}</p>
                    </button>
                  )
                })}
              </div>

              {/* Sponsor Content */}
              {stepData.sponsor && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-6">
                  <h3 className="font-semibold text-purple-800 mb-2">{stepData.sponsor.title}</h3>
                  <p className="text-purple-700">{stepData.sponsor.description}</p>
                </div>
              )}
            </div>
          )}

          {stepData.type === 'profile_setup' && (
            <div className="max-w-md mx-auto">
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Your name or artist name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bio (Optional)</label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </div>
              </div>

              {/* Sponsor Content */}
              {stepData.sponsor && (
                <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-purple-800 mb-1">{stepData.sponsor.title}</h3>
                  <p className="text-purple-700 text-sm">{stepData.sponsor.description}</p>
                </div>
              )}
              
              <button
                onClick={() => handleProfileSetup({ name: 'User', bio: '' })}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                Continue
              </button>
            </div>
          )}

          {stepData.type === 'feature_tour' && (
            <div className="max-w-3xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stepData.features.map((feature: string) => {
                  const featureData = {
                    nft_minting: { icon: '🎫', title: 'NFT Minting', desc: 'Turn your beats into valuable NFTs' },
                    marketplace: { icon: '🏪', title: 'Marketplace', desc: 'Buy and sell beats with crypto' },
                    analytics: { icon: '📊', title: 'Analytics', desc: 'Track your performance and earnings' }
                  }[feature]

                  return (
                    <div key={feature} className="text-center p-6 bg-gray-50 rounded-xl">
                      <div className="text-4xl mb-4 mobile-heading">{featureData?.icon}</div>
                      <h3 className="font-semibold text-lg mb-2">{featureData?.title}</h3>
                      <p className="text-gray-600 text-sm">{featureData?.desc}</p>
                    </div>
                  )
                })}
              </div>
              
              <div className="text-center">
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  Explore Features
                </button>
              </div>
            </div>
          )}

          {stepData.type === 'completion' && (
            <div className="text-center">
              <div className="text-6xl mb-6 mobile-heading">🚀</div>
              <h2 className="text-2xl font-semibold mb-4 mobile-heading">Welcome to BeatsChain!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You're all set up and ready to start your journey in the decentralized music world.
              </p>

              {/* Sponsor Content */}
              {stepData.sponsor && (
                <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-8 max-w-md mx-auto">
                  <h3 className="font-semibold text-green-800 mb-2">{stepData.sponsor.title}</h3>
                  <p className="text-green-700">{stepData.sponsor.description}</p>
                </div>
              )}
              
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 transition-all"
              >
                Enter BeatsChain
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}