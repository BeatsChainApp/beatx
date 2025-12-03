'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardSelector() {
  const { user, loading } = useUnifiedAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/signin')
      return
    }

    // Route to appropriate dashboard based on role
    switch (user.role) {
      case 'super_admin':
      case 'admin':
        router.push('/admin')
        break
      case 'producer':
        router.push('/dashboard')
        break
      default:
        router.push('/profile')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🎵</div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}