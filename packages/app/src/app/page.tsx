'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { usePlatformStats } from '@/hooks/usePlatformStats'
import { useActiveAccount } from "thirdweb/react"
import { client } from '@/lib/sanity'
import CmsHeroSection from '@/components/HeroSection'
import RecommendedBeats from '@/components/RecommendedBeats'
import MobileNavigation from '@/components/MobileNavigation'

export default function Home() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <HomeContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function HomeContent() {
  const { totalBeats, totalUsers, totalRevenue, isLoading } = usePlatformStats()
  const account = useActiveAccount(); const isConnected = !!account
  const [beatNFTStats, setBeatNFTStats] = useState({
    totalCreditsIssued: 0,
    activeUsers: 0,
    proNFTHolders: 0
  })
  const [heroData, setHeroData] = useState(null)

  useEffect(() => {
    // Load real-time BeatNFT stats
    const loadBeatNFTStats = () => {
      if (typeof window === 'undefined') return
      
      try {
        const allKeys = Object.keys(localStorage).filter(key => key.startsWith('beatnft_balance_'))
        let totalIssued = 0
        let activeUsers = 0
        let proHolders = 0

        allKeys.forEach(key => {
          try {
            const balance = JSON.parse(localStorage.getItem(key) || '{}')
            if (balance.credits !== undefined) {
              totalIssued += (balance.credits + balance.totalUsed)
              activeUsers++
              if (balance.hasProNFT) {
                proHolders++
              }
            }
          } catch (e) {
            // Skip invalid entries
          }
        })

        // Add marketing credits
        const marketingIssued = parseInt(localStorage.getItem('marketing_credits_issued') || '0')
        totalIssued += marketingIssued

        setBeatNFTStats({
          totalCreditsIssued: totalIssued,
          activeUsers,
          proNFTHolders: proHolders
        })
      } catch (error) {
        console.error('Error loading BeatNFT stats:', error)
      }
    }

    loadBeatNFTStats()
    const interval = setInterval(loadBeatNFTStats, 30000) // Update every 30 seconds
    
    // Load hero section from CMS
    async function loadHeroData() {
      if (!client) return
      try {
        const data = await client.fetch(`*[_type == "page" && slug.current == "home"][0].heroSection`)
        if (data) setHeroData(data)
      } catch {}
    }
    loadHeroData()
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <div>
      {/* Admin Setup Helper - Only show when wallet is connected */}
      {isConnected && (
        <div className="container mx-auto px-4 py-4 mobile-container">
    
        </div>
      )}
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1 }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', lineHeight: '1.1' }}>
                The Future of Music
                <br />
                <span style={{ color: '#fbbf24' }}>Beats NFTs</span>
              </h1>
              <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto 3rem' }}>
                Discover, buy, and sell beats as NFTs. Own your beats, earn royalties forever.
              </p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a
                  href='/marketplace'
                  style={{
                    background: '#fbbf24',
                    color: '#1f2937',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🎵 Explore Beats
                </a>
                <a
                  href='/dashboard'
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                    fontWeight: '600',
                    fontSize: '1.125rem',
                    border: '2px solid rgba(255,255,255,0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  🚀 Start Selling
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 10 Free BeatNFT Credits Section - Directly Below Hero */}
      <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '1rem' }}>
            🎁 Get Started with 10 FREE BeatNFT Credits!
          </h2>
          <p style={{ fontSize: '1.25rem', color: 'white', marginBottom: '2rem', opacity: 0.9 }}>
            Every new producer gets 10 free credits to start uploading beats immediately
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎵</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                MP3 Upload
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                1 credit per MP3 beat
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎧</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                WAV Upload
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                2 credits per WAV beat
              </p>
            </div>
            
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              padding: '2rem',
              borderRadius: '1rem',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📦</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'white', marginBottom: '0.5rem' }}>
                ZIP Package
              </h3>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.875rem' }}>
                3-5 credits per ZIP bundle
              </p>
            </div>
          </div>
          
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '2rem',
            borderRadius: '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
            marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: 'white', marginBottom: '1rem' }}>
              ♾️ Upgrade to Pro BeatNFT for Unlimited Uploads
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginBottom: '1.5rem' }}>
              Get unlimited uploads in any format for just 0.1 ETH (~$250)
            </p>
            <a
              href='/manage-subscription'
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                color: '#1f2937',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem',
                display: 'inline-block'
              }}
            >
              🚀 Upgrade to Pro BeatNFT
            </a>
          </div>
          
          <a
            href='/dashboard'
            style={{
              background: 'white',
              color: '#059669',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem',
              display: 'inline-block'
            }}
          >
            🎁 Claim Your Free Credits
          </a>
        </div>
      </div>
      
      {/* Features Section */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Why Choose BeatsChain?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#6b7280', maxWidth: '600px', margin: '0 auto' }}>
            The first decentralized marketplace built specifically for beat creators and artists
          </p>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              background: '#f3e8ff',
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              🔒
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              True Ownership
            </h3>
            <p style={{ color: '#6b7280' }}>
              Own your beats as NFTs with blockchain-verified ownership and provenance
            </p>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              background: '#dbeafe',
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              💰
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Automatic Royalties
            </h3>
            <p style={{ color: '#6b7280' }}>
              Earn royalties forever with smart contracts that pay you on every resale
            </p>
          </div>
          
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: 'white',
            borderRadius: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              background: '#dcfce7',
              width: '4rem',
              height: '4rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              fontSize: '1.5rem'
            }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Instant Payments
            </h3>
            <p style={{ color: '#6b7280' }}>
              Get paid instantly with cryptocurrency - no waiting for payment processors
            </p>
          </div>
        </div>
      </div>
      
      {/* Real-time Stats Section */}
      <div style={{ background: '#1f2937', color: 'white', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {isLoading ? '...' : totalBeats}
              </div>
              <div style={{ fontSize: '1.125rem', opacity: 0.8 }}>Beats Available</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {isLoading ? '...' : totalUsers}
              </div>
              <div style={{ fontSize: '1.125rem', opacity: 0.8 }}>Registered Users</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>
                R{isLoading ? '...' : totalRevenue.toFixed(0)}
              </div>
              <div style={{ fontSize: '1.125rem', opacity: 0.8 }}>Total Revenue</div>
            </div>
            <div>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#fbbf24' }}>
                {beatNFTStats.totalCreditsIssued.toLocaleString()}
              </div>
              <div style={{ fontSize: '1.125rem', opacity: 0.8 }}>Free BeatNFTs Allocated</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1rem' }}>
            Ready to Revolutionize Your Beats?
          </h2>
          <p style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '2rem', opacity: 0.8 }}>
            Join the future of beat ownership and start earning today
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href='/marketplace'
              style={{
                background: '#1f2937',
                color: 'white',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem'
              }}
            >
              🎵 Explore Marketplace
            </a>
            <a
              href='/dashboard'
              style={{
                background: 'rgba(31,41,55,0.1)',
                color: '#1f2937',
                padding: '1rem 2rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '1.125rem',
                border: '2px solid #1f2937'
              }}
            >
              🚀 Start Creating
            </a>
          </div>
        </div>
      </div>
      
      {/* Recommended Beats Section */}
      {isConnected && (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem' }}>
          <RecommendedBeats />
        </div>
      )}
      
      <MobileNavigation />
    </div>
  )
}