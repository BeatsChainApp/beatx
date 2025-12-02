'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext''
import SimplifiedAuth from './SimplifiedAuth'

interface SimplifiedWalletConnectProps {
  className?: string
}

export default function SimplifiedWalletConnect({ className = '' }: SimplifiedWalletConnectProps) {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const { isConnected, address } = useAccount()
  const { user, isAuthenticated, hasRole } = useUnifiedAuth()

  const handleSignIn = () => {
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
    // Redirect to home after signOut
    window.location.href = '/'
  }

  // Show user info if authenticated
  if (isAuthenticated && (user || firebaseUser)) {
    const displayUser = user || {
      displayName: firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User',
      role: 'user',
      address: address
    }

    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {displayUser.displayName?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="hidden sm:block">
            <div className="text-sm font-medium text-gray-900">
              {displayUser.displayName}
            </div>
            <div className="text-xs text-gray-500">
              {hasRole('super_admin') && '🛡️ Super Admin'}
              {hasRole('admin') && !hasRole('super_admin') && '👑 Admin'}
              {hasRole('producer') && !hasRole('admin') && '🎵 Producer'}
              {!hasRole('producer') && !hasRole('admin') && '👤 User'}
            </div>
          </div>
        </div>
        
        <div className="relative group">
          <button className="p-2 text-gray-500 hover:text-gray-700">
            ⚙️
          </button>
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-1">
              {(hasRole('admin') || hasRole('super_admin')) && (
                <a href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  🛡️ Admin Dashboard
                </a>
              )}
              {hasRole('producer') && (
                <a href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  🎵 Producer Dashboard
                </a>
              )}
              <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                👤 Profile
              </a>
              <button
                onClick={handleSignOut}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show sign in button
  return (
    <>
      <button
        onClick={handleSignIn}
        className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium ${className}`}
      >
        Sign In
      </button>
      
      <SimplifiedAuth 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}