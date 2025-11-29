'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface Campaign {
  id: string
  name: string
  placement: string
  budget: number
  dailyLimit: number
  status: 'active' | 'paused' | 'scheduled' | 'completed'
  platform: 'app'
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }
}

const APP_PLACEMENTS = {
  'upload_start': 'Upload Page Entry',
  'file_validation': 'After File Validation',
  'professional_services': 'Professional Services Upsell',
  'gasless_mint_offer': 'Gasless Minting Upsell',
  'dashboard_sidebar': 'Dashboard Sidebar',
  'mint_success': 'After Successful Mint',
  'marketplace_listing': 'Marketplace Listing Prompt'
}

export default function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    placement: '',
    budget: 0,
    dailyLimit: 0
  })

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/campaigns/app`)
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatschain-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/campaigns/app/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newCampaign,
          platform: 'app'
        })
      })

      if (response.ok) {
        toast.success('Campaign created successfully')
        setShowCreateForm(false)
        setNewCampaign({ name: '', placement: '', budget: 0, dailyLimit: 0 })
        loadCampaigns()
      } else {
        toast.error('Failed to create campaign')
      }
    } catch (error) {
      toast.error('Error creating campaign')
    }
  }

  if (loading) {
    return <div className="p-6">Loading campaigns...</div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">App Campaign Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Campaign
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
          <p className="text-2xl font-bold">{campaigns.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-green-600">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-blue-600">
            ${campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0).toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Impressions</h3>
          <p className="text-2xl font-bold">
            {campaigns.reduce((sum, c) => sum + (c.metrics?.impressions || 0), 0).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Placement</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {campaigns.map((campaign) => (
              <tr key={campaign.id}>
                <td className="px-6 py-4 font-medium">{campaign.name}</td>
                <td className="px-6 py-4">{APP_PLACEMENTS[campaign.placement as keyof typeof APP_PLACEMENTS]}</td>
                <td className="px-6 py-4">${campaign.budget}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </td>
                <td className="px-6 py-4">${campaign.metrics?.revenue || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {campaigns.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No campaigns found. Create your first campaign to get started.
          </div>
        )}
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Create New Campaign</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Campaign Name</label>
                <input
                  type="text"
                  value={newCampaign.name}
                  onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Placement</label>
                <select
                  value={newCampaign.placement}
                  onChange={(e) => setNewCampaign({...newCampaign, placement: e.target.value})}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select placement</option>
                  {Object.entries(APP_PLACEMENTS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Daily Limit ($)</label>
                <input
                  type="number"
                  value={newCampaign.dailyLimit}
                  onChange={(e) => setNewCampaign({...newCampaign, dailyLimit: Number(e.target.value)})}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.placement}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}