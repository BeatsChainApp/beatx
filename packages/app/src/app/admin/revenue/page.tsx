'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useAdminAnalytics } from '@/hooks/useAdminAnalytics'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'

function AdminRevenueContent() {
  const { user } = useUnifiedAuth()
  const { analytics, loading } = useAdminAnalytics()
  const stats = {
    revenue: {
      total: parseFloat(analytics.platformStats.totalRevenue),
      averagePerSale: parseFloat(analytics.platformStats.averagePrice),
      monthlyGrowth: 0
    },
    overview: { totalPurchases: analytics.platformStats.totalSales }
  }



  return (
    <div>
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <h1 className="text-3xl font-bold mb-2 mobile-heading">💰 Revenue Tracking</h1>
          <LinkComponent href="/admin" className="text-white/80 hover:text-white">← Back to Admin</LinkComponent>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Revenue</h3>
              <div className="text-3xl font-bold text-green-600 mobile-heading">R{stats?.revenue?.total?.toLocaleString() || '0'}</div>
              <div className="text-sm text-green-600 mt-1">+{stats?.revenue?.monthlyGrowth || 0}% this month</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Total Sales</h3>
              <div className="text-3xl font-bold text-blue-600 mobile-heading">{stats?.overview?.totalPurchases || '0'}</div>
              <div className="text-sm text-gray-600 mt-1">Completed transactions</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Average Sale</h3>
              <div className="text-3xl font-bold text-purple-600 mobile-heading">R{stats?.revenue?.averagePerSale?.toFixed(2) || '0'}</div>
              <div className="text-sm text-gray-600 mt-1">Per transaction</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Platform Fee</h3>
              <div className="text-3xl font-bold text-orange-600 mobile-heading">R{((stats?.revenue?.total || 0) * 0.15).toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">15% commission</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow md:col-span-2 lg:col-span-4">
              <h3 className="font-semibold mb-4">Revenue Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mobile-heading">R{((stats?.revenue?.total || 0) * 0.85).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Producer Earnings (85%)</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mobile-heading">R{((stats?.revenue?.total || 0) * 0.15).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Platform Fee (15%)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mobile-heading">R{(stats?.revenue?.total || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Total Volume</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminRevenuePage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminRevenuePageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminRevenuePageContent() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']}>
      <AdminRevenueContent />
    </ProtectedRoute>
  )
}