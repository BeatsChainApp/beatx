'use client'

import { useEffect, useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useRouter } from 'next/navigation'
import CampaignManager from '@/components/admin/CampaignManager'

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useUnifiedAuth()
  const router = useRouter()
  const [analytics, setAnalytics] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (!loading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin'))) {
      router.push('/dashboard')
      return
    }
    
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')) {
      loadAnalytics()
      loadCampaigns()
    }
  }, [user, isAuthenticated, loading, mounted])

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/analytics/dashboard`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error('Analytics load failed:', error)
    }
  }

  const loadCampaigns = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_MCP_SERVER_URL}/api/campaigns`)
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (error) {
      console.error('Campaigns load failed:', error)
    }
  }

  if (!mounted || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    return <div className="p-8">Access denied</div>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>👑 Admin Dashboard</h1>
      
      {/* Analytics Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ background: '#f0f9ff', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>📊 Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
            ${analytics?.totalRevenue || '0.00'}
          </p>
        </div>
        <div style={{ background: '#f0fdf4', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>🎵 Total Uploads</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {analytics?.totalUploads || '0'}
          </p>
        </div>
        <div style={{ background: '#fef3c7', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>📢 Active Campaigns</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
      </div>

      {/* Campaign Management */}
      <CampaignManager />
    </div>
  )
}