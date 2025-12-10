'use client'

import { ReactNode } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import SessionGate from './SessionGate'
import AuthDebug from './AuthDebug'
import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

interface UniversalLayoutProps {
  children: ReactNode
  requireAuth?: boolean
  requireWallet?: boolean
  allowedRoles?: string[]
  permissions?: string[]
  className?: string
}

export default function UniversalLayout({
  children,
  requireAuth = false,
  requireWallet = false,
  allowedRoles,
  permissions,
  className = ''
}: UniversalLayoutProps) {
  const auth = useUnifiedAuth()

  // Base responsive container
  const containerClass = `
    min-h-screen w-full
    mobile-container
    ${className}
  `.trim()

  // No auth required - render directly
  if (!requireAuth && !requireWallet && !allowedRoles && !permissions) {
    return (
      <div className={containerClass}>
        {children}
      </div>
    )
  }
  
  // PRIORITY: Check email authentication first
  if (requireAuth && !auth.isAuthenticated) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📧</div>
            <h2 className="text-2xl font-bold mb-2">Email Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please sign in with your email to continue</p>
            <div className="space-y-4">
              <ConnectButton client={client} />
              <p className="text-xs text-gray-400">Connect wallet to continue</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check role permissions
  if (allowedRoles && !auth.hasAnyRole(allowedRoles)) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
            <p className="text-gray-600">Required role: {allowedRoles.join(' or ')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Check specific permissions
  if (permissions && !permissions.every(p => auth.hasPermission(p))) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">Permission Required</h2>
            <p className="text-gray-600">Missing permissions: {permissions.join(', ')}</p>
          </div>
        </div>
      </div>
    )
  }

  // Use SessionGate for auth/wallet requirements (email prioritized)
  return (
    <SessionGate requireWallet={requireWallet && auth.isAuthenticated}>
      <div className={containerClass}>
        {children}
        <AuthDebug />
      </div>
    </SessionGate>
  )
}