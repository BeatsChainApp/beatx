'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity'
import CmsHeroSection from '@/components/HeroSection'

export default function GuidePage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <GuidePageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function GuidePageContent() {
  const [activeTab, setActiveTab] = useState('getting-started')
  const [heroData, setHeroData] = useState(null)
  
  useEffect(() => {
    async function fetchHeroData() {
      if (!client) return
      try {
        const data = await client.fetch(`*[_type == "page" && slug.current == "guide"][0].heroSection`)
        if (data) setHeroData(data)
      } catch {}
    }
    fetchHeroData()
  }, [])

  const tabs = [
    { id: 'getting-started', label: '🚀 Getting Started', icon: '🚀' },
    { id: 'producers', label: '🎵 For Producers', icon: '🎵' },
    { id: 'creators', label: '🎬 Content Creators', icon: '🎬' },
    { id: 'buyers', label: '🛒 For Buyers', icon: '🛒' },
    { id: 'credits', label: '🎫 Credits System', icon: '🎫' },
    { id: 'troubleshooting', label: '🔧 Help', icon: '🔧' }
  ]

  return (
    <div>
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 50%, #581c87 100%)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)', animation: 'pulse 4s ease-in-out infinite' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '2rem', padding: '3rem', border: '1px solid rgba(255,255,255,0.2)' }}>
              <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem', background: 'linear-gradient(45deg, #ffffff, #e0e7ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                📚 BeatsChain Complete Guide
              </h1>
              <p style={{ fontSize: '1.5rem', opacity: 0.9, marginBottom: '2rem', lineHeight: '1.6' }}>
                Master the world's first Web3 beat marketplace - From upload to trading
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎵</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Beat Production</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Content Creation</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💎</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Credit Trading</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⛓️</div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>Web3 Trading</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <a href="/upload" style={{
                  background: 'linear-gradient(45deg, #fbbf24, #f59e0b)', color: '#1f2937', padding: '1rem 2rem',
                  borderRadius: '1rem', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem',
                  boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)', transition: 'all 0.3s ease',
                  transform: 'translateY(0)', ':hover': { transform: 'translateY(-2px)' }
                }}>🎵 Upload Beat</a>
                <a href="/beatnfts" style={{
                  background: 'rgba(255,255,255,0.15)', color: 'white', padding: '1rem 2rem',
                  borderRadius: '1rem', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem',
                  border: '2px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}>🎧 Browse Beats</a>
                <a href="/credit-market" style={{
                  background: 'rgba(139, 92, 246, 0.3)', color: 'white', padding: '1rem 2rem',
                  borderRadius: '1rem', textDecoration: 'none', fontWeight: '700', fontSize: '1.1rem',
                  border: '2px solid rgba(139, 92, 246, 0.5)', backdropFilter: 'blur(10px)',
                  transition: 'all 0.3s ease'
                }}>💎 Credit Market</a>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.5rem', 
          marginBottom: '2rem',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '1rem'
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : '#f3f4f6',
                color: activeTab === tab.id ? 'white' : '#374151',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ fontSize: '1rem', lineHeight: '1.7', color: '#374151' }}>
          
          {/* Getting Started Tab */}
          {activeTab === 'getting-started' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🚀 Getting Started
              </h2>
              <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                  1. Connect Your Wallet
                </h3>
                <p>Connect your Web3 wallet (MetaMask, WalletConnect) to start using BeatsChain. Your wallet is your identity on the platform.</p>
              </div>
              
              <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#059669' }}>
                  2. Get Free BeatNFT Credits
                </h3>
                <p>New users receive 10 free BeatNFT credits to start uploading beats. Each credit allows specific upload types.</p>
              </div>
            </section>
          )}

          {/* For Producers Tab */}
          {activeTab === 'producers' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🎵 For Beat Producers
              </h2>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Upload Credits System
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li><strong>MP3 uploads:</strong> 1 BeatNFT credit (preview/demo quality)</li>
                <li><strong>WAV uploads:</strong> 2 BeatNFT credits (studio-ready quality)</li>
                <li><strong>ZIP packages:</strong> 3-5 BeatNFT credits (stems/trackouts)</li>
                <li><strong>Pro BeatNFT:</strong> Unlimited uploads (0.1 ETH ~R1,800 one-time)</li>
              </ul>

              <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <p><strong>💡 Pro Tip:</strong> Always include your stage name - it appears on all your beats and helps build your brand identity.</p>
              </div>
            </section>
          )}

          {/* Content Creators Tab */}
          {activeTab === 'creators' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🎬 Content Creators Guide
              </h2>
              
              <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                  🎆 Creator Preview Access
                </h3>
                <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                  <li><strong>Platinum Creators (1M+ followers):</strong> Full beat previews, unlimited</li>
                  <li><strong>Gold Creators (100K+ followers):</strong> Full beat previews, unlimited</li>
                  <li><strong>Silver Creators (10K+ followers):</strong> Full beat previews, unlimited</li>
                  <li><strong>Bronze Creators (1K+ followers):</strong> Full previews with 50K+ audience proof</li>
                  <li><strong>Regular Users:</strong> 30-second preview limit</li>
                </ul>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                💰 Revenue Opportunities
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#dcfce7', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#047857' }}>License Negotiations</h4>
                  <p style={{ fontSize: '0.875rem', color: '#065f46' }}>Negotiate custom licensing terms with producers</p>
                </div>
                <div style={{ background: '#fef3c7', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#92400e' }}>Viral Content Bonuses</h4>
                  <p style={{ fontSize: '0.875rem', color: '#78350f' }}>Earn bonuses when your content goes viral</p>
                </div>
                <div style={{ background: '#ddd6fe', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#5b21b6' }}>BeatNFT Trading</h4>
                  <p style={{ fontSize: '0.875rem', color: '#4c1d95' }}>Buy and trade BeatNFTs for exclusive content</p>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🎯 Content Use Cases
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li><strong>YouTube Videos:</strong> Background music, intros, outros</li>
                <li><strong>TikTok/Instagram:</strong> Trending sounds, original content</li>
                <li><strong>Podcasts:</strong> Intro/outro music, transition sounds</li>
                <li><strong>Live Streaming:</strong> Background music, alerts, transitions</li>
                <li><strong>Brand Campaigns:</strong> Sponsored content, advertisements</li>
                <li><strong>Gaming Content:</strong> Stream overlays, highlight reels</li>
              </ul>

              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <h4 style={{ fontWeight: '600', color: '#dc2626', marginBottom: '0.5rem' }}>Platform Verification Required</h4>
                <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>Connect your social media accounts (YouTube, TikTok, Instagram) to verify follower count and unlock creator benefits.</p>
              </div>
            </section>
          )}

          {/* For Buyers Tab */}
          {activeTab === 'buyers' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🛒 For Beat Buyers
              </h2>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                What You Get
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li><strong>NFT Ownership:</strong> Blockchain-verified ownership certificate</li>
                <li><strong>Usage Rights:</strong> Commercial use according to license terms</li>
                <li><strong>Full Files:</strong> High-quality audio files for production</li>
                <li><strong>Stems (if included):</strong> Individual track layers for mixing</li>
                <li><strong>Resale Rights:</strong> Can resell NFT with automatic royalties to producer</li>
              </ul>
            </section>
          )}

          {/* Use Cases Tab */}
          {activeTab === 'use-cases' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🎯 Beat Use Cases
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                <div style={{ background: '#fef3c7', padding: '2rem', borderRadius: '1rem', border: '2px solid #f59e0b' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#92400e' }}>
                    🎤 Recording Artists
                  </h3>
                  <ul style={{ paddingLeft: '1.5rem', color: '#92400e' }}>
                    <li>Professional studio recordings</li>
                    <li>Album and EP production</li>
                    <li>Demo tracks and mixtapes</li>
                    <li>Commercial music releases</li>
                    <li>Streaming platform uploads</li>
                  </ul>
                </div>
                
                <div style={{ background: '#ddd6fe', padding: '2rem', borderRadius: '1rem', border: '2px solid #8b5cf6' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#5b21b6' }}>
                    📱 Content Creators
                  </h3>
                  <ul style={{ paddingLeft: '1.5rem', color: '#5b21b6' }}>
                    <li>YouTube video backgrounds</li>
                    <li>TikTok and Instagram content</li>
                    <li>Podcast intros and outros</li>
                    <li>Live streaming music</li>
                    <li>Social media campaigns</li>
                  </ul>
                </div>
                
                <div style={{ background: '#dcfce7', padding: '2rem', borderRadius: '1rem', border: '2px solid #10b981' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#047857' }}>
                    🏢 Record Labels
                  </h3>
                  <ul style={{ paddingLeft: '1.5rem', color: '#047857' }}>
                    <li>Artist development projects</li>
                    <li>Compilation albums</li>
                    <li>Sync licensing opportunities</li>
                    <li>A&R scouting and demos</li>
                    <li>Commercial music production</li>
                  </ul>
                </div>
                
                <div style={{ background: '#fce7f3', padding: '2rem', borderRadius: '1rem', border: '2px solid #ec4899' }}>
                  <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem', color: '#be185d' }}>
                    🎬 Media & Advertising
                  </h3>
                  <ul style={{ paddingLeft: '1.5rem', color: '#be185d' }}>
                    <li>Commercial advertisements</li>
                    <li>Film and TV soundtracks</li>
                    <li>Corporate video content</li>
                    <li>Gaming background music</li>
                    <li>Brand campaign music</li>
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Credit System Tab */}
          {activeTab === 'credits' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🎫 BeatNFT Credit System
              </h2>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#1f2937' }}>10 Credits</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>0.01 ETH (~R180)</p>
                </div>
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#1f2937' }}>25 Credits</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>0.02 ETH (~R360)</p>
                </div>
                <div style={{ background: '#f3f4f6', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#1f2937' }}>50 Credits</h4>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>0.035 ETH (~R630)</p>
                </div>
                <div style={{ background: '#ddd6fe', padding: '1rem', borderRadius: '0.5rem' }}>
                  <h4 style={{ fontWeight: '600', color: '#5b21b6' }}>Pro BeatNFT</h4>
                  <p style={{ fontSize: '0.875rem', color: '#7c3aed' }}>0.1 ETH (~R1,800) - Unlimited</p>
                </div>
              </div>

              <div style={{ background: '#fef2f2', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
                <p><strong>⚠️ Important:</strong> Credits are consumed upon successful upload. Failed uploads don't consume credits.</p>
              </div>
            </section>
          )}

          {/* Troubleshooting Tab */}
          {activeTab === 'troubleshooting' && (
            <section>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                🔧 Troubleshooting
              </h2>
              
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
                Common Issues
              </h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                <li><strong>Upload failed:</strong> Check file format (MP3, WAV, ZIP) and size limits</li>
                <li><strong>Insufficient credits:</strong> Purchase more BeatNFT credits or upgrade to Pro BeatNFT</li>
                <li><strong>Preview not playing:</strong> Check browser audio permissions and file format</li>
                <li><strong>Wallet connection issues:</strong> Refresh page and reconnect wallet</li>
                <li><strong>Transaction failed:</strong> Check ETH balance for gas fees</li>
              </ul>

              <div style={{ background: '#f0f9ff', padding: '1rem', borderRadius: '0.5rem' }}>
                <p><strong>💬 Need Help?</strong> Contact support through the platform or join our community Discord for assistance.</p>
              </div>
            </section>
          )}

          {/* Call to Action */}
          <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', marginTop: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>
              Ready to Start?
            </h3>
            <p style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Connect your wallet and get your free BeatNFT credits to begin your journey on BeatsChain.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a
                href="/upload"
                style={{
                  background: '#3b82f6',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                🎵 Upload Beat
              </a>
              <a
                href="/beatnfts"
                style={{
                  background: '#10b981',
                  color: 'white',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '0.375rem',
                  textDecoration: 'none',
                  fontWeight: '600'
                }}
              >
                🎧 Browse Beats
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}