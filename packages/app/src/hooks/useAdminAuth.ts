'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'

interface AdminVerification {
  isAdmin: boolean
  isSuperAdmin: boolean
  adminLevel: 'user' | 'admin' | 'super_admin'
  walletAddress?: string
  email?: string
}

export function useAdminAuth() {
  const { user, isAuthenticated, wallet } = useUnifiedAuth()
  const [verification, setVerification] = useState<AdminVerification | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyAdminAccess = async () => {
    if (!user || !isAuthenticated) {
      setVerification(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      
      const response = await fetch(`${mcpUrl}/api/admin/verify-wallet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': wallet.address || '',
          'x-user-email': user.email || ''
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          email: user.email
        })
      })

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        setVerification(result.verification)
      } else {
        throw new Error(result.message || 'Verification failed')
      }
    } catch (err) {
      console.error('Admin verification error:', err)
      setError(err instanceof Error ? err.message : 'Verification failed')
      
      // Fallback to local verification
      const localVerification: AdminVerification = {
        isAdmin: user.role === 'admin' || user.role === 'super_admin',
        isSuperAdmin: user.role === 'super_admin',
        adminLevel: user.role as AdminVerification['adminLevel'],
        walletAddress: wallet.address,
        email: user.email
      }
      setVerification(localVerification)
    } finally {
      setLoading(false)
    }
  }

  const setupAdminAccess = async () => {
    if (!user || !isAuthenticated) {
      throw new Error('User must be authenticated')
    }

    setLoading(true)
    setError(null)

    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      
      const response = await fetch(`${mcpUrl}/api/admin/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-wallet-address': wallet.address || '',
          'x-user-email': user.email || ''
        },
        body: JSON.stringify({
          walletAddress: wallet.address,
          email: user.email,
          setupType: 'admin_access'
        })
      })

      if (!response.ok) {
        throw new Error(`Setup failed: ${response.status}`)
      }

      const result = await response.json()
      
      if (result.success) {
        // Trigger admin setup complete event
        window.dispatchEvent(new CustomEvent('admin-setup-complete'))
        
        // Re-verify after setup
        await verifyAdminAccess()
        
        return result
      } else {
        throw new Error(result.message || 'Setup failed')
      }
    } catch (err) {
      console.error('Admin setup error:', err)
      setError(err instanceof Error ? err.message : 'Setup failed')
      throw err
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user && isAuthenticated) {
      verifyAdminAccess()
    }
  }, [user, isAuthenticated, wallet.address])

  return {
    verification,
    loading,
    error,
    verifyAdminAccess,
    setupAdminAccess,
    isAdmin: verification?.isAdmin || false,
    isSuperAdmin: verification?.isSuperAdmin || false,
    adminLevel: verification?.adminLevel || 'user'
  }
}