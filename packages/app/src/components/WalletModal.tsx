'use client'

import { useState, useEffect } from 'react'
import { useActiveAccount, useDisconnect } from 'thirdweb/react'
import { useSIWE } from '@/hooks/useSIWE'
import { useEnhancedToast } from '@/hooks/useToast.enhanced'

interface WalletModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  showSignMessage?: boolean
}

export default function WalletModal({ 
  isOpen, 
  onClose, 
  title = "Connect Wallet",
  showSignMessage = true 
}: WalletModalProps) {
  const account = useActiveAccount()
  const { disconnect } = useDisconnect()
  const isConnected = !!account
  const address = account?.address
  const { user, loading, signIn, signOut, isAuthenticated } = useSIWE()
  const { success, error } = useEnhancedToast()
  const [step, setStep] = useState<'connect' | 'sign' | 'complete'>('connect')

  useEffect(() => {
    if (isConnected && !isAuthenticated && showSignMessage) {
      setStep('sign')
    } else if (isAuthenticated) {
      setStep('complete')
    } else {
      setStep('connect')
    }
  }, [isConnected, isAuthenticated, showSignMessage])

  const handleSignIn = async () => {
    try {
      await signIn()
      success('Successfully authenticated!')
      setStep('complete')
    } catch (err: any) {
      error(err.message || 'Authentication failed')
    }
  }

  const handleDisconnect = () => {
    disconnect()
    signOut()
    setStep('connect')
    success('Wallet disconnected')
  }

  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white', borderRadius: '1rem', padding: '2rem',
        maxWidth: '400px', width: '90%', maxHeight: '80vh', overflow: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>{title}</h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#6b7280'
          }}>×</button>
        </div>

        {step === 'connect' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔗</div>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Connect your wallet to access BeatsChain features
              </p>
            </div>
            <w3m-button />
            <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#6b7280' }}>
              <p>Supported wallets: MetaMask, WalletConnect, Coinbase Wallet</p>
            </div>
          </div>
        )}

        {step === 'sign' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                Sign Message
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                Sign a message to verify wallet ownership and complete authentication
              </p>
              <div style={{
                background: '#f3f4f6', padding: '0.75rem', borderRadius: '0.5rem',
                fontSize: '0.875rem', color: '#374151', marginBottom: '1rem'
              }}>
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
            <button
              onClick={handleSignIn}
              disabled={loading}
              style={{
                background: loading ? '#9ca3af' : '#3b82f6',
                color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem', fontWeight: '600', width: '100%', marginBottom: '1rem'
              }}
            >
              {loading ? 'Signing...' : 'Sign Message'}
            </button>
            <button
              onClick={handleDisconnect}
              style={{
                background: 'none', border: '1px solid #d1d5db', color: '#6b7280',
                padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                fontSize: '0.875rem'
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        )}

        {step === 'complete' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#10b981' }}>
                Wallet Connected
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                You're now authenticated and ready to use BeatsChain
              </p>
              <div style={{
                background: '#ecfdf5', border: '1px solid #d1fae5', padding: '0.75rem',
                borderRadius: '0.5rem', fontSize: '0.875rem', color: '#065f46', marginBottom: '1rem'
              }}>
                {user?.address?.slice(0, 6)}...{user?.address?.slice(-4)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1, background: '#3b82f6', color: 'white', padding: '0.75rem',
                  border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
                  fontSize: '1rem', fontWeight: '600'
                }}
              >
                Continue
              </button>
              <button
                onClick={handleDisconnect}
                style={{
                  background: 'none', border: '1px solid #d1d5db', color: '#6b7280',
                  padding: '0.75rem 1rem', borderRadius: '0.5rem', cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}