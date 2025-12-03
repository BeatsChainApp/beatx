'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { NextStudio } from 'next-sanity/studio'
import { useEffect, useState } from 'react'

export default function StudioPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <StudioPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function StudioPageContent() {
  const [config, setConfig] = useState(null)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const loadConfig = async () => {
      try {
        // Dynamic import to avoid build issues
        const configModule = await import('../../../../sanity.config')
        setConfig({
          ...configModule.default,
          basePath: '/studio'
        })
      } catch (err) {
        console.error('Failed to load Sanity config:', err)
        setError('Studio configuration not available')
      }
    }
    
    loadConfig()
  }, [])
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 mobile-heading">🎨 Studio</h1>
          <p className="text-gray-600 mb-4">Content management studio is being configured.</p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-blue-700 text-sm">Studio will be available once Sanity CMS is fully configured.</p>
          </div>
        </div>
      </div>
    )
  }
  
  if (!config) {
    return (
      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="text-center">
          <div className="text-4xl mb-4 mobile-heading">🎨</div>
          <p className="text-gray-600">Loading studio...</p>
        </div>
      </div>
    )
  }
  
  return <NextStudio config={config} />
}