'use client'

import { ThirdwebProvider as Provider } from "thirdweb/react"
import { createThirdwebClient } from "thirdweb"
import { PropsWithChildren } from 'react'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || ""
})

export function ThirdwebProvider({ children }: PropsWithChildren) {
  return (
    <Provider>
      {children}
    </Provider>
  )
}