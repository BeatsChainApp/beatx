'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// This page is deprecated - admin access is now handled by UnifiedAuth
// Redirect to main admin dashboard
export default function AdminSetupPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminSetupPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminSetupPageContent() {
  const router = useRouter()
  
  useEffect(() => {
    router.push('/admin')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 mobile-heading">🔄</div>
        <p className="text-gray-600">Redirecting to admin dashboard...</p>
      </div>
    </div>
  )
}