'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useParams } from 'next/navigation'
import { LinkComponent } from '@/components/LinkComponent'
import BeatAnalyticsCard from '@/components/BeatAnalyticsCard'
import ProtectedRoute from '@/components/ProtectedRoute'

function BeatAnalyticsContent() {
  const params = useParams()
  const beatId = params.id as string

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        minHeight: '30vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            📊 Beat Analytics
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Detailed performance insights for your beat
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <LinkComponent href={`/beat/${beatId}`} style={{ color: '#10b981' }}>
            ← Back to Beat
          </LinkComponent>
        </div>

        <BeatAnalyticsCard beatId={beatId} />
      </div>
    </div>
  )
}

export default function BeatAnalyticsPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BeatAnalyticsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BeatAnalyticsPageContent() {
  return (
    <ProtectedRoute requireWallet={true}>
      <BeatAnalyticsContent />
    </ProtectedRoute>
  )
}