'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminTransactionsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminTransactionsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminTransactionsPageContent() {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to the dashboard
    router.push('/admin/dashboard')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <div className="text-6xl mb-4 mobile-heading">💰</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Redirecting...</h2>
        <p className="text-gray-600 mb-6">This page has been moved to the admin dashboard.</p>
        <a 
          href="/admin/dashboard"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium inline-block"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  )
}