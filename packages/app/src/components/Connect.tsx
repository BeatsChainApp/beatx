import React, { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import RoleSelectionModal from './RoleSelectionModal'
import GoogleSignInButton from './auth/GoogleSignInButton'

export function Connect() {
  const [showRoleModal, setShowRoleModal] = useState(false)

  const { isAuthenticated, user } = useUnifiedAuth()

  const handleGoogleSuccess = (userData: any) => {
    // Handle successful Google sign-in
    console.log('Google sign-in successful:', userData)
  }

  const handleGoogleError = (error: any) => {
    console.error('Google sign-in error:', error)
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
          <GoogleSignInButton
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            showAccountSelector={true}
            className="bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
          />
          
          <button
            onClick={() => setShowRoleModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      )}

      <RoleSelectionModal 
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
      />
    </div>
  )
}
