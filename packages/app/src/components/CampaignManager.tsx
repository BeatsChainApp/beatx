'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { toast } from 'react-toastify'

interface Campaign {
  id: string
  name: string
  sponsorId: string
  placement: string
  startDate: string
  endDate: string
  budget: number
  status: 'scheduled' | 'active' | 'paused' | 'completed'
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }
}

export default function CampaignManager() {
  const { user, hasAnyRole } = useUnifiedAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Only show for admin/super_admin
  if (!hasAnyRole(['admin', 'super_admin'])) {
    return null
  }

  useEffect(() => {
    loadCampaigns()
  }, [])

  const loadCampaigns = async () => {
    try {
      setLoading(true)
      
      // Connect to MCP server for campaign data
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/campaigns`)
      
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns || [])
      } else {
        // Fallback to extension bridge if available
        if (typeof window !== 'undefined' && window.chrome?.runtime) {
          try {
            const extensionData = await new Promise((resolve) => {
              window.chrome.runtime.sendMessage(
                { action: 'getCampaigns' },
                (response) => resolve(response)
              )
            })
            if (extensionData?.campaigns) {
              setCampaigns(extensionData.campaigns)
            }
          } catch (e) {
            console.warn('Extension bridge unavailable:', e)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
      toast.error('Failed to load campaigns')
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async (campaignData: Partial<Campaign>) => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      })

      if (response.ok) {
        toast.success('Campaign created successfully')
        loadCampaigns()
        setShowCreateForm(false)
      } else {
        throw new Error('Failed to create campaign')
      }
    } catch (error) {
      console.error('Campaign creation failed:', error)
      toast.error('Failed to create campaign')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p>Loading campaigns...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🚀 Campaign Management</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Campaign
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">Total Campaigns</h3>
          <p className="text-2xl font-bold text-blue-900">{campaigns.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700">Active</h3>
          <p className="text-2xl font-bold text-green-900">
            {campaigns.filter(c => c.status === 'active').length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Scheduled</h3>
          <p className="text-2xl font-bold text-yellow-900">
            {campaigns.filter(c => c.status === 'scheduled').length}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm font-medium text-purple-700">Total Impressions</h3>
          <p className="text-2xl font-bold text-purple-900">
            {campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {campaigns.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-4">Create your first campaign to start managing sponsor content</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
            >
              Create First Campaign
            </button>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{campaign.name}</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full ${
                  campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                  campaign.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                  campaign.status === 'paused' ? 'bg-gray-100 text-gray-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {campaign.status}
                </span>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Impressions:</span>
                  <span className="ml-2 font-medium">{campaign.metrics.impressions.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Clicks:</span>
                  <span className="ml-2 font-medium">{campaign.metrics.clicks.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">CTR:</span>
                  <span className="ml-2 font-medium">
                    {campaign.metrics.impressions > 0 ? 
                      ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(2) : 0}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Budget:</span>
                  <span className="ml-2 font-medium">R{campaign.budget.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateForm && (
        <CampaignCreateModal
          onClose={() => setShowCreateForm(false)}
          onSubmit={createCampaign}
        />
      )}
    </div>
  )
}

interface CampaignCreateModalProps {
  onClose: () => void
  onSubmit: (data: Partial<Campaign>) => void
}

function CampaignCreateModal({ onClose, onSubmit }: CampaignCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sponsorId: '',
    placement: 'after_isrc',
    startDate: '',
    endDate: '',
    budget: 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      ...formData,
      status: 'scheduled' as const,
      metrics: { impressions: 0, clicks: 0, conversions: 0, spend: 0 }
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Campaign</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Campaign Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Placement
            </label>
            <select
              value={formData.placement}
              onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="after_isrc">After ISRC Generation</option>
              <option value="after_minting">After NFT Minting</option>
              <option value="before_download">Before Download</option>
              <option value="profile_view">Profile Section</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="datetime-local"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget (R)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}