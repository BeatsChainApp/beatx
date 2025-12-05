'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

export default function AdminSetupPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="admin">
        <AdminSetupPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminSetupPageContent() {
  const [loading, setLoading] = useState(false)
  const { user, isAuthenticated } = useUnifiedAuth()
  const router = useRouter()
  
  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      const { googleAuth } = await import('@/lib/googleAuth')
      await googleAuth.initialize()
      await googleAuth.signIn()
      window.location.reload()
    } catch (error) {
      console.error('Google sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // If already authenticated as admin, redirect
  useEffect(() => {
    if (isAuthenticated && user?.role === 'super_admin') {
      router.push('/admin')
    }
  }, [isAuthenticated, user, router])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🛡️</div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Super Admin Setup</h1>
            <p className="text-gray-600">Sign in with admin email to access admin panel</p>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : '🔐 Sign in with Google'}
            </button>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Admin Emails:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• info@unamifoundation.org</li>
              <li>• admin@beatschain.app</li>
              <li>• support@beatschain.app</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}