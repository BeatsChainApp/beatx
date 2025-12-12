'use client'

import React, { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { toast } from 'react-toastify'

interface AppOnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserChoices {
  role?: 'solo_artist' | 'producer' | 'both'
  artistName?: string
  stageName?: string
  genre?: string
  authenticated?: boolean
  user?: any
  sponsorConsent?: boolean
}

interface SponsorContent {
  category: string
  title: string
  description: string
  icon: string
  link?: string
}

export default function AppOnboardingModal({ isOpen, onClose }: AppOnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [userChoices, setUserChoices] = useState<UserChoices>({})
  const [loading, setLoading] = useState(false)
  const [sponsorConsent, setSponsorConsent] = useState<boolean | null>(null)
  
  const { signIn, user } = useUnifiedAuth()
  
  const steps = ['welcome', 'account', 'role', 'profile', 'features', 'complete']

  // Check for existing consent on mount
  useEffect(() => {
    if (isOpen) {
      const stored = localStorage.getItem('beatx_partner_consent')
      if (stored) {
        setSponsorConsent(stored === 'true')
        setUserChoices(prev => ({ ...prev, sponsorConsent: stored === 'true' }))
      }
    }
  }, [isOpen])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0)
      setUserChoices({})
      setLoading(false)
    }
  }, [isOpen])

  const handlePartnerConsent = (consent: boolean) => {
    setSponsorConsent(consent)
    setUserChoices(prev => ({ ...prev, sponsorConsent: consent }))
    localStorage.setItem('beatx_partner_consent', consent.toString())
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn()
      setUserChoices(prev => ({ 
        ...prev, 
        authenticated: true, 
        user: user 
      }))
      toast.success('Successfully signed in!')
      nextStep()
    } catch (error: any) {
      console.error('Sign-in failed:', error)
      toast.error('Sign-in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRoleSelect = (role: 'solo_artist' | 'producer' | 'both') => {
    setUserChoices(prev => ({ ...prev, role }))
  }

  const handleProfileSubmit = (data: { artistName: string; stageName?: string; genre: string }) => {
    setUserChoices(prev => ({ ...prev, ...data }))
    nextStep()
  }

  const completeOnboarding = () => {
    // Save onboarding completion
    localStorage.setItem('beatx_onboarding_completed', 'true')
    localStorage.setItem('beatx_onboarding_choices', JSON.stringify(userChoices))
    
    toast.success('Welcome to BeatsChain! 🎵')
    onClose()
    
    // Show first action guidance after a brief delay
    setTimeout(() => {
      showFirstActionGuidance()
    }, 1000)
  }

  const showFirstActionGuidance = () => {
    // Create floating guidance similar to extension
    const guidance = document.createElement('div')
    guidance.className = 'fixed top-4 right-4 bg-white rounded-xl shadow-2xl p-6 max-w-sm z-50 border border-gray-200'
    guidance.innerHTML = `
      <div class="text-center mb-4">
        <div class="text-4xl mb-2">🎵</div>
        <h3 class="text-lg font-bold text-gray-900">Ready to get started?</h3>
      </div>
      <div class="space-y-2">
        <button onclick="window.location.href='/upload'" class="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium">
          🎧 Upload & Mint NFT
        </button>
        <button onclick="window.location.href='/upload?tab=radio'" class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-all text-sm font-medium">
          📻 Radio Submission
        </button>
        <button onclick="window.location.href='/beatnfts'" class="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-all text-sm font-medium">
          🏪 Browse Marketplace
        </button>
      </div>
      <button onclick="this.remove()" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl">×</button>
    `
    
    document.body.appendChild(guidance)
    
    // Auto-remove after 12 seconds
    setTimeout(() => {
      if (guidance.parentNode) {
        guidance.remove()
      }
    }, 12000)
  }

  const getSponsorContent = (step: string): SponsorContent | null => {
    if (!userChoices.sponsorConsent) return null
    
    const sponsors: Record<string, SponsorContent> = {
      welcome: {
        category: 'marketplace_services',
        title: 'Professional Marketplace Services',
        description: 'Boost your marketplace presence with verified industry partners',
        icon: '🏪'
      },
      account: {
        category: 'professional_services', 
        title: 'Professional Account Services',
        description: 'Enhanced features and professional tools available after sign-in',
        icon: '💼'
      },
      profile: {
        category: 'profile_services',
        title: 'Profile Optimization Services', 
        description: 'Professional profile setup and optimization services',
        icon: '✨'
      }
    }
    
    return sponsors[step] || null
  }

  const renderSponsorContent = (step: string) => {
    const sponsor = getSponsorContent(step)
    if (!sponsor) return null
    
    return (
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{sponsor.icon}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-sm">{sponsor.title}</h4>
            <p className="text-gray-600 text-xs mt-1">{sponsor.description}</p>
            <div className="mt-2">
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                SPONSORED
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  // Partner consent step (shown first if not already given)
  if (sponsorConsent === null) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">📢</div>
            <h2 className="text-2xl font-bold text-gray-900">Professional Partner Content</h2>
            <p className="text-gray-600 text-sm mt-2">
              BeatsChain partners with professional music industry services to provide you with relevant tools and resources.
            </p>
          </div>
          
          <div className="space-y-4 mb-6">
            <p className="text-gray-600 text-sm">
              We may show you content from our verified partners that could help with your music career.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs">
                ✓ No personal data shared with partners<br/>
                ✓ You can change this preference anytime<br/>
                ✓ Only relevant, professional services
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => handlePartnerConsent(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-all font-medium"
            >
              No Thanks
            </button>
            <button
              onClick={() => handlePartnerConsent(true)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
            >
              I Agree
            </button>
          </div>
        </div>
      </div>
    )
  }

  const currentStepName = steps[currentStep]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
        
        {/* Progress Bar */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Welcome to BeatsChain</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl p-1"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full ${
                  index <= currentStep ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className="text-sm text-gray-600 mt-2">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>

        {/* Step Content */}
        <div className="p-4 sm:p-6">
          {currentStepName === 'welcome' && (
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-4 sm:mb-6">🎵</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Welcome to BeatsChain</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
                Transform your music into NFTs, submit to radio stations, and access professional music industry tools
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl sm:text-3xl mb-2">🎧</div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">NFT Minting</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Turn your music into blockchain assets</p>
                </div>
                <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl sm:text-3xl mb-2">📻</div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Radio Submission</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Professional SA radio packages</p>
                </div>
                <div className="p-3 sm:p-4 border border-gray-200 rounded-lg">
                  <div className="text-2xl sm:text-3xl mb-2">🏪</div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Marketplace</h4>
                  <p className="text-gray-600 text-xs sm:text-sm">Buy and sell music NFTs</p>
                </div>
              </div>

              {renderSponsorContent('welcome')}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={nextStep}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm sm:text-base"
                >
                  Get Started
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
                >
                  Skip Setup
                </button>
              </div>
            </div>
          )}

          {currentStepName === 'account' && (
            <div className="text-center">
              <div className="text-5xl mb-6">🔐</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Sign In to Continue</h3>
              <p className="text-gray-600 mb-8">
                Sign in with Google to access all features and sync your data across devices
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Secure wallet generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Cloud sync across devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Professional features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span>Transaction history</span>
                  </div>
                </div>
              </div>

              {renderSponsorContent('account')}
              
              <div className="flex gap-3 justify-center mt-6">
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                  )}
                  Sign in with Google
                </button>
                <button
                  onClick={previousStep}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-all font-medium"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStepName === 'role' && (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🎯</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">What describes you best?</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
                This helps us customize your BeatsChain experience
              </p>
              
              <div className="grid grid-cols-1 gap-3 sm:gap-4 mb-4 sm:mb-6">
                {[
                  { id: 'solo_artist', icon: '🎤', title: 'Solo Artist', desc: 'Create and mint your music as NFTs' },
                  { id: 'producer', icon: '🎹', title: 'Producer/Beat Maker', desc: 'Create beats and instrumentals for the marketplace' },
                  { id: 'both', icon: '🎵', title: 'Both Artist & Producer', desc: 'Full music creation and marketplace suite' }
                ].map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role.id as any)}
                    className={`p-4 sm:p-6 border-2 rounded-lg transition-all text-left ${
                      userChoices.role === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="text-2xl sm:text-3xl">{role.icon}</div>
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{role.title}</h4>
                        <p className="text-gray-600 text-xs sm:text-sm">{role.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {userChoices.role && renderSponsorContent('role')}
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <button
                  onClick={nextStep}
                  disabled={!userChoices.role}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium text-sm sm:text-base"
                >
                  Continue
                </button>
                <button
                  onClick={previousStep}
                  className="bg-gray-200 text-gray-700 py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {currentStepName === 'profile' && (
            <ProfileStep
              onSubmit={handleProfileSubmit}
              onBack={previousStep}
              renderSponsor={() => renderSponsorContent('profile')}
            />
          )}

          {currentStepName === 'features' && (
            <div className="text-center">
              <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🚀</div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Your BeatsChain Toolkit</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
                Everything you need to succeed in the music industry
              </p>
              
              <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                {[
                  { icon: '🎧', title: 'NFT Minting', desc: 'Turn your music into blockchain assets with automatic licensing' },
                  { icon: '📻', title: 'Radio Submission', desc: 'Professional packages for SA radio stations with SAMRO docs' },
                  { icon: '🏪', title: 'Marketplace', desc: 'Buy, sell, and discover music NFTs from artists worldwide' },
                  { icon: '🎯', title: 'ISRC Generation', desc: 'Industry-standard music codes for professional distribution' }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border border-gray-200 rounded-lg">
                    <div className="text-2xl sm:text-3xl">{feature.icon}</div>
                    <div className="text-left">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{feature.title}</h4>
                      <p className="text-gray-600 text-xs sm:text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={completeOnboarding}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium text-sm sm:text-base"
                >
                  Start Creating
                </button>
                <button
                  onClick={previousStep}
                  className="bg-gray-200 text-gray-700 py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Profile Step Component
interface ProfileStepProps {
  onSubmit: (data: { artistName: string; stageName?: string; genre: string }) => void
  onBack: () => void
  renderSponsor: () => React.ReactNode
}

function ProfileStep({ onSubmit, onBack, renderSponsor }: ProfileStepProps) {
  const [artistName, setArtistName] = useState('')
  const [stageName, setStageName] = useState('')
  const [genre, setGenre] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (artistName && genre) {
      onSubmit({ artistName, stageName, genre })
    }
  }

  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">📝</div>
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Set Up Your Artist Profile</h3>
      <p className="text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base px-2">
        Complete your profile to get the most out of BeatsChain
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 text-left">
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Artist Name *
          </label>
          <input
            type="text"
            value={artistName}
            onChange={(e) => setArtistName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Your artist name"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Stage Name (Optional)
          </label>
          <input
            type="text"
            value={stageName}
            onChange={(e) => setStageName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            placeholder="Your stage name"
          />
        </div>
        
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Primary Genre *
          </label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            required
          >
            <option value="">Select Genre</option>
            <option value="Hip-Hop">Hip-Hop</option>
            <option value="House">House</option>
            <option value="Afrikaans">Afrikaans</option>
            <option value="Gospel">Gospel</option>
            <option value="Jazz">Jazz</option>
            <option value="Kwaito">Kwaito</option>
            <option value="Electronic">Electronic</option>
            <option value="Pop">Pop</option>
            <option value="Rock">Rock</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </form>

      {renderSponsor()}
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <button
          onClick={handleSubmit}
          disabled={!artistName || !genre}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 sm:px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all font-medium text-sm sm:text-base"
        >
          Continue
        </button>
        <button
          onClick={onBack}
          className="bg-gray-200 text-gray-700 py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-300 transition-all font-medium text-sm sm:text-base"
        >
          Back
        </button>
      </div>
    </div>
  )
}