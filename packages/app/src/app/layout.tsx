import '@/lib/polyfills'
import type { Metadata, Viewport } from 'next'
import { PropsWithChildren } from 'react'
import { SITE_DESCRIPTION, SITE_EMOJI, SITE_INFO, SITE_NAME, SITE_URL, SOCIAL_TWITTER, SOCIAL_INSTAGRAM, SOCIAL_LINKEDIN } from '@/utils/site'
import { Layout } from '@/components/Layout'
import { SimpleAuthProvider } from '@/context/SimpleAuthContext'
import { Web3Provider } from '@/context/Web3Provider'
import { Web3DataProvider } from '@/context/Web3DataContext'
import { SIWEProvider } from '@/context/SIWEContext'
import { UnifiedAuthProvider } from '@/context/UnifiedAuthContext'
import { NotificationProvider } from '@/context/NotificationsEnhanced'
import { PurchaseProvider } from '@/context/PurchaseContext'
import { ClientOnly } from '@/components/ClientOnly'
import { BeatMetadataSync } from '@/components/BeatMetadataSync'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import SuperAdminSetup from '@/components/SuperAdminSetup'
import { Toaster } from 'react-hot-toast'

import '../assets/globals.css'

export const metadata: Metadata = {
  applicationName: 'BeatsChain',
  title: {
    default: 'BeatsChain - Web3 Music Marketplace',
    template: 'BeatsChain - %s',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://beatschain.app'),
  description: 'Web3 beat marketplace where SA producers sell beats as NFTs. Buy beats with crypto, own them forever, earn automatic royalties. BeatNFT credit system.',
  keywords: ['beats', 'beatnft', 'web3 beats', 'nft beats', 'crypto beats', 'beat marketplace', 'south africa producers', 'hip hop beats', 'trap beats', 'amapiano beats', 'afrobeats', 'blockchain beats', 'beat ownership', 'crypto payments', 'beat royalties'],
  authors: [{ name: 'BeatsChain Team' }],
  creator: 'BeatsChain',
  publisher: 'BeatsChain',
  manifest: '/manifest.json',
  appleWebApp: {
    title: 'BeatsChain',
    capable: true,
    statusBarStyle: 'black-translucent',
  },
  openGraph: {
    type: 'website',
    title: 'BeatsChain - Web3 Beat Marketplace',
    siteName: 'BeatsChain',
    description: 'Web3 beat marketplace - Buy beats as NFTs with crypto. BeatNFT credits, automatic royalties, true beat ownership. SA producers, global reach.',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://beatschain.app',
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://beatschain.app'}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: 'BeatsChain - Web3 Beat Marketplace',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@BeatsChain',
    creator: '@BeatsChain',
    title: 'BeatsChain - Web3 Beat Marketplace',
    description: 'Web3 beat marketplace - Buy beats as NFTs with crypto. BeatNFT credits, automatic royalties, true beat ownership. SA producers, global reach.',
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://beatschain.app'}/opengraph-image`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890123456',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  height: 'device-height',
  initialScale: 1.0,
  viewportFit: 'cover',
  themeColor: '#000000',
}

export default function RootLayout(props: PropsWithChildren) {
  // Remove server-side cookie handling to prevent static generation issues
  const cookies = null

  return (
    <html lang='en'>
      <head>
        <link rel='icon' href='/favicon.ico' />
        <link rel='icon' href='/favicon.svg' type='image/svg+xml' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />


        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <script src="https://accounts.google.com/gsi/client" async defer></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                  .then(registration => console.log('SW registered:', registration))
                  .catch(error => console.log('SW registration failed:', error))
              })
            }
          `
        }} />
        <style>{`
          body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
          .btn { display: inline-flex; align-items: center; justify-content: center; padding: 0.5rem 1rem; font-size: 0.875rem; font-weight: 500; border-radius: 0.375rem; transition: all 0.2s; border: none; cursor: pointer; }
          .btn-primary { background-color: #2563eb; color: white; }
          .btn-primary:hover { background-color: #1d4ed8; }
          .btn-secondary { background-color: #e5e7eb; color: #1f2937; }
          .btn-secondary:hover { background-color: #d1d5db; }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </head>

      <body>
        <ClientOnly fallback={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh',
            fontSize: '18px',
            color: '#666'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                fontSize: '2rem',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}>🎫</div>
              Loading BeatsChain...
            </div>
          </div>
        }>
          <Web3Provider cookies={cookies}>
            <Web3DataProvider>
              <SimpleAuthProvider>
                <SIWEProvider>
                  <UnifiedAuthProvider>
                    <NotificationProvider>
                      <PurchaseProvider>
                        <BeatMetadataSync />
                        <SuperAdminSetup />
                        <Layout>{props.children}</Layout>
                        <CookieConsentBanner />
                        <PWAInstallPrompt />
                        <Toaster position="top-right" />
                      </PurchaseProvider>
                    </NotificationProvider>
                  </UnifiedAuthProvider>
                </SIWEProvider>
              </SimpleAuthProvider>
            </Web3DataProvider>
          </Web3Provider>
        </ClientOnly>
        
        {/* Google Tag Manager */}
        {process.env.NEXT_PUBLIC_GTM_ID && (
          <>
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                  new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                  j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                  'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                  })(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_ID}');
                `,
              }}
            />
            <noscript>
              <iframe
                src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_ID}`}
                height="0"
                width="0"
                style={{ display: 'none', visibility: 'hidden' }}
              />
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}
