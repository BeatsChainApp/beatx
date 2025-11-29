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
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <span className="text-2xl font-bold text-indigo-600 mr-2">⛓️</span>
                <span className="text-xl font-bold text-gray-900">BeatsChain</span>
              </Link>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
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
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {/* Mobile Simplified Auth */}
            <div className="px-4 py-2">
              <SimplifiedWalletConnect />
            </div>
            
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
                    className={`mobile-nav-link ${
                      pathname === item.link
                        ? 'mobile-nav-link-active'
                        : 'mobile-nav-link-inactive'
                    }`}
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
          </div>
        </div>
      )}
            {user?.role === 'admin' && (
          <Link href="/admin" className="nav-link">
            👑 Admin
          </Link>
        )}
      </nav>
  )
}