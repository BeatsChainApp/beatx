'use client'

import React, { useState, useEffect } from 'react'
import { LinkComponent } from './LinkComponent'
import { Connect } from './Connect'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import NotificationCenter from './NotificationCenter'
import SmartNavigation from './SmartNavigation'
import SanityNavigation from './SanityNavigation'
import { getSiteSettings, urlFor } from '@/lib/sanity-client'

export function Header() {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [logo, setLogo] = useState<any>(null)
  const [logoMobile, setLogoMobile] = useState<any>(null)
  
  // Load logo from Sanity
  useEffect(() => {
    async function loadLogo() {
      try {
        const settings = await getSiteSettings()
        if (settings?.logo) setLogo(settings.logo)
        if (settings?.logoMobile) setLogoMobile(settings.logoMobile)
      } catch (error) {
        console.error('Error loading logo:', error)
      }
    }
    loadLogo()
  }, [])
  
  // Close dropdowns when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuOpen && !(event.target as Element).closest('.relative')) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])
  
  const { user, isAuthenticated, signOut } = useUnifiedAuth()

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 relative z-40">
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <LinkComponent href="/">
            {logo ? (
              <>
                <img 
                  src={urlFor(logo).width(240).height(80).url()} 
                  alt={logo.alt || "BeatsChain"} 
                  className="h-8 hidden sm:block" 
                />
                <img 
                  src={logoMobile ? urlFor(logoMobile).width(40).height(40).url() : urlFor(logo).width(40).height(40).url()} 
                  alt={logo.alt || "BeatsChain"} 
                  className="h-8 sm:hidden" 
                />
              </>
            ) : (
              <h1 className="text-2xl font-bold text-gray-900">BeatsChain</h1>
            )}
          </LinkComponent>

          {/* Right Side */}
          <div className="flex items-center gap-1 sm:gap-4">
            <NotificationCenter />
            <Connect />
            
            {user && (
              <div className="relative">
                <button 
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 hover:text-gray-900 p-1"
                >
                  {user?.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-600">
                        {(user?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span className="hidden sm:inline max-w-24 truncate">{user?.name || 'User'}</span>
                  <span className="sm:hidden max-w-16 truncate text-xs">{user?.name ? user.name.slice(0, 6) + '...' : 'User'}</span>
                  <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 sm:mt-2 w-40 sm:w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="py-1 sm:py-2">
                      <LinkComponent href="/dashboard" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                        Dashboard
                      </LinkComponent>
                      <LinkComponent href="/library" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                        My Library
                      </LinkComponent>
                      <LinkComponent href="/profile" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </LinkComponent>
                      <LinkComponent href="/creator-dashboard" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-purple-700 hover:bg-purple-50">
                        🎨 Creator Dashboard
                      </LinkComponent>
                      {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <LinkComponent href="/admin" className="block px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-700 hover:bg-gray-100">
                          Admin Panel
                        </LinkComponent>
                      )}
                      <div className="border-t border-gray-200 mt-1 sm:mt-2 pt-1 sm:pt-2">
                        <button 
                          onClick={signOut}
                          className="block w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 hover:bg-gray-100"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      
      {/* Sanity-powered Navigation */}
      <SanityNavigation />

      {/* No longer needed here - moved to RoleSelectionModal */}
    </>
  )
}
