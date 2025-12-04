'use client'

import { PropsWithChildren } from 'react'
import { ThirdwebProvider } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

interface Props extends PropsWithChildren {
  cookies: string | null
}

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

export function Web3Provider(props: Props) {
  return (
    <ThirdwebProvider>
      {props.children}
    </ThirdwebProvider>
  )
}
