'use client'

import { ReactNode } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface ResponsiveWrapperProps {
  children: ReactNode
  pageType?: 'dashboard' | 'auth' | 'public' | 'admin' | 'upload'
  className?: string
}

export default function ResponsiveWrapper({ 
  children, 
  pageType = 'public',
  className = '' 
}: ResponsiveWrapperProps) {
  const { user } = useUnifiedAuth()

  const getPageClasses = () => {
    const baseClasses = 'page-wrapper'
    
    switch (pageType) {
      case 'dashboard':
        return `${baseClasses} dashboard-layout ${className}`
      case 'auth':
        return `${baseClasses} flex items-center justify-center ${className}`
      case 'admin':
        return `${baseClasses} admin-layout ${className}`
      case 'upload':
        return `${baseClasses} upload-container ${className}`
      default:
        return `${baseClasses} ${className}`
    }
  }

  return (
    <div className={getPageClasses()}>
      {/* Mobile navigation indicator */}
      <div className="sm:hidden fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 to-pink-600 z-50" />
      
      {/* User status indicator for mobile */}
      {user && (
        <div className="sm:hidden fixed top-1 right-4 z-40">
          <div className="bg-white rounded-full px-2 py-1 text-xs shadow-sm">
            {user.role === 'super_admin' ? '👑' : 
             user.role === 'admin' ? '🛡️' : 
             user.role === 'producer' ? '🎵' : '👤'}
          </div>
        </div>
      )}
      
      {children}
    </div>
  )
}