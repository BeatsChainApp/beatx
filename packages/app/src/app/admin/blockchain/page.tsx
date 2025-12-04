'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useActiveAccount } from "thirdweb/react"
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'

export default function AdminBlockchainPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminBlockchainPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminBlockchainPageContent() {
  const { address, chain } = useAccount()
  const { balance } = useBeatNFT()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCreditsIssued: 0,
    totalProNFTs: 0,
    totalRevenue: 0,
    contractBalance: 0
  })

  useEffect(() => {
    // Load blockchain stats
    const loadStats = () => {
      // Simulate stats from localStorage data
      const users = JSON.parse(localStorage.getItem('platform_users') || '[]')
      const transactions = JSON.parse(localStorage.getItem('credit_transactions') || '[]')
      const proNftTxs = JSON.parse(localStorage.getItem('pro_nft_transactions') || '[]')
      
      setStats({
        totalUsers: users.length || 150,
        totalCreditsIssued: transactions.reduce((sum: number, tx: any) => sum + (tx.amount || 0), 0) || 2500,
        totalProNFTs: proNftTxs.length || 25,
        totalRevenue: transactions.reduce((sum: number, tx: any) => sum + (tx.cost || 0), 0) + 
                     proNftTxs.reduce((sum: number, tx: any) => sum + (tx.cost || 0), 0) || 3.5,
        contractBalance: 2.1
      })
    }
    
    loadStats()
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 mobile-heading">⛓️ Blockchain Administration</h1>
      
      {/* Contract Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">Smart Contract Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Contract Address</p>
            <p className="font-mono text-sm bg-gray-100 p-2 rounded break-all">
              0xcf7f010edb33f5c8582e8f97e20ef76be8b83311
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Network</p>
            <div className="flex items-center">
              <span className="w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
              <span>Sepolia Testnet</span>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Version</p>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">V2 - Storage Tracking</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalUsers}</p>
            </div>
            <div className="text-blue-500 text-2xl mobile-heading">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Credits Issued</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalCreditsIssued.toLocaleString()}</p>
            </div>
            <div className="text-green-500 text-2xl mobile-heading">🎫</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pro NFTs</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalProNFTs}</p>
            </div>
            <div className="text-purple-500 text-2xl mobile-heading">⭐</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.totalRevenue.toFixed(2)} ETH</p>
            </div>
            <div className="text-yellow-500 text-2xl mobile-heading">💰</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Contract Balance</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{stats.contractBalance.toFixed(2)} ETH</p>
            </div>
            <div className="text-indigo-500 text-2xl mobile-heading">🏦</div>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">Contract Management</h3>
          <div className="space-y-3">
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Grant Free Credits
            </button>
            <button className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
              Add Credit Package
            </button>
            <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
              Withdraw Funds
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold mb-4">System Settings</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Max File Size</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">100MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Storage Per Credit</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">50MB</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Pro NFT Price</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">0.1 ETH</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">Recent Blockchain Activity</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Type</th>
                <th className="text-left py-2">User</th>
                <th className="text-left py-2">Amount</th>
                <th className="text-left py-2">Time</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="py-2">🎫 Credit Purchase</td>
                <td className="py-2 font-mono text-xs">0x1234...5678</td>
                <td className="py-2">25 credits</td>
                <td className="py-2">2 mins ago</td>
                <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Confirmed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2">⭐ Pro NFT</td>
                <td className="py-2 font-mono text-xs">0x9876...4321</td>
                <td className="py-2">0.1 ETH</td>
                <td className="py-2">5 mins ago</td>
                <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Confirmed</span></td>
              </tr>
              <tr className="border-b">
                <td className="py-2">📤 Upload</td>
                <td className="py-2 font-mono text-xs">0x5555...7777</td>
                <td className="py-2">3 credits</td>
                <td className="py-2">8 mins ago</td>
                <td className="py-2"><span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Confirmed</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Links */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-100">
        <h3 className="text-lg font-bold mb-4">External Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="https://sepolia.etherscan.io/address/0xcf7f010edb33f5c8582e8f97e20ef76be8b83311" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mr-3 text-xl">🔍</div>
            <div>
              <h4 className="font-medium">View on Etherscan</h4>
              <p className="text-xs text-gray-500">Contract verification & transactions</p>
            </div>
          </a>
          
          <a 
            href="https://docs.beatschain.app/smart-contracts" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mr-3 text-xl">📚</div>
            <div>
              <h4 className="font-medium">Documentation</h4>
              <p className="text-xs text-gray-500">Smart contract guide</p>
            </div>
          </a>
          
          <a 
            href="https://github.com/your-username/beatschain/tree/main/packages/hardhat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mr-3 text-xl">💻</div>
            <div>
              <h4 className="font-medium">Source Code</h4>
              <p className="text-xs text-gray-500">GitHub repository</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  )
}