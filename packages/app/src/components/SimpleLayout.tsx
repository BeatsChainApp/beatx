'use client'

import React, { PropsWithChildren, useState } from 'react'
import NotificationCenter from './NotificationCenter'

import AuthModal from './AuthModal'
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth'

export function SimpleLayout(props: PropsWithChildren) {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean, mode: 'signin' | 'signup' }>({ isOpen: false, mode: 'signin' })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, user, signOut } = useUnifiedAuth()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Responsive Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '1rem 2rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>
            BeatsChain
          </div>
          
          {/* Desktop Navigation */}
          <nav style={{ display: 'flex', gap: '2rem', alignItems: 'center' }} className="desktop-nav">
            <a href="/" style={{ color: '#6b7280', textDecoration: 'none' }}>Home</a>
            <a href="/marketplace" style={{ color: '#6b7280', textDecoration: 'none' }}>Marketplace</a>
            <a href="/producers" style={{ color: '#6b7280', textDecoration: 'none' }}>Producers</a>
            <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none' }}>Dashboard</a>
            <a href="/upload" style={{ color: '#6b7280', textDecoration: 'none' }}>Upload</a>
            <a href="/profile" style={{ color: '#6b7280', textDecoration: 'none' }}>Profile</a>
            <a href="/blog" style={{ color: '#6b7280', textDecoration: 'none' }}>Blog</a>
            <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none' }}>Contact</a>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <NotificationCenter />
              {user ? (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                    {user?.displayName || user.email}
                  </span>
                  <button 
                    style={{
                      background: 'white',
                      color: '#dc2626',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #dc2626',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={signOut}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    style={{
                      background: 'white',
                      color: '#3b82f6',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #3b82f6',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                  >
                    Sign In
                  </button>
                  <button 
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}
                    onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#1f2937'
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'white',
            borderBottom: '1px solid #e5e7eb',
            padding: '1rem 2rem',
            zIndex: 50
          }} className="mobile-nav">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="/" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Home</a>
              <a href="/marketplace" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Marketplace</a>
              <a href="/producers" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Producers</a>
              <a href="/dashboard" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Dashboard</a>
              <a href="/upload" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Upload</a>
              <a href="/profile" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Profile</a>
              <a href="/blog" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Blog</a>
              <a href="/contact" style={{ color: '#6b7280', textDecoration: 'none', padding: '0.5rem 0' }}>Contact</a>
              
              <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {user ? (
                  <>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {user?.displayName || user.email}
                    </span>
                    <button 
                      style={{
                        background: 'white',
                        color: '#dc2626',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #dc2626',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onClick={signOut}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      style={{
                        background: 'white',
                        color: '#3b82f6',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #3b82f6',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        marginBottom: '0.5rem'
                      }}
                      onClick={() => setAuthModal({ isOpen: true, mode: 'signin' })}
                    >
                      Sign In
                    </button>
                    <button 
                      style={{
                        background: '#3b82f6',
                        color: 'white',
                        padding: '0.75rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onClick={() => setAuthModal({ isOpen: true, mode: 'signup' })}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>
            </div>
          </nav>
        )}
      </header>
      


      {/* Main Content */}
      <main style={{ flex: 1 }}>
        {props.children}
      </main>
      


      {/* Expanded Footer */}
      <footer style={{
        background: '#1f2937',
        color: 'white',
        padding: '3rem 0 2rem',
        marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '2rem' }} className="footer-grid">
            {/* Company Info */}
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>BeatsChain</h3>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                Connecting South African producers with global artists through blockchain technology.
              </p>
              <p style={{ color: '#d1d5db', fontSize: '0.875rem' }}>
                1033 Section 1, Madadeni, 2951<br/>
                South Africa
              </p>
            </div>
            
            {/* Platform */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="/marketplace" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Marketplace</a>
                <a href="/producers" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Producers</a>
                <a href="/upload" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Upload Beats</a>
                <a href="/dashboard" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Dashboard</a>
              </div>
            </div>
            
            {/* Resources */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>Resources</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="/blog" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Blog</a>
                <a href="/api/rss" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>RSS Feed</a>
                <a href="/contact" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Contact</a>
                <a href="/disclaimer" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Web3 Disclaimer</a>
              </div>
            </div>
            
            {/* Legal */}
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '1rem' }}>Legal</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <a href="/terms" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Terms of Use</a>
                <a href="/privacy" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Privacy Policy</a>
                <a href="/disclaimer" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Risk Disclaimer</a>
                <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>POPIA Compliant</span>
              </div>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div style={{ borderTop: '1px solid #374151', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', flexDirection: 'column' }} className="footer-bottom">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#d1d5db' }}>
                &copy; 2025 BeatsChain. Powered by Ethereum blockchain.
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: '#9ca3af' }}>
                <span>🇿🇦 Made in South Africa</span>
                <span>•</span>
                <span>⛓️ Web3 Native</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }} className="social-links">
              <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Follow us:</span>
              <a href="https://twitter.com/beatschain" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Twitter</a>
              <a href="https://discord.gg/beatschain" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Discord</a>
              <a href="https://instagram.com/beatschain" style={{ color: '#d1d5db', textDecoration: 'none', fontSize: '0.875rem' }}>Instagram</a>
            </div>
          </div>
          
          {/* Compliance Notice */}
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#374151', borderRadius: '0.375rem' }}>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#d1d5db', textAlign: 'center' }}>
              ⚠️ Cryptocurrency trading involves risk. BeatsChain is not a financial advisor. 
              Users must comply with local regulations including SARB and FICA requirements. 
              Only invest what you can afford to lose.
            </p>
          </div>
        </div>
      </footer>
      
      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-nav {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
        }
        @media (max-width: 640px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
            gap: 1.5rem !important;
          }
        }
        @media (min-width: 768px) {
          .footer-bottom {
            flex-direction: row !important;
          }
          .social-links {
            justify-content: flex-end !important;
          }
        }
      `}</style>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        mode={authModal.mode}
      />
    </div>
  )
}