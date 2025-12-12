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
      <div className="flex items-center gap-1 sm:gap-2">
        {user?.profileImage && (
          <img 
            src={user.profileImage} 
            alt={user.displayName}
            className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
          />
        )}
        <span className="text-xs sm:text-sm font-medium hidden md:inline max-w-20 truncate">
          {user?.displayName || 'User'}
        </span>
        <div className="[&>button]:!px-2 [&>button]:!py-1 [&>button]:!text-xs sm:[&>button]:!px-3 sm:[&>button]:!py-2 sm:[&>button]:!text-sm">
          <ConnectButton 
            client={client}
            connectModal={{
              size: 'compact',
              titleIcon: '',
              showThirdwebBranding: false,
              welcomeScreen: {
                title: 'Connect Wallet',
                subtitle: 'Connect your wallet to BeatsChain'
              }
            }}
            detailsModal={{
              showTestnetFaucet: false,
              hideSwitchToPersonalWallet: true
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <div className="[&>button]:!px-2 [&>button]:!py-1 [&>button]:!text-xs sm:[&>button]:!px-3 sm:[&>button]:!py-2 sm:[&>button]:!text-sm">
        <GetStartedButton />
      </div>
      <div className="[&>button]:!px-2 [&>button]:!py-1 [&>button]:!text-xs sm:[&>button]:!px-3 sm:[&>button]:!py-2 sm:[&>button]:!text-sm">
        <ConnectButton 
          client={client}
          connectModal={{
            size: 'compact',
            titleIcon: '',
            showThirdwebBranding: false,
            welcomeScreen: {
              title: 'Connect Wallet',
              subtitle: 'Connect your wallet to BeatsChain'
            }
          }}
        />
      </div>
    </div>
  )
}
