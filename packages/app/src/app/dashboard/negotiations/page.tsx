'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import DashboardLayout from '@/components/DashboardLayout'

export default function NegotiationsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <NegotiationsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function NegotiationsPageContent() {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">🤝 Negotiations</h1>
        <div className="bg-white rounded-lg p-8 text-center">
          <div className="text-6xl mb-4 mobile-heading">🤝</div>
          <h2 className="text-xl font-semibold mb-2">License Negotiations</h2>
          <p className="text-gray-600 mb-6">
            Manage your beat licensing negotiations and custom deals
          </p>
          <div className="text-sm text-gray-500">
            Coming soon - Advanced negotiation features
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}