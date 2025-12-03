'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import DashboardLayout from '@/components/DashboardLayout'
import EarningsOverview from '@/components/EarningsOverview'

export default function EarningsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <EarningsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function EarningsPageContent() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">💰 Earnings</h1>
        <EarningsOverview />
      </div>
    </DashboardLayout>
  )
}