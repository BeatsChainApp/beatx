'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import CmsPage from '@/components/SanityPage'
import { usePlatformStats } from '@/hooks/usePlatformStats'

export default function SanityDemoPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <SanityDemoPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function SanityDemoPageContent() {
  const { totalBeats, totalUsers, totalRevenue, isLoading } = usePlatformStats()

  // Fallback content if Sanity page doesn't exist
  const fallback = (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
            Sanity CMS Demo
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '3rem', opacity: 0.9 }}>
            This page demonstrates Sanity CMS integration. Create a page with slug "sanity-demo" in Sanity Studio to see dynamic content.
          </p>
          <a
            href="/studio"
            style={{
              background: '#fbbf24',
              color: '#1f2937',
              padding: '1rem 2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '1.125rem'
            }}
          >
            Open Sanity Studio
          </a>
        </div>
      </div>

      {/* Real-time Stats Section */}
      <div style={{ background: '#1f2937', color: 'white', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '2rem' }}>
            Platform Statistics
          </h2>
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
          </div>
        </div>
      </div>
    </div>
  )

  return <CmsPage slug="sanity-demo" fallback={fallback} />
}