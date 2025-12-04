'use client'

import { PropsWithChildren } from 'react'
import { ThirdwebProvider } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Create Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

// Create QueryClient for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

interface Props extends PropsWithChildren {
  cookies?: string | null
}

export function Web3Provider({ children, cookies }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThirdwebProvider>
        <Web3DataProvider>
          {children}
        </Web3DataProvider>
      </ThirdwebProvider>
    </QueryClientProvider>
  )
}