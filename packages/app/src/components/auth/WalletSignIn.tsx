'use client'

import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useSIWE } from '@/hooks/useSIWE'

export function WalletSignIn() {
  const account = useActiveAccount(); const isConnected = !!account
  const { user, loading, signIn, signOut, isAuthenticated } = useSIWE()
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    try {
      setError(null)
      await signIn()
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    }
  }

  if (!isConnected) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p>Please connect your wallet first</p>
        <w3m-button />
      </div>
    )
  }

  if (isAuthenticated) {
    return (
      <div style={{ padding: '1rem', textAlign: 'center' }}>
        <p style={{ color: '#10b981', marginBottom: '1rem' }}>
          ✅ Authenticated with wallet
        </p>
        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '1rem' }}>
          {user?.address}
        </p>
        <button
          onClick={signOut}
          style={{
            background: '#ef4444',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '1rem', textAlign: 'center' }}>
      <p style={{ marginBottom: '1rem' }}>Sign in with your wallet to continue</p>
      {error && (
        <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>
          {error}
        </p>
      )}
      <button
        onClick={handleSignIn}
        disabled={loading}
        style={{
          background: loading ? '#9ca3af' : '#3b82f6',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.375rem',
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '1rem',
          fontWeight: '600'
        }}
      >
        {loading ? 'Signing...' : 'Sign In with Wallet'}
      </button>
    </div>
  )
}