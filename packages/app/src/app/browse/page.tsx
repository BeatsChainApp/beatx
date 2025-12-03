'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BrowseRedirect() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BrowseRedirectContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BrowseRedirectContent() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/beatnfts')
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to BeatNFTs marketplace...</p>
      </div>
    </div>
  )
}