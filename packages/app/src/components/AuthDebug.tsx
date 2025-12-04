'use client'

import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useActiveAccount } from "thirdweb/react"

export default function AuthDebug() {
  const { user, isAuthenticated, hasRole, hasAnyRole } = useUnifiedAuth()
  const { address, isConnected } = useAccount()

  if (process.env.NODE_ENV === 'production') return null

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Auth Debug</h4>
      <div>Address: {address?.slice(0, 10)}...</div>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User Role: {user?.role || 'none'}</div>
      <div>Has Producer: {hasRole('producer') ? '✅' : '❌'}</div>
      <div>Has Admin: {hasRole('admin') ? '✅' : '❌'}</div>
      <div>Has Super Admin: {hasRole('super_admin') ? '✅' : '❌'}</div>
      <div>Can Upload: {hasAnyRole(['producer', 'admin', 'super_admin']) ? '✅' : '❌'}</div>
    </div>
  )
}