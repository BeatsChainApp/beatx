'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import ProducerDashboardStats from '@/components/ProducerDashboardStats'
import BeatAnalytics from '@/components/BeatAnalytics'
import ProducerCollaboration from '@/components/ProducerCollaboration'
import MarketingTools from '@/components/MarketingTools'
import ProducerProfileSection from '@/components/ProducerProfileSection'
import EarningsOverview from '@/components/EarningsOverview'
import QuickActions from '@/components/QuickActions'
import BeatManagementTable from '@/components/BeatManagementTable'
import DashboardLayout from '@/components/DashboardLayout'
import BeatManagementSystem from '@/components/BeatManagementSystem'
import TransactionHistory from '@/components/TransactionHistory'
import DashboardHero from '@/components/DashboardHero'

interface ProducerStats {
  totalEarnings: number
  totalSales: number
  totalPlays: number
  monthlyEarnings: number
}

function DashboardContent() {
  return (
    <ResponsiveWrapper pageType="dashboard">
      <DashboardHero pageSlug="dashboard" />
      
      <div className="dashboard-main">
        {/* Quick Actions */}
        <div className="mb-6">
          <QuickActions />
        </div>
        
        {/* Earnings Overview */}
        <div className="mb-6">
          <EarningsOverview />
        </div>
        
        {/* Producer Profile Section */}
        <div id="profile-section" className="mb-6">
          <ProducerProfileSection />
        </div>
        
        {/* Beat Management Section */}
        <div className="mb-6">
          <BeatManagementSystem />
        </div>
        
        {/* Legacy Stats (keeping for compatibility) */}
        <div className="mb-6">
          <ProducerDashboardStats />
        </div>
        
        {/* Transaction History Section */}
        <div className="mb-6">
          <h2 className="mobile-heading font-bold mb-4">Transaction History</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <TransactionHistory />
          </div>
        </div>
        
        {/* Beat Analytics Section */}
        <div className="mb-6">
          <BeatAnalytics />
        </div>
        
        {/* Producer Collaboration Section */}
        <div className="mb-6">
          <ProducerCollaboration />
        </div>
        
        {/* Marketing Tools Section */}
        <div className="mb-6">
          <MarketingTools />
        </div>
      </div>
      
      {/* Dashboard Sidebar */}
      <div className="dashboard-sidebar">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h3 className="font-semibold mb-3">Quick Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Beats</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>Total Earnings</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex justify-between">
              <span>This Month</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  )
}

export default function DashboardPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={['producer', 'admin', 'super_admin']}>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </UniversalLayout>
  )
}