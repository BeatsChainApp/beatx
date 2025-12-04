'use client'

import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState } from 'react'
import { useWeb3Profile } from '@/hooks/useWeb3Profile'
import { TestDataManager } from '@/utils/testData'
import { LinkComponent } from '@/components/LinkComponent'
import { toast } from 'react-toastify'

export default function AdminSeedPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <AdminSeedPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminSeedPageContent() {
  const { profile, isConnected } = useWeb3Profile()
  const [seeding, setSeeding] = useState(false)
  const [stats, setStats] = useState<any>(null)

  if (!isConnected) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4 mobile-heading">🔗</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 mobile-heading">Connect Your Wallet</h2>
        <p className="text-gray-600">Please connect your wallet to access admin tools.</p>
        <div className="mt-4">
          <ConnectButton client={client} />
        </div>
      </div>
    )
  }

  if (profile?.role !== 'admin') {
    return <div className="p-8 text-center">Access Denied</div>
  }

  const handleSeedData = async () => {
    setSeeding(true)
    try {
      TestDataManager.initializeTestData()
      const newStats = TestDataManager.getAdminStats()
      setStats(newStats)
      toast.success('Test data seeded successfully!')
    } catch (error) {
      toast.error('Failed to seed test data')
    } finally {
      setSeeding(false)
    }
  }

  const handleClearData = async () => {
    if (confirm('Are you sure you want to clear all test data?')) {
      TestDataManager.clearTestData()
      setStats(null)
      toast.success('Test data cleared successfully!')
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <h1 className="text-3xl font-bold mb-2 mobile-heading">🌱 Seed Test Data</h1>
          <LinkComponent href="/admin" className="text-white/80 hover:text-white">← Back to Admin</LinkComponent>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Test Data Management</h2>
            <p className="text-gray-600 mb-6">
              Populate the platform with test data to demonstrate functionality. This includes beats, producers, and users.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={handleSeedData}
                disabled={seeding}
                className="bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {seeding ? 'Seeding...' : '🌱 Seed Test Data'}
              </button>
              
              <button
                onClick={handleClearData}
                className="bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700"
              >
                🗑️ Clear Test Data
              </button>
            </div>

            {stats && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">Current Platform Stats:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Users:</span>
                    <span className="font-semibold ml-2">{stats.totalUsers}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Beats:</span>
                    <span className="font-semibold ml-2">{stats.totalBeats}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Revenue:</span>
                    <span className="font-semibold ml-2">R{stats.totalRevenue.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pending Reviews:</span>
                    <span className="font-semibold ml-2">{stats.pendingReviews}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Active Producers:</span>
                    <span className="font-semibold ml-2">{stats.activeProducers}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Test Data Includes:</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold text-green-600 mb-2">🎵 Beats (5)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Dark Trap Vibes</li>
                  <li>• Amapiano Groove</li>
                  <li>• Afrobeats Fire</li>
                  <li>• Hip Hop Classic</li>
                  <li>• House Anthem</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-blue-600 mb-2">👨‍🎤 Producers (4)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• BeatMaker SA (Verified)</li>
                  <li>• Piano King (Verified)</li>
                  <li>• Afro Producer</li>
                  <li>• House Master</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-purple-600 mb-2">👥 Users (4)</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Admin User (Admin)</li>
                  <li>• MC Flow (Artist)</li>
                  <li>• Vocal Queen (Artist)</li>
                  <li>• Rising Star (New User)</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Note:</h4>
              <p className="text-yellow-700 text-sm">
                This test data is stored locally and will populate the marketplace, producers page, and admin dashboard. 
                In production, this data would come from blockchain events and IPFS metadata.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}