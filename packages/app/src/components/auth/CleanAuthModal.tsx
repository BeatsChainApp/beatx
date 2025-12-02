'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { googleAuth } from '@/lib/googleAuth'
import { toast } from 'react-hot-toast'

interface CleanAuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'signin' | 'signup'
}

export default function CleanAuthModal({ isOpen, onClose, mode }: CleanAuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'user' | 'producer'>('user')
  const [mounted, setMounted] = useState(false)

  const { isAuthenticated } = useUnifiedAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

  const handleGoogleAuth = async () => {
    if (!mounted) return
    
    setLoading(true)
    try {
      await googleAuth.initialize()
      const userData = await googleAuth.signIn()
      
      // Store role selection for Google users
      if (userData?.email) {
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
      }
      
      toast.success(`Welcome, ${userData.name}!`)
      
      // Trigger auth refresh
      window.dispatchEvent(new CustomEvent('auth-refresh'))
      
      setTimeout(() => {
        window.location.reload()
      }, 1000)
      
    } catch (error: any) {
      console.error('Google auth failed:', error)
      toast.error('Sign in failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleWalletConnect = () => {
    // Store role selection for wallet users
    localStorage.setItem('pending_role_selection', selectedRole)
    
    // Trigger wallet connection
    const connectButton = document.querySelector('w3m-button')
    if (connectButton) {
      (connectButton as any).click()
    }
    
    onClose()
  }

  if (!isOpen || !mounted) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎵</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'signin' ? 'Welcome Back' : 'Join BeatsChain'}
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            {mode === 'signin' ? 'Sign in to your account' : 'Create your account'}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
        >
          ✕
        </button>

        {/* Role Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Account Type
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
              selectedRole === 'user' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="user"
                checked={selectedRole === 'user'}
                onChange={(e) => setSelectedRole(e.target.value as 'user')}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">🎧</div>
                <div className="font-medium">Music Lover</div>
                <div className="text-xs text-gray-600">Buy and collect beats</div>
              </div>
            </label>
            <label className={`border-2 rounded-lg p-3 cursor-pointer transition-colors ${
              selectedRole === 'producer' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="radio"
                name="role"
                value="producer"
                checked={selectedRole === 'producer'}
                onChange={(e) => setSelectedRole(e.target.value as 'producer')}
                className="sr-only"
              />
              <div className="text-center">
                <div className="text-2xl mb-1">🎵</div>
                <div className="font-medium">Producer</div>
                <div className="text-xs text-gray-600">Create and sell beats</div>
              </div>
            </label>
          </div>
        </div>

        {/* Google Sign In */}
        <button
          onClick={handleGoogleAuth}
          disabled={loading}
          className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-all duration-200 flex items-center justify-center gap-2 mb-4"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="relative mb-4">
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
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all duration-200 shadow-md hover:shadow-lg"
        >
          Connect Wallet
        </button>

        <p className="mt-6 text-center text-sm text-gray-600">
          {mode === 'signin' ? (
            <>Don't have an account? <button className="text-blue-600 hover:text-blue-800 font-medium">Create account</button></>
          ) : (
            <>Already have an account? <button className="text-blue-600 hover:text-blue-800 font-medium">Sign in</button></>
          )}
        </p>
      </div>
    </div>
  )
}