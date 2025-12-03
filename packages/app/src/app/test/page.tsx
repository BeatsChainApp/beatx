'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'

export default function TestPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <TestPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function TestPageContent() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 mobile-heading">🚀 BeatsChain Web3</h1>
        <p className="text-gray-600 mb-6">Web3 migration is working!</p>
        <div className="space-y-2 text-sm text-gray-500">
          <p>✅ Next.js app running</p>
          <p>✅ Web3 contexts loaded</p>
          <p>✅ IPFS integration ready</p>
          <p>✅ SIWE authentication ready</p>
        </div>
      </div>
    </div>
  )
}