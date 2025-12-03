'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useWeb3Events } from '@/hooks/useWeb3Events'
import { useWeb3Data } from '@/context/Web3DataContext'
import { useWriteContract, usePublicClient } from 'wagmi'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Pagination } from '@/components/Pagination'
import { toast } from 'react-toastify'
import { BeatNFTConfig } from '@/contracts/BeatNFT'

interface Web3User {
  uid: string
  displayName: string
  email: string
  role: string
  isVerified: boolean
  createdAt: Date
  isSuspended?: boolean
  suspensionReason?: string
  totalBeats?: number
  totalSales?: number
  totalRevenue?: number
  lastActivity?: Date
}

function AdminUsersContent() {
  const { user } = useUnifiedAuth()
  const { events, loading } = useWeb3Events()
  const { beats } = useWeb3Data()
  const { writeContract } = useWriteContract()
  const publicClient = usePublicClient()
  const [users, setUsers] = useState<Web3User[]>([])
  const [filter, setFilter] = useState<'all' | 'user' | 'producer' | 'admin'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
  const [editingUser, setEditingUser] = useState<Web3User | null>(null)
  const [suspendingUser, setSuspendingUser] = useState<Web3User | null>(null)
  const [suspensionReason, setSuspensionReason] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const loadBlockchainUsers = () => {
      if (typeof window === 'undefined') return
      
      const userMap = new Map<string, Web3User>()
      
      // Get users from Web3 events (blockchain data)
      events.forEach(event => {
        const address = event.data?.producer || event.data?.buyer || event.data?.from
        if (address && !userMap.has(address)) {
          // Get user profile from localStorage (Web3 profile)
          const profile = JSON.parse(localStorage.getItem(`web3_profile_${address.toLowerCase()}`) || '{}')
          
          // Check suspension status from blockchain events or localStorage
          const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
          const isSuspended = suspendedUsers[address] !== undefined
          
          // Calculate user stats from blockchain data
          const userBeats = beats.filter(beat => beat.producerId.toLowerCase() === address.toLowerCase())
          const userSales = events.filter(e => e.type === 'purchase' && e.data?.seller?.toLowerCase() === address.toLowerCase())
          const totalRevenue = userSales.reduce((sum, sale) => sum + parseFloat(sale.data?.price || '0'), 0)
          const lastActivity = events
            .filter(e => e.data?.producer?.toLowerCase() === address.toLowerCase() || e.data?.buyer?.toLowerCase() === address.toLowerCase())
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0]?.timestamp
          
          userMap.set(address, {
            uid: address,
            displayName: profile.displayName || `${address.slice(0, 6)}...${address.slice(-4)}`,
            email: profile.email || `${address.slice(0, 8)}@wallet.eth`,
            role: profile.role || (event.data?.producer ? 'producer' : 'user'),
            isVerified: profile.isVerified || false,
            createdAt: profile.createdAt ? new Date(profile.createdAt) : event.timestamp,
            isSuspended,
            suspensionReason: suspendedUsers[address]?.reason,
            totalBeats: userBeats.length,
            totalSales: userSales.length,
            totalRevenue,
            lastActivity
          })
        }
      })
      
      // Add current connected user if not in list
      if (user?.address && !userMap.has(user.address)) {
        const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
        const isSuspended = suspendedUsers[user.address] !== undefined
        
        userMap.set(user.address, {
          uid: user.address,
          displayName: user.displayName,
          email: user.email || `${user.address.slice(0, 8)}@wallet.eth`,
          role: user.role,
          isVerified: user.isVerified,
          createdAt: new Date(),
          isSuspended,
          suspensionReason: suspendedUsers[user.address]?.reason,
          totalBeats: beats.filter(beat => beat.producerId.toLowerCase() === user.address.toLowerCase()).length,
          totalSales: 0,
          totalRevenue: 0,
          lastActivity: new Date()
        })
      }

      const allUsers = Array.from(userMap.values())
      const filteredUsers = filter === 'all' ? allUsers : allUsers.filter(u => u.role === filter)
      setUsers(filteredUsers)
    }
    
    loadBlockchainUsers()
  }, [events, filter, user, beats])

  const handleEditUser = (userToEdit: Web3User) => {
    setEditingUser(userToEdit)
  }

  const handleSaveEdit = async () => {
    if (!editingUser || processing) return
    
    setProcessing(true)
    try {
      // Update user profile in Web3 profile storage
      const profileKey = `web3_profile_${editingUser.uid.toLowerCase()}`
      const existingProfile = JSON.parse(localStorage.getItem(profileKey) || '{}')
      
      const updatedProfile = {
        ...existingProfile,
        address: editingUser.uid,
        displayName: editingUser.displayName,
        email: editingUser.email,
        role: editingUser.role,
        isVerified: editingUser.isVerified,
        updatedAt: new Date()
      }
      
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile))
      
      // If role changed to admin, update admin config
      if (editingUser.role === 'admin') {
        const adminConfig = JSON.parse(localStorage.getItem('admin_config') || '{"adminWallets": [], "setupComplete": true}')
        if (!adminConfig.adminWallets.includes(editingUser.uid.toLowerCase())) {
          adminConfig.adminWallets.push(editingUser.uid.toLowerCase())
          localStorage.setItem('admin_config', JSON.stringify(adminConfig))
        }
      }
      
      // Update users list
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? editingUser : u))
      
      toast.success(`✅ Updated ${editingUser.displayName}'s profile`)
      setEditingUser(null)
    } catch (error) {
      console.error('Failed to update user profile:', error)
      toast.error('Failed to update user profile')
    } finally {
      setProcessing(false)
    }
  }

  const handleSuspendUser = (userToSuspend: Web3User) => {
    setSuspendingUser(userToSuspend)
    setSuspensionReason('')
  }

  const handleConfirmSuspension = async () => {
    if (!suspendingUser || !suspensionReason.trim() || processing) {
      toast.error('Please provide a suspension reason')
      return
    }
    
    setProcessing(true)
    try {
      // Record suspension in blockchain-compatible format
      const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
      suspendedUsers[suspendingUser.uid.toLowerCase()] = {
        reason: suspensionReason,
        suspendedAt: new Date().toISOString(),
        suspendedBy: user?.address,
        blockNumber: await publicClient?.getBlockNumber() || 0
      }
      localStorage.setItem('suspended_users', JSON.stringify(suspendedUsers))
      
      // Update user profile to reflect suspension
      const profileKey = `web3_profile_${suspendingUser.uid.toLowerCase()}`
      const existingProfile = JSON.parse(localStorage.getItem(profileKey) || '{}')
      const updatedProfile = {
        ...existingProfile,
        isSuspended: true,
        suspensionReason,
        suspendedAt: new Date().toISOString(),
        updatedAt: new Date()
      }
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile))
      
      // Update users list
      setUsers(prev => prev.map(u => 
        u.uid === suspendingUser.uid 
          ? { ...u, isSuspended: true, suspensionReason }
          : u
      ))
      
      toast.success(`🚫 Suspended ${suspendingUser.displayName}`)
      setSuspendingUser(null)
      setSuspensionReason('')
    } catch (error) {
      console.error('Failed to suspend user:', error)
      toast.error('Failed to suspend user')
    } finally {
      setProcessing(false)
    }
  }

  const handleUnsuspendUser = async (userToUnsuspend: Web3User) => {
    if (processing) return
    
    setProcessing(true)
    try {
      // Remove from suspended users
      const suspendedUsers = JSON.parse(localStorage.getItem('suspended_users') || '{}')
      delete suspendedUsers[userToUnsuspend.uid.toLowerCase()]
      localStorage.setItem('suspended_users', JSON.stringify(suspendedUsers))
      
      // Update user profile
      const profileKey = `web3_profile_${userToUnsuspend.uid.toLowerCase()}`
      const existingProfile = JSON.parse(localStorage.getItem(profileKey) || '{}')
      const updatedProfile = {
        ...existingProfile,
        isSuspended: false,
        suspensionReason: undefined,
        unsuspendedAt: new Date().toISOString(),
        updatedAt: new Date()
      }
      localStorage.setItem(profileKey, JSON.stringify(updatedProfile))
      
      // Update users list
      setUsers(prev => prev.map(u => 
        u.uid === userToUnsuspend.uid 
          ? { ...u, isSuspended: false, suspensionReason: undefined }
          : u
      ))
      
      toast.success(`✅ Unsuspended ${userToUnsuspend.displayName}`)
    } catch (error) {
      console.error('Failed to unsuspend user:', error)
      toast.error('Failed to unsuspend user')
    } finally {
      setProcessing(false)
    }
  }



  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 mobile-heading">👥 User Management</h1>
              <p className="opacity-90">Manage platform users and permissions</p>
            </div>
            <LinkComponent 
              href="/admin" 
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Admin
            </LinkComponent>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <h2 className="text-lg font-semibold">Filter Users</h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'user', 'producer', 'admin'] as const).map((roleFilter) => (
              <button
                key={roleFilter}
                onClick={() => setFilter(roleFilter)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === roleFilter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {roleFilter === 'all' ? 'All Users' : roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}s
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Users ({users.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading Web3 users...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4 mobile-heading">👥</div>
              <p className="text-gray-600 mb-2">No users found</p>
              <p className="text-sm text-gray-500">Users will appear here as they join the platform</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage).map((user) => (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
                              {user.displayName.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'producer'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.isVerified
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {user.isVerified ? 'Verified' : 'Pending'}
                          </span>
                          {user.isSuspended && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Suspended
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="text-xs">
                          <div>Beats: {user.totalBeats || 0}</div>
                          <div>Sales: {user.totalSales || 0}</div>
                          <div>Revenue: {user.totalRevenue?.toFixed(4) || '0'} ETH</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        {user.isSuspended ? (
                          <button 
                            onClick={() => handleUnsuspendUser(user)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Unsuspend
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleSuspendUser(user)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <Pagination
            currentPage={currentPage}
            totalItems={users.length}
            itemsPerPage={usersPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Edit User Modal */}
        {editingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Edit User Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editingUser.displayName}
                    onChange={(e) => setEditingUser({...editingUser, displayName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={editingUser.role}
                    onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="producer">Producer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    checked={editingUser.isVerified}
                    onChange={(e) => setEditingUser({...editingUser, isVerified: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="verified" className="text-sm text-gray-700">
                    Verified User
                  </label>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Suspend User Modal */}
        {suspendingUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4 text-red-600">Suspend User</h3>
              <p className="text-gray-600 mb-4">
                You are about to suspend <strong>{suspendingUser.displayName}</strong>. 
                This will prevent them from accessing the platform.
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Suspension Reason *
                </label>
                <textarea
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="Enter reason for suspension..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setSuspendingUser(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSuspension}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Suspending...' : 'Suspend User'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminUsersPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminUsersPageContent() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']}>
      <AdminUsersContent />
    </ProtectedRoute>
  )
}