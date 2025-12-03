'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { LinkComponent } from '@/components/LinkComponent'
import { LoadingSpinner } from '@/components/LoadingStates'
import BeatAnalyticsCard from '@/components/BeatAnalyticsCard'
import Web3AudioPlayer from '@/components/Web3AudioPlayer'
import { dataProvider } from '@/adapters/unifiedDataProvider'
import { Beat } from '@/types/data'
import { ErrorBoundary } from 'react-error-boundary'
import { useBeatMetadataSync } from '@/hooks/useBeatMetadataSync'

// Fallback component for error boundary
const ErrorFallback = () => (
  <div style={{ 
    padding: '2rem', 
    margin: '1rem 0', 
    backgroundColor: '#FEF2F2', 
    borderRadius: '0.5rem',
    color: '#B91C1C',
    textAlign: 'center'
  }}>
    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
      Something went wrong loading data
    </h3>
    <p>We're still able to show basic beat information.</p>
  </div>
)

export default function BeatDetailPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BeatDetailPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BeatDetailPageContent() {
  const params = useParams()
  const beatId = params.id as string
  const [beat, setBeat] = useState<Beat | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareUrl, setShareUrl] = useState('')
  
  // Ensure beat metadata is synced for social sharing
  useBeatMetadataSync()
  
  useEffect(() => {
    async function loadBeat() {
      try {
        setLoading(true)
        
        // First try localStorage for local beats
        let beatData = null
        
        // Check localStorage for producer beats
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('producer_beats_')) {
            const beatsStr = localStorage.getItem(key)
            if (beatsStr) {
              const producerBeats = JSON.parse(beatsStr)
              beatData = producerBeats.find((b: any) => b.id === beatId)
              if (beatData) break
            }
          }
        }
        
        // Fallback to dataProvider if not found in localStorage
        if (!beatData) {
          beatData = await dataProvider.getBeat(beatId)
        }
        
        setBeat(beatData)
      } catch (error) {
        console.error('Error loading beat:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadBeat()
    
    // Set the URL on the client side
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [beatId])

  const shareText = beat ? `Check out "${beat.title}" by ${beat.producerName} on BeatsChain` : ''

  if (loading) return <LoadingSpinner />
  if (!beat) return <div>Beat not found</div>

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <LinkComponent href="/browse" style={{ color: '#3b82f6' }}>
            ← Back to Browse
          </LinkComponent>
        </div>

        <div style={{ 
          background: 'white', 
          borderRadius: '1rem', 
          padding: '2rem',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ 
              width: '200px', 
              height: '200px', 
              borderRadius: '0.5rem', 
              background: beat.coverImageUrl 
                ? `url(${beat.coverImageUrl})` 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '3rem'
            }}>
              {!beat.coverImageUrl && '🎵'}
            </div>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                {beat.title}
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#6b7280', marginBottom: '1rem' }}>
                by {beat.producerName}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {beat.genre}
                </span>
                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {beat.bpm} BPM
                </span>
                <span style={{ background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem' }}>
                  {beat.key}
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#059669' }}>
                {beat.price.toFixed(3)} ETH
              </p>
            </div>
          </div>

          {beat.description && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Description</h3>
              <p style={{ color: '#6b7280' }}>{beat.description}</p>
            </div>
          )}

          {/* Audio Player */}
          <div style={{ marginBottom: '2rem' }}>
            <Web3AudioPlayer 
              beat={beat}
              showWaveform={false}
            />
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '2rem', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Share this Beat</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#1da1f2',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                🐦 Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#4267b2',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                📘 Facebook
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#0077b5',
                  color: 'white',
                  padding: '0.5rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontSize: '0.875rem'
                }}
              >
                💼 LinkedIn
              </a>
            </div>
          </div>

          {/* Beat Analytics */}
          <BeatAnalyticsCard beatId={beatId} />
        </div>
      </div>
    </ErrorBoundary>
  )
}