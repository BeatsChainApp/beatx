'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardAudioPlayer from '@/components/DashboardAudioPlayer'
import BeatCard from '@/components/BeatCard'
import { useSupabase } from '@/hooks/useSupabase'

function AdminAnalyticsContent() {
  const { user } = useUnifiedAuth()
  const { analytics, loading } = useAdminAnalytics()
  const { isAvailable: supabaseAvailable, logSuccess } = useSupabase()
  const stats = {
    overview: {
      totalUsers: analytics.platformStats.totalUsers,
      totalBeats: analytics.platformStats.totalBeats,
      totalRevenue: parseFloat(analytics.platformStats.totalRevenue)
    },
    beats: { byGenre: {} }
  }



  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <h1 className="text-3xl font-bold mb-2 mobile-heading">📊 Platform Analytics</h1>
          <LinkComponent href="/admin" className="text-white/80 hover:text-white">← Back to Admin</LinkComponent>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Revenue Overview</h3>
              <div className="text-3xl font-bold text-green-600 mobile-heading">R{stats?.overview?.totalRevenue?.toLocaleString() || '0'}</div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">User Growth</h3>
              <div className="text-3xl font-bold text-blue-600 mobile-heading">{stats?.overview?.totalUsers || '0'}</div>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="font-semibold mb-4">Content Stats</h3>
              <div className="text-3xl font-bold text-purple-600 mobile-heading">{stats?.overview?.totalBeats || '0'}</div>
              <p className="text-sm text-gray-600">Total Beats</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-3">
              <h3 className="font-semibold mb-4">🎵 Top Performing Beats</h3>
              <div className="space-y-4">
                {analytics.topBeats?.slice(0, 5).map((beat: any) => (
                  <div key={beat.id} className="w-full">
                    <DashboardAudioPlayer 
                      beat={beat}
                      variant="analytics"
                      showMetrics={true}
                      className="mb-0"
                    />
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-2 mobile-heading">📊</div>
                    <p>No beat performance data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminAnalyticsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminAnalyticsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminAnalyticsPageContent() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  )
}