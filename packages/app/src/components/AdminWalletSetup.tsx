'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { toast } from 'react-toastify'

const SUPER_ADMIN_WALLETS = [
  '0xc84799a904eeb5c57abbbc40176e7db8be202c10'
]

const ADMIN_EMAILS = [
  'info@unamifoundation.org',
  'admin@beatschain.app',
  'support@beatschain.app'
]

export default function AdminWalletSetup() {
  const { user, wallet, isAuthenticated } = useUnifiedAuth()
  const { verification, setupAdminAccess, loading } = useAdminAuth()
  const [showSetup, setShowSetup] = useState(false)
  const [walletType, setWalletType] = useState<'regular' | 'admin' | 'super_admin'>('regular')

  useEffect(() => {
    if (!user || !isAuthenticated) {
      setShowSetup(false)
      return
    }

    // Determine wallet type
    let type: 'regular' | 'admin' | 'super_admin' = 'regular'
    
    if (wallet.address && SUPER_ADMIN_WALLETS.includes(wallet.address.toLowerCase())) {
      type = 'super_admin'
    } else if (user.email && ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      type = 'admin'
    }
    
    setWalletType(type)
    
    // Show setup if user has admin credentials but not admin role
    const hasAdminCredentials = type === 'admin' || type === 'super_admin'
    const hasAdminRole = user.role === 'admin' || user.role === 'super_admin'
    
    setShowSetup(hasAdminCredentials && !hasAdminRole)
  }, [user, wallet.address, isAuthenticated])

  const handleSetupAdmin = async () => {
    try {
      await setupAdminAccess()
      toast.success('✅ Admin access granted!')
      setShowSetup(false)
      
      // Reload page to refresh auth state
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Admin setup failed:', error)
      toast.error('❌ Admin setup failed. Please try again.')
    }
  }

  const getWalletTypeInfo = () => {
    switch (walletType) {
      case 'super_admin':
        return {
          icon: '👑',
          title: 'Super Admin Wallet',
          description: 'This wallet has super administrator privileges',
          color: 'purple'
        }
      case 'admin':
        return {
          icon: '🛡️',
          title: 'Admin Email',
          description: 'Your email has administrator privileges',
          color: 'blue'
        }
      default:
        return {
          icon: '👤',
          title: 'Regular User',
          description: 'Standard user access',
          color: 'gray'
        }
    }
  }

  const walletInfo = getWalletTypeInfo()

  if (!user || !isAuthenticated) return null

  return (
    <div className="space-y-4">
      {/* Wallet Type Indicator */}
      <div className={`p-4 rounded-lg border-2 ${
        walletType === 'super_admin' ? 'border-purple-200 bg-purple-50' :
        walletType === 'admin' ? 'border-blue-200 bg-blue-50' :
        'border-gray-200 bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          <div className="text-2xl">{walletInfo.icon}</div>
          <div className="flex-1">
            <h3 className={`font-semibold ${
              walletType === 'super_admin' ? 'text-purple-800' :
              walletType === 'admin' ? 'text-blue-800' :
              'text-gray-800'
            }`}>
              {walletInfo.title}
            </h3>
            <p className={`text-sm ${
              walletType === 'super_admin' ? 'text-purple-600' :
              walletType === 'admin' ? 'text-blue-600' :
              'text-gray-600'
            }`}>
              {walletInfo.description}
            </p>
            
            {/* Wallet/Email Info */}
            <div className="mt-2 space-y-1">
              {wallet.address && (
                <p className="text-xs font-mono bg-white px-2 py-1 rounded border">
                  Wallet: {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                </p>
              )}
              {user.email && (
                <p className="text-xs bg-white px-2 py-1 rounded border">
                  Email: {user.email}
                </p>
              )}
            </div>
          </div>
          
          {/* Admin Status */}
          <div className="text-right">
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              user.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
              user.role === 'admin' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {user.role === 'super_admin' ? 'Super Admin' :
               user.role === 'admin' ? 'Admin' :
               'User'}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Setup Prompt */}
      {showSetup && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">⚡</div>
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Admin Access Available
              </h3>
              <p className="text-yellow-700 text-sm mb-3">
                Your {walletType === 'super_admin' ? 'wallet' : 'email'} has admin privileges. 
                Set up admin access to manage the platform.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleSetupAdmin}
                  disabled={loading}
                  className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50"
                >
                  {loading ? 'Setting up...' : 'Grant Admin Access'}
                </button>
                <button
                  onClick={() => setShowSetup(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-400"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Verification Status */}
      {verification && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex justify-between">
            <span>Admin Level:</span>
            <span className="font-medium">{verification.adminLevel}</span>
          </div>
          <div className="flex justify-between">
            <span>Super Admin:</span>
            <span className={verification.isSuperAdmin ? 'text-green-600' : 'text-gray-400'}>
              {verification.isSuperAdmin ? '✓' : '✗'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}