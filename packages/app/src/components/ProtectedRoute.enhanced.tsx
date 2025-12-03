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

  // Route-specific sign-in screens
  if (!isAuthenticated) {
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
    
    if (currentPath === '/upload') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-20">
            <div className="container mx-auto px-4 text-center">
              <div className="text-8xl mb-6">🎵</div>
              <h1 className="text-5xl font-bold mb-4">Upload Your Beats</h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto">
                Transform your music into professional NFTs with ISRC codes and blockchain verification
              </p>
            </div>
          </div>
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
                <h2 className="text-3xl font-bold mb-6 text-center">Professional Beat Upload System</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-4xl mb-4">🏷️</div>
                    <h3 className="text-xl font-bold mb-2">ISRC Generation</h3>
                    <p className="text-gray-600">Professional ISRC codes for global distribution and royalty tracking</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-4xl mb-4">💎</div>
                    <h3 className="text-xl font-bold mb-2">NFT Minting</h3>
                    <p className="text-gray-600">Mint your beats as NFTs with comprehensive metadata and ownership proof</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-lg">
                    <div className="text-4xl mb-4">💰</div>
                    <h3 className="text-xl font-bold mb-2">Instant Royalties</h3>
                    <p className="text-gray-600">Automatic royalty distribution on every sale and resale</p>
                  </div>
                </div>
                <div className="text-center">
                  <w3m-button size="lg" label="Connect to Upload" />
                  <p className="mt-4 text-gray-500">Connect your wallet to start uploading beats</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
    
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-6">🔒</div>
            <h1 className="text-5xl font-bold mb-4">Access BeatsChain</h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Connect with Google or your preferred wallet to unlock the full BeatsChain experience
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <w3m-button size="lg" />
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