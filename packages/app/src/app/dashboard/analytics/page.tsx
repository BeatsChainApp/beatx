'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import DashboardLayout from '@/components/DashboardLayout'
import BeatAnalytics from '@/components/BeatAnalytics'

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
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">📊 Analytics</h1>
        <BeatAnalytics />
      </div>
    </DashboardLayout>
  )
}