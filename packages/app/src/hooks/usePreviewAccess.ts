'use client'

import { useActiveAccount } from "thirdweb/react"

export function usePreviewAccess() {
  const account = useActiveAccount(); const isConnected = !!account

  // Simple rule: Connected wallets get full access, unconnected get 30s previews
  const canAccessFullBeat = isConnected

  return {
    canAccessFullBeat,
    isConnected
  }
}