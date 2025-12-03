'use client'

import { ReactNode, useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface ProtectedRouteProps {
  children: ReactNode
  permission?: string
  role?: string
  anyRole?: string[]
  fallback?: ReactNode
  requireWallet?: boolean
}

export default function ProtectedRoute({ 
  children, 
  permission, 
  role, 
  anyRole, 
  fallback,
  requireWallet = false 
}: ProtectedRouteProps) {
  const [mounted, setMounted] = useState(false)
  const auth = useUnifiedAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  const { user, loading, isAuthenticated, hasPermission, hasRole, hasAnyRole, wallet } = auth

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎵</div>
          <p className="text-gray-600">Checking access...</p>
        </div>
      </div>
    )
  }

  // Enhanced sign-in required screen
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-6">🔒</div>
            <h1 className="text-5xl font-bold mb-4">Access BeatsChain</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Connect with Google or your preferred wallet to unlock the full BeatsChain experience
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-2xl font-bold mb-4">Upload & Mint Beats</h3>
                <p className="text-gray-600 mb-6">
                  Transform your music into NFTs with professional metadata, ISRC codes, and blockchain verification.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Professional ISRC generation</li>
                  <li>✓ Comprehensive metadata system</li>
                  <li>✓ Blockchain ownership proof</li>
                  <li>✓ Automatic royalty distribution</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="text-4xl mb-4">🏪</div>
                <h3 className="text-2xl font-bold mb-4">Marketplace Access</h3>
                <p className="text-gray-600 mb-6">
                  Discover, purchase, and trade beats in the decentralized music marketplace.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>✓ Browse thousands of beats</li>
                  <li>✓ Instant crypto payments</li>
                  <li>✓ True ownership via NFTs</li>
                  <li>✓ Creator royalty support</li>
                </ul>
              </div>
            </div>

            {/* Sign In Options */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Choose Your Sign-In Method</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors">
                  <div className="text-3xl mb-4">🔗</div>
                  <h3 className="text-xl font-semibold mb-3">Connect Wallet</h3>
                  <p className="text-gray-600 mb-4">Full Web3 experience with your crypto wallet</p>
                  <w3m-button size="md" />
                </div>

                <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-green-300 transition-colors">
                  <div className="text-3xl mb-4">🌐</div>
                  <h3 className="text-xl font-semibold mb-3">Google Sign-In</h3>
                  <p className="text-gray-600 mb-4">Quick access with your Google account</p>
                  <button className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 mx-auto">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>

              <div className="mt-8 text-gray-500">
                <p>🔒 Your data is secure and encrypted</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Permission check with enhanced context
  if (permission && !hasPermission(permission)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-6">🚫</div>
            <h1 className="text-5xl font-bold mb-4">Permission Required</h1>
            <p className="text-xl opacity-90">
              You need specific permissions to access this feature
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Access Denied</h2>
              
              <div className="bg-red-50 p-6 rounded-lg mb-6">
                <p className="text-red-700 text-lg mb-2">
                  <strong>Required Permission:</strong> 
                  <code className="bg-red-100 px-3 py-1 rounded ml-2">{permission}</code>
                </p>
                <p className="text-red-700 text-lg">
                  <strong>Your Role:</strong> 
                  <code className="bg-red-100 px-3 py-1 rounded ml-2">{user?.role || 'None'}</code>
                </p>
              </div>

              <div className="text-gray-600 mb-8">
                <h3 className="text-xl font-semibold mb-4">How to Get Access</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">👤</div>
                    <h4 className="font-semibold mb-2">Upgrade Role</h4>
                    <p className="text-sm">Contact admin for role upgrade</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🔄</div>
                    <h4 className="font-semibold mb-2">Switch Account</h4>
                    <p className="text-sm">Sign in with authorized account</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="text-2xl mb-2">🔗</div>
                    <h4 className="font-semibold mb-2">Connect Wallet</h4>
                    <p className="text-sm">Ensure wallet is connected</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ← Go Back
                </button>
                <a href="/" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium">
                  🏠 Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Role check with enhanced context
  if (role && !hasRole(role)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-6">👮‍♂️</div>
            <h1 className="text-5xl font-bold mb-4">Role Required</h1>
            <p className="text-xl opacity-90">
              This area requires a specific role to access
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-6">Access Level Required</h2>
              
              <div className="bg-purple-50 p-6 rounded-lg mb-6">
                <p className="text-purple-700 text-lg mb-2">
                  <strong>Required Role:</strong> 
                  <code className="bg-purple-100 px-3 py-1 rounded ml-2">{role}</code>
                </p>
                <p className="text-purple-700 text-lg">
                  <strong>Your Role:</strong> 
                  <code className="bg-purple-100 px-3 py-1 rounded ml-2">{user?.role || 'None'}</code>
                </p>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ← Go Back
                </button>
                <a href="/profile" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium">
                  👤 Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}