'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import DashboardLayout from '@/components/DashboardLayout'
import EnhancedBeatManagement from '@/components/EnhancedBeatManagement'

export default function BeatsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <BeatsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BeatsPageContent() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">🎵 My Beats</h1>
        <EnhancedBeatManagement />
      </div>
    </DashboardLayout>
  )
}