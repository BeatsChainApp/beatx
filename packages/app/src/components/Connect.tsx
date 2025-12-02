import React, { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import CleanAuthModal from './auth/CleanAuthModal'

export function Connect() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const { isAuthenticated, user } = useUnifiedAuth()

  const handleSignIn = () => {
    setAuthMode('signin')
    setShowAuthModal(true)
  }

  const handleSignUp = () => {
    setAuthMode('signup')
    setShowAuthModal(true)
  }

  return (
    <div className="flex items-center gap-2">
      {isAuthenticated ? (
        <>
          {user?.address?.startsWith('google:') ? (
            <div className="flex items-center gap-2">
              {user.profileImage && (
                <img 
                  src={user.profileImage} 
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-sm font-medium hidden sm:inline">
                {user.displayName}
              </span>
            </div>
          ) : (
            <>
              <div className="hidden sm:block">
                <w3m-button label='🔗 Wallet' balance='hide' size='sm' />
              </div>
              <div className="sm:hidden">
                <w3m-button label='💳' balance='hide' size='sm' />
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center gap-2">
          <button
            onClick={handleSignIn}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In
          </button>
          
          <button
            onClick={handleSignUp}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      )}

      <CleanAuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
      />
    </div>
  )
}
