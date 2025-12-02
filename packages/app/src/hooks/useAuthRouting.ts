'use client'

import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext''
import { useEffect } from 'react'

export function useUnifiedAuthRouting() {
  const router = useRouter()
  const { user, hasRole, isAuthenticated } = useUnifiedAuth()

  const routeAfterAuth = (selectedRole?: string) => {
    // Priority 1: Super admin email gets admin access
    if (firebaseUser?.email === 'info@unamifoundation.org') {
      router.push('/admin')
      return
    }

    // Priority 2: Check unified auth roles
    if (hasRole('super_admin') || hasRole('admin')) {
      router.push('/admin')
      return
    }

    // Priority 3: Route based on selected role or user role
    if (selectedRole) {
      switch (selectedRole) {
        case 'music_lover':
          router.push('/beatnfts')
          break
        case 'producer':
          router.push('/dashboard')
          break
        case 'content_creator':
          router.push('/creator-dashboard')
          break
        default:
          router.push('/beatnfts')
      }
      return
    }

    // Priority 4: Route based on existing user role
    if (hasRole('producer')) {
      router.push('/dashboard')
    } else {
      router.push('/beatnfts')
    }
  }

  // Auto-route admin users who sign in with Google
  useEffect(() => {
    if (isAuthenticated && firebaseUser?.email === 'info@unamifoundation.org') {
      // Small delay to ensure auth state is fully updated
      setTimeout(() => {
        if (window.location.pathname === '/') {
          router.push('/admin')
        }
      }, 1000)
    }
  }, [isAuthenticated, firebaseUser?.email, router])

  return { routeAfterAuth }
}