'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useOnboarding } from '@/components/OnboardingProvider'

export default function GetStartedButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { startOnboarding, completed } = useOnboarding()

  const handleGetStarted = async () => {
    setLoading(true)
    // Route new users to the dedicated onboarding page; keep dashboard for completed users
    if (!completed) {
      router.push('/onboarding')
    } else {
      router.push('/dashboard')
    }
    
    setLoading(false)
  }

  return (
    <button
      onClick={handleGetStarted}
      disabled={loading}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
    >
      {loading ? 'Loading...' : 'Get Started'}
    </button>
  )
}