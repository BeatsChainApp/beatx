'use client'

import { useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface PurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  beat: {
    id: string
    title: string
    price: number
    producerId: string
  }
}

export default function PurchaseModal({ isOpen, onClose, beat }: PurchaseModalProps) {
  const [licenseType, setLicenseType] = useState<'basic' | 'premium' | 'exclusive'>('basic')
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'fiat'>('fiat')
  const { purchaseWithCrypto, purchaseWithFiat, processing, error } = usePayments()
  const { user } = useUnifiedAuth()

  if (!isOpen) return null

  const licenseOptions = {
    basic: { price: beat.price * 0.8, name: 'Basic License', description: 'For non-commercial use' },
    premium: { price: beat.price, name: 'Premium License', description: 'Commercial use allowed' },
    exclusive: { price: beat.price * 5, name: 'Exclusive License', description: 'Full ownership rights' }
  }

  const handlePurchase = async () => {
    if (!user) {
      alert('Please sign in to complete purchase')
      return
    }

    const purchaseData = {
      beatId: beat.id,
      price: licenseOptions[licenseType].price,
      licenseType,
      producerId: beat.producerId
    }

    try {
      if (paymentMethod === 'crypto') {
        // Check if wallet is connected for crypto payments
        if (!address) {
          alert('Please connect your wallet for crypto payments')
          return
        }
        await purchaseWithCrypto(purchaseData)
      } else {
        // Fiat payments don't require wallet
        await purchaseWithFiat(purchaseData)
      }
      onClose()
      alert('Purchase successful!')
    } catch (err: any) {
      console.error('Purchase failed:', err)
      alert(`Purchase failed: ${err.message}`)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '0.5rem',
        padding: '2rem',
        width: '100%',
        maxWidth: '500px',
        margin: '1rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            Purchase Beat
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: '#6b7280',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>
            {beat.title}
          </h3>
          <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
            Choose your license and payment method
          </p>
        </div>

        {/* License Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            License Type
          </label>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {Object.entries(licenseOptions).map(([key, option]) => (
              <label
                key={key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  border: `2px solid ${licenseType === key ? '#3b82f6' : '#e5e7eb'}`,
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  background: licenseType === key ? '#f0f9ff' : 'white'
                }}
              >
                <input
                  type="radio"
                  name="license"
                  value={key}
                  checked={licenseType === key}
                  onChange={(e) => setLicenseType(e.target.value as any)}
                  style={{ marginRight: '0.75rem' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500', color: '#1f2937' }}>{option.name}</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>${option.price}</span>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Payment Method */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
            Payment Method
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                border: `2px solid ${paymentMethod === 'fiat' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                background: paymentMethod === 'fiat' ? '#f0f9ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="payment"
                value="fiat"
                checked={paymentMethod === 'fiat'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ marginRight: '0.5rem' }}
              />
              💳 Card/PayPal
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                border: `2px solid ${paymentMethod === 'crypto' ? '#3b82f6' : '#e5e7eb'}`,
                borderRadius: '0.375rem',
                cursor: 'pointer',
                background: paymentMethod === 'crypto' ? '#f0f9ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="payment"
                value="crypto"
                checked={paymentMethod === 'crypto'}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                style={{ marginRight: '0.5rem' }}
              />
              ⚡ Crypto
            </label>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'white',
              color: '#6b7280',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePurchase}
            disabled={processing}
            style={{
              flex: 2,
              background: processing ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '0.75rem',
              border: 'none',
              borderRadius: '0.375rem',
              fontWeight: '500',
              cursor: processing ? 'not-allowed' : 'pointer'
            }}
          >
            {processing ? 'Processing...' : `Purchase for R${licenseOptions[licenseType].price}`}
          </button>
        </div>
      </div>
    </div>
  )
}