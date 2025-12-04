import React from 'react'
import { ConnectButton } from 'thirdweb/react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import GetStartedButton from './GetStartedButton'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

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
        <ConnectButton client={client} />
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <GetStartedButton />
      <ConnectButton client={client} />
    </div>
  )
}
