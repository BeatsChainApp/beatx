'use client'

import { PropsWithChildren } from 'react'
import { ThirdwebProvider } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'
import { Web3DataProvider } from '@/context/Web3DataContext'

// Create Thirdweb client
const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

interface Props extends PropsWithChildren {
  cookies?: string | null
}

export function Web3Provider({ children, cookies }: Props) {
  return (
    <ThirdwebProvider>
      <Web3DataProvider>
        {children}
      </Web3DataProvider>
    </ThirdwebProvider>
  )
}