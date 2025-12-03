'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { googleAuth } from '@/lib/googleAuth'
import { toast } from 'react-hot-toast'

export default function SignUpPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="auth">
        <SignUpPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function SignUpPageContent() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedRole, setSelectedRole] = useState<'producer' | 'creator' | 'user'>('user')
  const router = useRouter()
  const { isAuthenticated, user } = useUnifiedAuth()

  useEffect(() => {
    if (isAuthenticated && user) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, user, router])

  const handleGoogleSignUp = async () => {
    setLoading(true)
    setError('')

    try {
      await googleAuth.initialize()
      const userData = await googleAuth.signIn()
      
      if (userData.email) {
        toast.success(`Welcome to BeatsChain, ${userData.name}!`)
        
        // Store user profile with selected role
        const profileKey = `web3_profile_google_${userData.email.toLowerCase()}`
        const profile = {
          address: `google:${userData.sub}`,
          displayName: userData.name,
          email: userData.email,
          profileImage: userData.picture,
          role: selectedRole,
          isVerified: userData.verified_email,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        localStorage.setItem(profileKey, JSON.stringify(profile))
        
        // Redirect based on role
        setTimeout(() => {
          if (selectedRole === 'producer') {
            router.push('/dashboard')
          } else if (selectedRole === 'creator') {
            router.push('/creator-dashboard')
          } else {
            router.push('/browse')
          }
        }, 1000)
      }
    } catch (error: any) {
      console.error('Google sign up error:', error)
      let errorMessage = 'Sign up failed. Please try again.'
      
      if (error.message?.includes('popup')) {
        errorMessage = 'Sign up was cancelled. Please try again.'
      } else if (error.message?.includes('network')) {
        errorMessage = 'Network error. Please check your connection.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = () => {
    // Trigger wallet connection modal
    const connectButton = document.querySelector('w3m-button')
    if (connectButton) {
      (connectButton as any).click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10 mobile-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-8xl mb-6 mobile-heading">🚀</div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-green-100 bg-clip-text text-transparent mobile-heading">
              Join BeatsChain
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed mobile-heading">
              Start your Web3 music journey today
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
              <p className="text-lg mb-4">Get started in seconds</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">🎵</div>
                  <div>Upload & sell beats</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">🎨</div>
                  <div>License for content</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-2xl mb-1 mobile-heading">🎧</div>
                  <div>Discover new music</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sign Up Form */}
      <div className="container mx-auto px-4 py-12 mobile-container">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2 mobile-heading">Create Account</h2>
              <p className="text-gray-600">Choose your role and sign up</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I want to join as a:
              </label>
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="producer"
                    checked={selectedRole === 'producer'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3 mobile-heading">🎵</span>
                    <div>
                      <div className="font-medium">Producer</div>
                      <div className="text-sm text-gray-500">Upload and sell beats</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="creator"
                    checked={selectedRole === 'creator'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3 mobile-heading">🎨</span>
                    <div>
                      <div className="font-medium">Content Creator</div>
                      <div className="text-sm text-gray-500">License beats for content</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="user"
                    checked={selectedRole === 'user'}
                    onChange={(e) => setSelectedRole(e.target.value as any)}
                    className="mr-3"
                  />
                  <div className="flex items-center">
                    <span className="text-2xl mr-3 mobile-heading">🎧</span>
                    <div>
                      <div className="font-medium">Music Lover</div>
                      <div className="text-sm text-gray-500">Browse and collect beats</div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="space-y-4">
              {/* Google Sign Up */}
              <button
                onClick={handleGoogleSignUp}
                disabled={loading}
                className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 px-6 rounded-xl hover:border-green-400 hover:bg-green-50 disabled:opacity-50 font-medium transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  'Sign up with Google'
                )}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Wallet Connect */}
              <button
                onClick={handleWalletConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-6 rounded-xl hover:from-green-700 hover:to-blue-700 disabled:opacity-50 font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔗</span>
                Connect Crypto Wallet
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <a href="/signin" className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
                </a>
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">🎁 New User Benefits</h4>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• 10 FREE BeatNFT credits</li>
                <li>• Access to exclusive beats</li>
                <li>• Join the Web3 music revolution</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 mobile-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 mobile-heading">Join the Community</h2>
            <p className="text-lg text-gray-300">
              Thousands of creators are already building the future of music
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2 mobile-heading">1000+</div>
              <div className="text-gray-300">Beats Available</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-400 mb-2 mobile-heading">500+</div>
              <div className="text-gray-300">Active Producers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2 mobile-heading">50+</div>
              <div className="text-gray-300">ETH in Sales</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400 mb-2 mobile-heading">24/7</div>
              <div className="text-gray-300">Global Access</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}