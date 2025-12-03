'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import AnalyticsDashboard from '@/components/AnalyticsDashboard'
import MarketInsights from '@/components/MarketInsights'
import UserJourneyAnalytics from '@/components/UserJourneyAnalytics'
import PredictiveInsights from '@/components/PredictiveInsights'
import AnalyticsExport from '@/components/AnalyticsExport'
import ProducerBeatsList from '@/components/ProducerBeatsList'
import { LinkComponent } from '@/components/LinkComponent'

function AnalyticsContent() {
  const { hasAnyRole } = useUnifiedAuth()

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            📊 Platform Analytics
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Real-time insights into beat performance and market trends
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <LinkComponent href="/dashboard" style={{ color: '#3b82f6' }}>
            ← Back to Dashboard
          </LinkComponent>
        </div>

        <AnalyticsDashboard />
        
        {/* Market Insights */}
        <MarketInsights />
        
        {/* User Journey Analytics */}
        <UserJourneyAnalytics />
        
        {/* Predictive Insights */}
        <PredictiveInsights />
        
        {/* Analytics Export */}
        <AnalyticsExport />
        
        {/* Producer Beat Analytics */}
        <ProducerBeatsList />
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <AnalyticsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AnalyticsPageContent() {
  return (
    <ProtectedRoute requireWallet={true}>
      <AnalyticsContent />
    </ProtectedRoute>
  )
}