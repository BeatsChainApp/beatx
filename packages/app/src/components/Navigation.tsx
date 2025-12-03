'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LinkComponent } from './LinkComponent'
import { useNavigation } from '@/hooks/useNavigation'
import { usePathname } from 'next/navigation'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import SimplifiedWalletConnect from './SimplifiedWalletConnect'
import '@/styles/navigation.css'

export default function Navigation() {
  const { mainNav, loading } = useNavigation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, isAuthenticated } = useUnifiedAuth()

  // Fallback navigation items if Sanity data isn't available
  const fallbackNavItems = isAuthenticated ? [
    { label: 'BeatNFTs', link: '/beatnfts', icon: '🎫' },
    { label: 'Producers', link: '/producers', icon: '👨‍🎤' },
    { label: 'Dashboard', link: '/dashboard', icon: '📊' },
  ] : [
    { label: 'BeatNFTs', link: '/beatnfts', icon: '🎫' },
    { label: 'Producers', link: '/producers', icon: '👨‍🎤' },
  ]

  // Use Sanity navigation or fallback
  const navigationItems = mainNav?.length > 0 ? mainNav : fallbackNavItems

  if (loading) return <div className="h-20 bg-white border-b border-gray-200"></div>

  return (
    <nav className="sticky-header bg-white border-b border-gray-200">
      <div className="mobile-container">
        <div className="nav-responsive h-16 sm:h-20">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600 mr-2">⛓️</span>
                <span className="text-xl font-bold text-gray-900">BeatsChain</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="nav-links hidden sm:flex">
              {/* Simplified Auth Button */}
              <div className="flex items-center mr-4">
                <SimplifiedWalletConnect />
              </div>
              
              {navigationItems.map((item) => (
                <div key={item.label} className="relative group">
                  {item.isExternal ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`nav-link ${
                        pathname === item.link
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                      }`}
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      {item.label}
                    </a>
                  ) : (
                    <LinkComponent
                      href={item.link}
                      className={`nav-link ${
                        pathname === item.link
                          ? 'nav-link-active'
                          : 'nav-link-inactive'
                      }`}
                    >
                      {item.icon && <span className="nav-icon">{item.icon}</span>}
                      {item.label}
                    </LinkComponent>
                  )}

                  {/* Dropdown for items with children */}
                  {item.children && item.children.length > 0 && (
                    <div className="absolute z-10 hidden group-hover:block pt-2 w-48">
                      <div className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                        {item.children.map((child) => (
                          <div key={child.label}>
                            {child.isExternal ? (
                              <a
                                href={child.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {child.label}
                              </a>
                            ) : (
                              <LinkComponent
                                href={child.link}
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                {child.label}
                              </LinkComponent>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center gap-2">
            {/* Mobile user indicator */}
            {user && (
              <div className="text-xs bg-gray-100 px-2 py-1 rounded">
                {user.role === 'super_admin' ? '👑' : 
                 user.role === 'admin' ? '🛡️' : 
                 user.role === 'producer' ? '🎵' : '👤'}
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="touch-target inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="screen-reader-only">Open main menu</span>
              <span className="text-xl">{mobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-200">
          <div className="py-3 space-y-1">
            {/* Mobile Simplified Auth */}
            <div className="px-4 py-2 border-b border-gray-100">
              <SimplifiedWalletConnect />
            </div>
            
            {/* User info for mobile */}
            {user && (
              <div className="px-4 py-2 bg-gray-50 text-sm">
                <div className="flex items-center gap-2">
                  <span>{user.role === 'super_admin' ? '👑' : 
                         user.role === 'admin' ? '🛡️' : 
                         user.role === 'producer' ? '🎵' : '👤'}</span>
                  <span className="font-medium">{user.displayName}</span>
                  <span className="text-gray-500">({user.role})</span>
                </div>
              </div>
            )}
            
            {navigationItems.map((item) => (
              <div key={item.label}>
                {item.isExternal ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mobile-nav-link ${
                      pathname === item.link
                        ? 'mobile-nav-link-active'
                        : 'mobile-nav-link-inactive'
                    }`}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </a>
                ) : (
                  <LinkComponent
                    href={item.link}
                    className={`touch-link block px-4 py-3 text-base font-medium ${
                      pathname === item.link
                        ? 'text-purple-600 bg-purple-50 border-r-4 border-purple-600'
                        : 'text-gray-700 hover:text-purple-600 hover:bg-gray-50'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.icon && <span className="mr-2">{item.icon}</span>}
                    {item.label}
                  </LinkComponent>
                )}
                
                {/* Mobile dropdown */}
                {item.children && item.children.length > 0 && (
                  <div className="pl-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <div key={child.label}>
                        {child.isExternal ? (
                          <a
                            href={child.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block pl-3 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            {child.label}
                          </a>
                        ) : (
                          <LinkComponent
                            href={child.link}
                            className="block pl-3 pr-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          >
                            {child.label}
                          </LinkComponent>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {/* Admin/Dashboard links for mobile */}
            {user && (
              <div className="border-t border-gray-200 pt-2">
                {(user.role === 'admin' || user.role === 'super_admin') && (
                  <LinkComponent
                    href="/admin"
                    className="touch-link block px-4 py-3 text-base font-medium text-red-600 hover:bg-red-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    👑 Admin Dashboard
                  </LinkComponent>
                )}
                {(user.role === 'producer' || user.role === 'admin' || user.role === 'super_admin') && (
                  <LinkComponent
                    href="/dashboard"
                    className="touch-link block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    📊 Producer Dashboard
                  </LinkComponent>
                )}
                <LinkComponent
                  href="/profile"
                  className="touch-link block px-4 py-3 text-base font-medium text-gray-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  👤 Profile
                </LinkComponent>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}