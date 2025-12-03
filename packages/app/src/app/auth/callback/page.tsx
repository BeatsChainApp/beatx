'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export default function AuthCallback() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="auth">
        <AuthCallbackContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AuthCallbackContent() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const code = searchParams.get('code')
    
    if (code) {
      exchangeCodeForUser(code)
    } else {
      const error = searchParams.get('error')
      console.error('Auth error:', error)
      window.close()
    }
  }, [searchParams])

  const exchangeCodeForUser = async (code: string) => {
    try {
      // Exchange code for user data via Google OAuth API
      const response = await fetch(`https://oauth2.googleapis.com/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
          client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
          redirect_uri: `${window.location.origin}/auth/callback`,
          grant_type: 'authorization_code',
        }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to exchange code for token')
      }
      
      const tokenData = await response.json()
      
      // Get user info
      const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokenData.access_token}`)
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user info')
      }
      
      const userData = await userResponse.json()
      
      // Store user data
      localStorage.setItem('google_auth_result', JSON.stringify({
        sub: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture || '',
        verified_email: userData.verified_email || false
      }))
      
      // Trigger success event
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', userData }, window.location.origin)
      window.close()
    } catch (error) {
      console.error('Auth callback error:', error)
      window.opener?.postMessage({ type: 'GOOGLE_AUTH_ERROR', error: error.message }, window.location.origin)
      window.close()
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}