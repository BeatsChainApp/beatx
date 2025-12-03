'use client'

import { PropsWithChildren, useEffect, useState } from 'react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, sepolia, polygon } from '@reown/appkit/networks'
import { Web3DataProvider } from '@/context/Web3DataContext'

// Setup queryClient
const queryClient = new QueryClient()

// Get projectId from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'aa91d5eab1d0156ff3d90cc596741756'

if (!projectId) {
  console.warn('Using default WalletConnect Project ID. For production, set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
}

// Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [mainnet, sepolia, polygon],
  projectId,
  ssr: true
})

interface Props extends PropsWithChildren {
  cookies?: string | null
}

export function Web3Provider({ children, cookies }: Props) {
  const [mounted, setMounted] = useState(false)
  const [appKitInitialized, setAppKitInitialized] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !appKitInitialized) {
      // Use setTimeout to prevent blocking and allow for proper error handling
      const initializeAppKit = async () => {
        try {
          // Check if we're in a supported environment
          if (typeof window === 'undefined') {
            console.warn('AppKit initialization skipped: not in browser environment')
            return
          }

          // Validate project ID
          if (!projectId || projectId === 'aa91d5eab1d0156ff3d90cc596741756') {
            console.warn('Using default WalletConnect Project ID - consider setting NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID')
          }

          const appKit = createAppKit({
            adapters: [wagmiAdapter],
            networks: [mainnet, sepolia, polygon],
            projectId,
            metadata: {
              name: 'BeatsChain',
              description: 'Decentralized marketplace for beat creators and artists',
              url: typeof window !== 'undefined' ? window.location.origin : 'https://beatschain.app',
              icons: ['/favicon.ico']
            },
            features: {
              analytics: false,
              email: true,
              socials: ['google'],
              onramp: false,
              swaps: false,
              history: false
            },
            themeMode: 'light',
            themeVariables: {
              '--w3m-color-mix': '#3b82f6',
              '--w3m-color-mix-strength': 20
            },
            enableWalletConnect: true,
            enableInjected: true,
            enableEIP6963: true,
            enableCoinbase: false
          })
          
          setAppKitInitialized(true)
          console.log('AppKit initialized successfully')
          
          // Dispatch event to notify other components
          window.dispatchEvent(new CustomEvent('appkit-ready'))
          
        } catch (error) {
          console.error('Web3 wallet connection setup failed:', error)
          
          // Set as initialized even on error to prevent retry loops
          setAppKitInitialized(true)
          
          // Dispatch error event
          window.dispatchEvent(new CustomEvent('appkit-error', { detail: error }))
        }
      }
      
      // Delay initialization slightly to ensure DOM is ready
      setTimeout(initializeAppKit, 100)
    }
  }, [mounted, appKitInitialized])

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {mounted ? (
          <Web3DataProvider>
            {children}
          </Web3DataProvider>
        ) : (
          children
        )}
      </QueryClientProvider>
    </WagmiProvider>
  )
}