'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity-client'

interface WalletConnectConfig {
  title: string
  buttonText: string
  buttonStyle: {
    backgroundColor: string
    textColor: string
    borderRadius: string
    padding: string
    fontSize: string
    fontWeight: string
    customClass?: string
  }
  showIcon: boolean
  icon: string
  isActive: boolean
}

interface SanityWalletConnectProps {
  placement: 'header' | 'hero' | 'sidebar' | 'footer'
  className?: string
}

export default function SanityWalletConnect({ placement, className = '' }: SanityWalletConnectProps) {
  const [config, setConfig] = useState<WalletConnectConfig | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWalletConfig() {
      try {
        const data = await client.fetch(`
          *[_type == "walletConnect" && placement == $placement && isActive == true][0]
        `, { placement })
        
        if (data) {
          setConfig(data)
        }
      } catch (error) {
        console.error('Error fetching wallet connect config:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchWalletConfig()
  }, [placement])

  if (loading || !config) {
    // Default wallet connect button
    return <ConnectButton client={client} />
  }

  const buttonStyle = {
    backgroundColor: config.buttonStyle?.backgroundColor || '#4F46E5',
    color: config.buttonStyle?.textColor || '#FFFFFF',
    borderRadius: config.buttonStyle?.borderRadius || '8px',
    padding: config.buttonStyle?.padding || '10px 20px',
    fontSize: config.buttonStyle?.fontSize || '16px',
    fontWeight: config.buttonStyle?.fontWeight || '600',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    border: 'none',
    outline: 'none',
  }

  // This is a wrapper around the Web3Modal button
  // The actual connection functionality is handled by the Web3Modal library
  return (
    <div className={`sanity-wallet-connect ${className} ${config.buttonStyle?.customClass || ''}`}>
      <ConnectButton client={client} />
    </div>
  )
}