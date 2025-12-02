'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GetStartedButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleGetStarted = async () => {
    setLoading(true)
    
    // Check if user has completed onboarding
    const hasOnboarded = localStorage.getItem('onboarding_completed')
    
    if (!hasOnboarded) {
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