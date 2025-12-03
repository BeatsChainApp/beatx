'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
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
    <div>
      <DashboardHero pageSlug="dashboard" />
      
      <div className="container mx-auto px-4 py-8">
      
      {/* Quick Actions */}
      <div className="mb-8">
        <QuickActions />
      </div>
      
      {/* Earnings Overview */}
      <div className="mb-8">
        <EarningsOverview />
      </div>
      
      {/* Producer Profile Section */}
      <div id="profile-section" className="mb-8">
        <ProducerProfileSection />
      </div>
      
      {/* Beat Management Section */}
      <div className="mb-8">
        <BeatManagementSystem />
      </div>
      
      {/* Legacy Stats (keeping for compatibility) */}
      <div className="mb-8">
        <ProducerDashboardStats />
      </div>
      
      {/* Transaction History Section */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Transaction History</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <TransactionHistory />
        </div>
      </div>
      
      {/* Beat Analytics Section */}
      <div className="mt-8">
        <BeatAnalytics />
      </div>
      
      {/* Producer Collaboration Section */}
      <div className="mt-8">
        <ProducerCollaboration />
      </div>
      
      {/* Marketing Tools Section */}
      <div className="mt-8">
        <MarketingTools />
      </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}