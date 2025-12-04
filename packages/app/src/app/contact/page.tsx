'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { toast } from 'react-toastify'
import { client, urlFor } from '@/lib/sanity'
import CmsHeroSection from '@/components/HeroSection'
import Web3ContactForm from '@/components/Web3ContactForm'

export default function ContactPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <ContactPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ContactPageContent() {
  const account = useActiveAccount(); const address = account?.address; const isConnected = !!account
  const { user } = useUnifiedAuth()
  const [heroData, setHeroData] = useState(null)
  
  // Load hero data from Sanity
  useState(() => {
    async function fetchHeroData() {
      if (!client) return
      try {
        const data = await client.fetch(`*[_type == "page" && slug.current == "contact"][0].heroSection`)
        if (data) setHeroData(data)
      } catch (error) {
        console.error('Error loading hero data:', error)
      }
    }
    fetchHeroData()
  })

  const handleSubmitSuccess = () => {
    toast.success('🔐 Message sent successfully!')
  }

  return (
    <div>
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📞 Contact BeatsChain
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
              Get in touch with our team for support, partnerships, or general inquiries
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                🚀 24/7 Support
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                🌍 Global Team
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                🔒 Secure Platform
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        {/* Contact Info */}
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>
            Get in Touch
          </h2>
          
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Admin Contact
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              <strong>Bhekithemba Simelane (Uncle Smesh)</strong>
            </p>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Platform Administrator
            </p>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              📧 info@unamifoundation.org
            </p>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              📱 072 700 2502
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Address
            </h3>
            <p style={{ color: '#6b7280' }}>
              1033 Section 1<br/>
              Madadeni, 2951<br/>
              South Africa
            </p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Platform Info
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Blockchain: Ethereum Network
            </p>
            <p style={{ color: '#6b7280', marginBottom: '0.5rem' }}>
              Smart Contracts: Verified & Audited
            </p>
            <p style={{ color: '#6b7280' }}>
              Support: 24/7 Community Discord
            </p>
          </div>
        </div>

        {/* Web3 Contact Form */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
              {isConnected ? '🔐 Web3 Contact Form' : '📧 Contact Form'}
            </h2>
          </div>
          
          {/* Sanity-styled Web3 Contact Form */}
          <Web3ContactForm onSubmitSuccess={handleSubmitSuccess} />
        </div>
      </div>

        {/* Additional Info */}
        <div style={{
          background: '#f0f9ff',
          padding: '2rem',
          borderRadius: '0.5rem',
          border: '1px solid #0ea5e9'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#0c4a6e' }}>
            Web3 Platform Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', color: '#0c4a6e' }}>
            <div>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Blockchain:</strong> Ethereum Mainnet
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Token Standard:</strong> ERC-721 (NFTs)
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                <strong>Payment Methods:</strong> ETH, BeatNFT Credits
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Smart Contract:</strong> Verified & Open Source
              </p>
              <p style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Royalties:</strong> Automatic Distribution
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                <strong>Security:</strong> Multi-sig Protected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}