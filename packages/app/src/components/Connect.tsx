import React from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

export function Connect() {
  const { isAuthenticated, user } = useUnifiedAuth()

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        {user?.profileImage && (
          <img 
            src={user.profileImage} 
            alt={user.displayName}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium hidden sm:inline">
          {user?.displayName || 'User'}
        </span>
        <w3m-button balance='hide' size='sm' />
      </div>
    )
  }

  return <w3m-button />
}
