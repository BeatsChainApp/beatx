'use client'

import { useEffect, useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

const SUPER_ADMIN_EMAIL = 'info@unamifoundation.org'

export default function SuperAdminSetup() {
  const { user: firebaseUser, user } = useUnifiedAuth()
  const { user: unifiedUser, hasRole } = useUnifiedAuth()
  const [showSetup, setShowSetup] = useState(false)

  useEffect(() => {
    // Show setup if user is signed in with super admin email but doesn't have super_admin role
    const isSuperAdminEmail = firebaseUser?.email === SUPER_ADMIN_EMAIL
    const hasAdminRole = hasRole('super_admin') || hasRole('admin')
    
    setShowSetup(isSuperAdminEmail && !hasAdminRole)
  }, [firebaseUser?.email, hasRole])

  const setupSuperAdmin = async () => {
    if (!firebaseUser) return

    try {
      // Update Firebase profile to admin role
      const adminProfile = {
        role: 'admin',
        isVerified: true,
        displayName: 'Super Admin',
        updatedAt: new Date()
      }

      // This will trigger UnifiedAuth to rebuild user with admin role
      await fetch('/api/admin/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          ...adminProfile
        })
      })

      alert('✅ Super admin access granted!')
      window.location.reload()
    } catch (error) {
      console.error('Super admin setup failed:', error)
      alert('❌ Setup failed. Please try again.')
    }
  }

  if (!showSetup) return null

  return (
    <div className="fixed top-4 right-4 bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-lg z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="text-2xl">🛡️</div>
        <div className="flex-1">
          <h3 className="font-semibold text-blue-800 mb-1">Super Admin Setup</h3>
          <p className="text-blue-700 text-sm mb-3">
            Welcome! Set up your super admin access for {SUPER_ADMIN_EMAIL}
          </p>
          <div className="flex gap-2">
            <button
              onClick={setupSuperAdmin}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
            >
              Grant Access
            </button>
            <button
              onClick={() => setShowSetup(false)}
              className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}