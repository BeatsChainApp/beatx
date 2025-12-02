'use client'

import { useEffect, useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useRouter } from 'next/navigation'
import { useAnalytics } from '@/hooks/useAnalytics'
import { useBeatNFT } from '@/hooks/useBeatNFT'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import BeatNFTAdminDashboard from '@/components/BeatNFTAdminDashboard'
import { LinkComponent } from '@/components/LinkComponent'
import { toast } from 'react-toastify'

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useUnifiedAuth()
  const router = useRouter()
  const { getOverview, getBeatAnalytics, getProducerAnalytics } = useAnalytics()
  const { balance } = useBeatNFT()
  const { settings, toggleMaintenanceMode } = useSiteSettings()
  
  const [overview, setOverview] = useState<any>(null)
  const [beatStats, setBeatStats] = useState<any[]>([])
  const [producerStats, setProducerStats] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [systemHealth, setSystemHealth] = useState<any>(null)
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    
    if (!loading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin'))) {
      router.push('/dashboard')
      return
    }
    
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'super_admin')) {
      loadDashboardData()
    }
  }, [user, isAuthenticated, loading, mounted])

  const loadDashboardData = async () => {
    try {
      const overviewData = await getOverview()
      setOverview(overviewData)

      const beatData = await getBeatAnalytics()
      setBeatStats(beatData)

      const producerData = await getProducerAnalytics()
      setProducerStats(producerData)

      await loadSystemHealth()
      await loadUsers()
      await loadTransactions()
    } catch (error) {
      console.error('Dashboard load failed:', error)
    }
  }

  const loadSystemHealth = async () => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/healthz`)
      const health = await response.json()
      setSystemHealth({ mcp: health, status: response.ok ? 'healthy' : 'error' })
    } catch (error) {
      setSystemHealth({ mcp: null, status: 'down' })
    }
  }

  const loadUsers = async () => {
    setUsers([
      { id: 1, email: 'admin@beatx.app', role: 'super_admin', status: 'active' },
      { id: 2, email: 'producer@beatx.app', role: 'producer', status: 'active' }
    ])
  }

  const loadTransactions = async () => {
    setTransactions([
      { id: 1, amount: 25.00, status: 'completed', created_at: new Date() },
      { id: 2, amount: 10.00, status: 'pending', created_at: new Date() }
    ])
  }

  if (!mounted || loading) {
    return <div className="p-8">Loading...</div>
  }

  if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'super_admin')) {
    return <div className="p-8">Access denied</div>
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'beatnft', name: 'BeatNFT Credits', icon: '🎫' },
    { id: 'users', name: 'Users', icon: '👥' },
    { id: 'beats', name: 'Beats', icon: '🎵' },
    { id: 'transactions', name: 'Transactions', icon: '💳' },
    { id: 'system', name: 'System', icon: '⚙️' }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">👑 Admin Dashboard</h1>
              <p className="text-gray-600">Comprehensive system management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <LinkComponent href="/admin/settings" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                ⚙️ Settings
              </LinkComponent>
              <button
                onClick={toggleMaintenanceMode}
                className={`px-4 py-2 rounded-md font-medium ${
                  settings.maintenanceMode 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {settings.maintenanceMode ? '🚨 Maintenance ON' : '✅ System Online'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* System Health Status */}
            <div className="p-6 rounded-lg border bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4">🔧 System Health</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    systemHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium">MCP Server</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Supabase</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Frontend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Blockchain</span>
                </div>
              </div>
            </div>

            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-sm font-medium text-blue-700">📊 Total Revenue</h3>
                <p className="text-3xl font-bold text-blue-900">
                  ${overview?.totalRevenue || '0.00'}
                </p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h3 className="text-sm font-medium text-green-700">🎵 Total Beats</h3>
                <p className="text-3xl font-bold text-green-900">
                  {overview?.totalBeats || '0'}
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                <h3 className="text-sm font-medium text-purple-700">👥 Total Users</h3>
                <p className="text-3xl font-bold text-purple-900">
                  {overview?.totalUsers || '0'}
                </p>
              </div>
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <h3 className="text-sm font-medium text-yellow-700">💰 Total Sales</h3>
                <p className="text-3xl font-bold text-yellow-900">
                  {overview?.totalSales || '0'}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">⚡ Quick Actions</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100"
                  >
                    <div className="text-2xl mb-2">👥</div>
                    <div className="text-sm font-medium">Manage Users</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('beats')}
                    className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100"
                  >
                    <div className="text-2xl mb-2">🎵</div>
                    <div className="text-sm font-medium">Review Beats</div>
                  </button>
                  <button 
                    onClick={() => setActiveTab('beatnft')}
                    className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100"
                  >
                    <div className="text-2xl mb-2">🎫</div>
                    <div className="text-sm font-medium">BeatNFT Credits</div>
                  </button>
                  <LinkComponent 
                    href="/admin/settings"
                    className="p-4 bg-red-50 rounded-lg border border-red-200 hover:bg-red-100 block text-center"
                  >
                    <div className="text-2xl mb-2">⚙️</div>
                    <div className="text-sm font-medium">System Settings</div>
                  </LinkComponent>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beatnft' && (
          <BeatNFTAdminDashboard />
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">👥 User Management</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {users.map(user => (
                  <div key={user.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{user.email}</p>
                      <p className="text-sm text-gray-600">{user.role}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'beats' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">🎵 Beat Analytics</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {beatStats.slice(0, 10).map((beat, index) => (
                  <div key={index} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{beat.title || `Beat ${index + 1}`}</p>
                      <p className="text-sm text-gray-600">{beat.producer_name || 'Unknown'}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{beat.play_count || 0} plays</p>
                      <p className="text-sm text-gray-600">{beat.total_sales || 0} sales</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white rounded-lg shadow border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold">💳 Transaction History</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {transactions.map(tx => (
                  <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">${tx.amount}</p>
                      <p className="text-sm text-gray-600">{new Date(tx.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      tx.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {tx.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">⚙️ System Configuration</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Platform Settings</h3>
                    <p className="text-sm text-gray-600 mb-4">Core platform configuration</p>
                    <LinkComponent 
                      href="/admin/settings"
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      Configure Settings
                    </LinkComponent>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Maintenance Mode</h3>
                    <p className="text-sm text-gray-600 mb-4">Temporarily disable platform access</p>
                    <button
                      onClick={toggleMaintenanceMode}
                      className={`px-4 py-2 rounded-md font-medium ${
                        settings.maintenanceMode 
                          ? 'bg-red-600 text-white hover:bg-red-700' 
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {settings.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}