'use client'

import { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useAccount } from 'wagmi'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useUnifiedAuthRouting } from '@/hooks/useUnifiedAuthRouting'

interface SimplifiedAuthProps {
  isOpen: boolean
  onClose: () => void
}

type UserRole = 'music_lover' | 'producer' | 'content_creator'

interface RoleOption {
  id: UserRole
  icon: string
  title: string
  description: string
  route: string
}

const roleOptions: RoleOption[] = [
  {
    id: 'music_lover',
    icon: '🎧',
    title: 'Music Lover',
    description: 'Browse and purchase beats',
    route: '/beatnfts'
  },
  {
    id: 'producer',
    icon: '🎵',
    title: 'Producer',
    description: 'Upload and sell your beats',
    route: '/dashboard'
  },
  {
    id: 'content_creator',
    icon: '🎨',
    title: 'Content Creator',
    description: 'License beats for your content',
    route: '/creator-dashboard'
  }
]

export default function SimplifiedAuth({ isOpen, onClose }: SimplifiedAuthProps) {
  const [loading, setLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null)
  const [step, setStep] = useState<'role' | 'auth'>('role')
  const { signIn } = useUnifiedAuth()
  const { address, isConnected } = useAccount()
  const { user, signIn: walletSignIn, hasRole } = useUnifiedAuth()

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role)
    setStep('auth')
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn()
      
      // Route based on role or admin status
      setTimeout(() => {
        routeAfterAuth(selectedRole || undefined)
        onClose()
      }, 500)
    } catch (error) {
      console.error('Google sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleWalletSignIn = async () => {
    setLoading(true)
    try {
      if (isConnected && address) {
        // Skip SIWE for super admins and simplified flow
        const isSuperAdmin = address.toLowerCase() === '0xc84799a904eeb5c57abbbc40176e7db8be202c10' ||
                            address === process.env.NEXT_PUBLIC_SUPER_ADMIN_WALLET?.toLowerCase()
        
        if (isSuperAdmin) {
          // Auto-grant access for super admin
          routeAfterAuth()
          onClose()
        } else {
          await walletSignIn()
          
          // Route based on role
          setTimeout(() => {
            routeAfterAuth(selectedRole || undefined)
            onClose()
          }, 500)
        }
      }
    } catch (error) {
      console.error('Wallet sign in failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('role')
    setSelectedRole(null)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl z-10"
        >
          ✕
        </button>

        {step === 'role' ? (
          // Role Selection Step
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="text-4xl mb-4">⛓️</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Join BeatsChain</h2>
              <p className="text-gray-600">Connect your wallet to access all features</p>
            </div>

            <div className="space-y-4">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{role.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">
                        {role.title}
                      </h3>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    <div className="text-gray-400 group-hover:text-blue-500">
                      →
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                I'll choose later
              </button>
            </div>
          </div>
        ) : (
          // Authentication Step
          <div className="p-8">
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">
                {roleOptions.find(r => r.id === selectedRole)?.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                {roleOptions.find(r => r.id === selectedRole)?.title}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {roleOptions.find(r => r.id === selectedRole)?.description}
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Sign In - Primary Option */}
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              {/* Wallet Connection - Secondary Option */}
              {isConnected ? (
                <button
                  onClick={handleWalletSignIn}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-medium transition-all duration-200"
                >
                  {loading ? 'Connecting...' : `Continue with ${address?.slice(0, 6)}...${address?.slice(-4)}`}
                </button>
              ) : (
                <div className="text-center">
                  <w3m-button />
                  <p className="text-xs text-gray-500 mt-2">Connect wallet for Web3 features</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
              >
                ← Back
              </button>
              <p className="text-xs text-gray-500">
                Terms & Privacy
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}