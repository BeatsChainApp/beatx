'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import { ReactNode } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useUserAccessControl } from '@/hooks/useUserAccessControl'
// Removed Reown AppKit - using Thirdweb

interface ProtectedRouteProps {
  children: ReactNode
  permission?: string
  role?: string
  anyRole?: string[]
  fallback?: ReactNode
  requireWallet?: boolean
}

export default function ProtectedRoute({ 
  children, 
  permission, 
  role, 
  anyRole, 
  fallback,
  requireWallet = false 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, hasPermission, hasRole, hasAnyRole, wallet, signIn } = useUnifiedAuth()
  const { isSuspended, suspensionReason, loading: suspensionLoading } = useUserAccessControl()

  if (loading || suspensionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Check if user is suspended
  if (isAuthenticated && isSuspended) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-4">🚫</div>
            <h1 className="text-4xl font-bold mb-4">Account Suspended</h1>
            <p className="text-xl opacity-90">Your account has been suspended by an administrator</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Suspension Notice</h2>
              <div className="bg-red-50 p-6 rounded-lg mb-6">
                <p className="text-red-700 text-lg mb-2">
                  <strong>Reason:</strong> {suspensionReason}
                </p>
                <p className="text-red-700 text-sm">
                  <strong>Account:</strong> {user?.address}
                </p>
              </div>
              <div className="text-gray-600 mb-6">
                <p className="mb-4">Your account access has been restricted. To appeal this decision:</p>
                <ul className="text-left space-y-2">
                  <li>• Contact support with your wallet address</li>
                  <li>• Provide context for the suspension reason</li>
                  <li>• Wait for administrator review</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <a 
                  href="/"
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium inline-block"
                >
                  🏠 Home
                </a>
                <a href="mailto:support@beatschain.com" className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 font-medium">
                  📧 Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // PRIORITY: Check email authentication first
  if (!isAuthenticated) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 max-w-md">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Authentication Required</h2>
          <p className="text-gray-600 mb-6">Sign in with your email to access this area.</p>
          <div className="space-y-4">
            <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
              🔐 Sign in with Google
            </button>
            <div className="text-sm text-gray-500">or</div>
            <ConnectButton client={client} />
            <p className="text-xs text-gray-400">Wallet connection is optional</p>
          </div>
        </div>
      </div>
    )
  }

  // SECONDARY: Optional wallet requirement (only if explicitly needed AND authenticated)
  if (requireWallet && isAuthenticated && !wallet.isConnected) {
    return fallback || (
      <div>
        {/* Hero Section */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔗</div>
            <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Wallet Connection Recommended
            </h1>
            <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2rem' }}>
              Connect your wallet for blockchain features like NFT minting
            </p>
            <div style={{ background: 'rgba(255,255,255,0.1)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
              <p style={{ fontSize: '1rem' }}>Your wallet enables Web3 features in the music marketplace</p>
            </div>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <ConnectButton client={client} />
              <button 
                onClick={() => window.location.reload()}
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', cursor: 'pointer' }}
              >
                Continue without wallet
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check specific permission
  if (permission && !hasPermission(permission)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-4">🚫</div>
            <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
            <p className="text-xl opacity-90">You don't have permission to access this feature</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Permission Required</h2>
              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <p className="text-blue-700 text-lg mb-2">
                  <strong>Required:</strong> <code className="bg-blue-100 px-3 py-1 rounded text-sm">{permission}</code>
                </p>
                <p className="text-blue-700 text-lg">
                  <strong>Your Role:</strong> <code className="bg-blue-100 px-3 py-1 rounded text-sm">{user?.role || 'None'}</code>
                </p>
              </div>
              <div className="text-gray-600 mb-6">
                <p className="mb-4">To access this feature, you need specific permissions. Here's how to get access:</p>
                <ul className="text-left space-y-2">
                  <li>• Contact an administrator for role upgrade</li>
                  <li>• Check if you're signed in with the correct account</li>
                  <li>• Ensure your wallet is connected</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ← Go Back
                </button>
                <a href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
                  🏠 Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check specific role
  if (role && !hasRole(role)) {
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-4">👮‍♂️</div>
            <h1 className="text-4xl font-bold mb-4">Role Required</h1>
            <p className="text-xl opacity-90">This area requires a specific role to access</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Level Required</h2>
              <div className="bg-purple-50 p-6 rounded-lg mb-6">
                <p className="text-purple-700 text-lg mb-2">
                  <strong>Required Role:</strong> <code className="bg-purple-100 px-3 py-1 rounded text-sm">{role}</code>
                </p>
                <p className="text-purple-700 text-lg">
                  <strong>Your Role:</strong> <code className="bg-purple-100 px-3 py-1 rounded text-sm">{user?.role || 'None'}</code>
                </p>
              </div>
              <div className="text-gray-600 mb-6">
                <p className="mb-4">You need a higher access level to view this content. Consider:</p>
                <ul className="text-left space-y-2">
                  <li>• Upgrading your account type in Profile settings</li>
                  <li>• Contacting support for role verification</li>
                  <li>• Ensuring you're logged in correctly</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ← Go Back
                </button>
                <a href="/profile" className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 font-medium">
                  👤 Profile
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Check any of multiple roles
  if (anyRole && !hasAnyRole(anyRole)) {
    console.log('Access denied - Required roles:', anyRole, 'User role:', user?.role)
    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="text-8xl mb-4">🎭</div>
            <h1 className="text-4xl font-bold mb-4">Authorized Roles Only</h1>
            <p className="text-xl opacity-90">This area requires one of several authorized roles</p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Multiple Role Access</h2>
              <div className="bg-indigo-50 p-6 rounded-lg mb-6">
                <p className="text-indigo-700 text-lg mb-2">
                  <strong>Accepted Roles:</strong>
                </p>
                <div className="flex flex-wrap gap-2 justify-center mb-3">
                  {anyRole.map(r => (
                    <code key={r} className="bg-indigo-100 px-3 py-1 rounded text-sm">{r}</code>
                  ))}
                </div>
                <p className="text-indigo-700 text-lg">
                  <strong>Your Role:</strong> <code className="bg-indigo-100 px-3 py-1 rounded text-sm">{user?.role || 'None'}</code>
                </p>
              </div>
              <div className="text-gray-600 mb-6">
                <p className="mb-4">You need one of the authorized roles to access this area:</p>
                <ul className="text-left space-y-2">
                  <li>• Switch to an authorized role in your Profile</li>
                  <li>• Request role upgrade from an administrator</li>
                  <li>• Verify your account permissions</li>
                </ul>
              </div>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => window.history.back()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-medium"
                >
                  ← Go Back
                </button>
                <a href="/profile" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium">
                  👤 Update Role
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}