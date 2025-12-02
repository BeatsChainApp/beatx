'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface EnhancedCampaign {
  id: string
  name: string
  sponsorId: string
  placement: string
  startDate: string
  endDate: string
  budget: number
  dailyBudgetLimit: number
  status: 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled'
  platform: 'app'
  totalSpend: number
  roi: number
  targeting: {
    placements: string[]
    demographics: Record<string, any>
    behavioral: Record<string, any>
  }
  schedule: {
    type: 'continuous' | 'scheduled' | 'burst'
    hours?: string[]
    timezone: string
  }
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    spend: number
  }
  performance: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
    ctr: number
    conversionRate: number
    costPerClick: number
    costPerConversion: number
  }
  createdAt: number
  updatedAt: number
}

interface SponsorTemplate {
  id: string
  name: string
  category: string
  description: string
  assets: {
    logo?: string
    banner?: string
    content: string
  }
}

const ENHANCED_APP_PLACEMENTS = {
  // Upload & Minting System
  'upload_start': 'Upload Page Entry',
  'file_validation': 'After File Validation',
  'metadata_entry': 'Metadata Entry Step',
  'professional_services': 'Professional Services Upsell',
  'gasless_mint_offer': 'Gasless Minting Upsell',
  'mint_success': 'After Successful Mint',
  'ipfs_upload': 'During IPFS Upload',
  'metadata_creation': 'After Metadata Creation',
  
  // Radio System
  'radio_submission_start': 'Radio Submission Entry',
  'radio_metadata_complete': 'After Metadata Completion',
  'radio_splitsheet_prompt': 'Split Sheet Creation',
  'radio_samro_upsell': 'SAMRO Documentation',
  'radio_package_complete': 'Package Completion',
  'radio_download': 'During Package Download',
  
  // Marketplace System
  'marketplace_entry': 'Marketplace Entry',
  'nft_discovery': 'NFT Discovery Page',
  'purchase_flow': 'Purchase Flow',
  'collection_view': 'Collection Management',
  'marketplace_listing': 'Marketplace Listing Prompt',
  
  // Dashboard & Profile
  'dashboard_sidebar': 'Dashboard Sidebar',
  'profile_view': 'Profile Section',
  'analytics_view': 'Analytics Dashboard',
  'earnings_view': 'Earnings Overview',
  
  // Onboarding System
  'onboarding_welcome': 'Onboarding Welcome',
  'onboarding_account': 'Account Setup',
  'onboarding_role': 'Role Selection',
  'onboarding_profile': 'Profile Setup',
  'onboarding_features': 'Features Overview',
  
  // Cross-Platform
  'licensing_proceed': 'Proceed to Licensing',
  'collaboration_hub': 'Collaboration Hub',
  'notification_center': 'Notification Center'
}

const SPONSOR_CATEGORIES = {
  'marketplace_services': 'Marketplace & Trading Services',
  'professional_services': 'Professional Music Services',
  'profile_services': 'Profile & Marketing Services',
  'individual_artist_tools': 'Solo Artist Tools',
  'beat_distribution': 'Beat Distribution Services',
  'nft_discovery': 'NFT Discovery Tools',
  'full_suite_services': 'Complete Music Suite',
  'radio_promotion': 'Radio Promotion Services',
  'licensing_services': 'Music Licensing Services',
  'collaboration_tools': 'Collaboration Platforms'
}

export default function EnhancedCampaignManager() {
  const [campaigns, setCampaigns] = useState<EnhancedCampaign[]>([])
  const [sponsors, setSponsors] = useState<Record<string, SponsorTemplate>>({})
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingCampaign, setEditingCampaign] = useState<EnhancedCampaign | null>(null)
  const [showSponsorManager, setShowSponsorManager] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null)
  const [analyticsView, setAnalyticsView] = useState<'overview' | 'detailed' | 'roi'>('overview')
  
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    sponsorId: '',
    placement: '',
    startDate: '',
    endDate: '',
    budget: 0,
    dailyBudgetLimit: 0,
    schedule: {
      type: 'continuous' as const,
      timezone: 'Africa/Johannesburg'
    },
    targeting: {
      placements: [] as string[],
      demographics: {},
      behavioral: {}
    }
  })

  useEffect(() => {
    loadCampaigns()
    loadSponsors()
  }, [])

  const loadCampaigns = async () => {
    try {
      // Load from localStorage for now (would be API in production)
      const stored = localStorage.getItem('beatx_enhanced_campaigns')
      if (stored) {
        const campaignsData = JSON.parse(stored)
        setCampaigns(Object.values(campaignsData))
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSponsors = async () => {
    try {
      const stored = localStorage.getItem('beatx_sponsor_templates')
      if (stored) {
        const sponsorsData = JSON.parse(stored)
        setSponsors(sponsorsData)
      } else {
        // Initialize with default sponsors
        const defaultSponsors = {
          'default_marketplace': {
            id: 'default_marketplace',
            name: 'BeatsChain Marketplace',
            category: 'marketplace_services',
            description: 'Official BeatsChain marketplace services',
            assets: {
              content: 'Boost your marketplace presence with professional services'
            }
          },
          'professional_services': {
            id: 'professional_services',
            name: 'Professional Music Services',
            category: 'professional_services',
            description: 'Professional music industry services',
            assets: {
              content: 'Professional services available for artists and producers'
            }
          }
        }
        setSponsors(defaultSponsors)
        localStorage.setItem('beatx_sponsor_templates', JSON.stringify(defaultSponsors))
      }
    } catch (error) {
      console.error('Failed to load sponsors:', error)
    }
  }

  const saveCampaigns = async (updatedCampaigns: EnhancedCampaign[]) => {
    try {
      const campaignsData = updatedCampaigns.reduce((acc, campaign) => {
        acc[campaign.id] = campaign
        return acc
      }, {} as Record<string, EnhancedCampaign>)
      
      localStorage.setItem('beatx_enhanced_campaigns', JSON.stringify(campaignsData))
    } catch (error) {
      console.error('Failed to save campaigns:', error)
      throw error
    }
  }

  const validateCampaignData = (data: any): string[] => {
    const errors: string[] = []
    
    if (!data.name?.trim()) errors.push('Campaign name is required')
    if (data.name?.length > 100) errors.push('Campaign name must be 100 characters or less')
    if (!data.sponsorId) errors.push('Sponsor selection is required')
    if (!data.placement) errors.push('Placement selection is required')
    if (!data.startDate) errors.push('Start date is required')
    if (!data.endDate) errors.push('End date is required')
    
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate)
      const endDate = new Date(data.endDate)
      
      if (isNaN(startDate.getTime())) errors.push('Invalid start date format')
      if (isNaN(endDate.getTime())) errors.push('Invalid end date format')
      
      if (startDate >= endDate) {
        errors.push('End date must be after start date')
      }
      
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      if (startDate < oneHourAgo) {
        errors.push('Start date cannot be in the past')
      }
    }
    
    if (data.budget !== undefined && data.budget !== '') {
      const budget = parseFloat(data.budget)
      if (isNaN(budget) || budget < 0) {
        errors.push('Budget must be a positive number')
      }
      if (budget > 1000000) {
        errors.push('Budget cannot exceed R1,000,000')
      }
    }
    
    if (data.dailyBudgetLimit !== undefined && data.dailyBudgetLimit !== '') {
      const dailyBudget = parseFloat(data.dailyBudgetLimit)
      if (isNaN(dailyBudget) || dailyBudget < 0) {
        errors.push('Daily budget limit must be a positive number')
      }
      
      const totalBudget = parseFloat(data.budget) || 0
      if (totalBudget > 0 && dailyBudget > totalBudget) {
        errors.push('Daily budget limit cannot exceed total budget')
      }
    }
    
    return errors
  }

  const createCampaign = async () => {
    try {
      const errors = validateCampaignData(newCampaign)
      if (errors.length > 0) {
        toast.error(errors.join(', '))
        return
      }

      const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      
      const campaign: EnhancedCampaign = {
        id: campaignId,
        name: newCampaign.name.trim(),
        sponsorId: newCampaign.sponsorId,
        placement: newCampaign.placement,
        startDate: newCampaign.startDate,
        endDate: newCampaign.endDate,
        budget: parseFloat(newCampaign.budget.toString()) || 0,
        dailyBudgetLimit: parseFloat(newCampaign.dailyBudgetLimit.toString()) || 0,
        status: 'scheduled',
        platform: 'app',
        totalSpend: 0,
        roi: 0,
        targeting: {
          placements: [newCampaign.placement],
          demographics: {},
          behavioral: {}
        },
        schedule: {
          type: newCampaign.schedule.type,
          timezone: newCampaign.schedule.timezone
        },
        metrics: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          spend: 0
        },
        performance: {
          impressions: 0,
          clicks: 0,
          conversions: 0,
          revenue: 0,
          ctr: 0,
          conversionRate: 0,
          costPerClick: 0,
          costPerConversion: 0
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }

      const updatedCampaigns = [...campaigns, campaign]
      setCampaigns(updatedCampaigns)
      await saveCampaigns(updatedCampaigns)

      toast.success('Enhanced campaign created successfully')
      setShowCreateForm(false)
      resetNewCampaign()
    } catch (error) {
      toast.error('Error creating campaign')
      console.error('Campaign creation error:', error)
    }
  }

  const updateCampaign = async (campaignId: string, updates: Partial<EnhancedCampaign>) => {
    try {
      const updatedCampaigns = campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, ...updates, updatedAt: Date.now() }
          : campaign
      )
      
      setCampaigns(updatedCampaigns)
      await saveCampaigns(updatedCampaigns)
      
      toast.success('Campaign updated successfully')
    } catch (error) {
      toast.error('Error updating campaign')
      console.error('Campaign update error:', error)
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    
    try {
      const updatedCampaigns = campaigns.filter(campaign => campaign.id !== campaignId)
      setCampaigns(updatedCampaigns)
      await saveCampaigns(updatedCampaigns)
      
      toast.success('Campaign deleted successfully')
    } catch (error) {
      toast.error('Error deleting campaign')
      console.error('Campaign deletion error:', error)
    }
  }

  const resetNewCampaign = () => {
    setNewCampaign({
      name: '',
      sponsorId: '',
      placement: '',
      startDate: '',
      endDate: '',
      budget: 0,
      dailyBudgetLimit: 0,
      schedule: {
        type: 'continuous',
        timezone: 'Africa/Johannesburg'
      },
      targeting: {
        placements: [],
        demographics: {},
        behavioral: {}
      }
    })
  }

  const calculateCampaignROI = (campaign: EnhancedCampaign) => {
    if (campaign.totalSpend === 0) return { roi: 0, status: 'no_spend' }
    
    const revenue = campaign.performance.revenue || 0
    const roi = ((revenue - campaign.totalSpend) / campaign.totalSpend) * 100
    
    return {
      roi: Math.round(roi * 100) / 100,
      revenue: revenue,
      spend: campaign.totalSpend,
      profit: revenue - campaign.totalSpend,
      status: roi > 0 ? 'profitable' : 'loss'
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      'scheduled': '#ffc107',
      'active': '#28a745',
      'paused': '#6c757d',
      'completed': '#17a2b8',
      'cancelled': '#dc3545'
    }
    return colors[status as keyof typeof colors] || '#6c757d'
  }

  const getTotalMetrics = () => {
    return campaigns.reduce((totals, campaign) => ({
      impressions: totals.impressions + (campaign.metrics?.impressions || 0),
      clicks: totals.clicks + (campaign.metrics?.clicks || 0),
      conversions: totals.conversions + (campaign.metrics?.conversions || 0),
      revenue: totals.revenue + (campaign.performance?.revenue || 0),
      spend: totals.spend + (campaign.totalSpend || 0)
    }), { impressions: 0, clicks: 0, conversions: 0, revenue: 0, spend: 0 })
  }

  const totalMetrics = getTotalMetrics()
  const totalROI = totalMetrics.spend > 0 ? ((totalMetrics.revenue - totalMetrics.spend) / totalMetrics.spend) * 100 : 0

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Campaign Management</h2>
          <p className="text-gray-600">Advanced campaign management with sponsor integration and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSponsorManager(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          >
            Manage Sponsors
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Enhanced Campaign
          </button>
        </div>
      </div>

      {/* Analytics Toggle */}
      <div className="flex gap-2 border-b">
        {(['overview', 'detailed', 'roi'] as const).map((view) => (
          <button
            key={view}
            onClick={() => setAnalyticsView(view)}
            className={`px-4 py-2 border-b-2 transition-colors ${
              analyticsView === view
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)} Analytics
          </button>
        ))}
      </div>

      {/* Enhanced Metrics Dashboard */}
      {analyticsView === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Campaigns</h3>
            <p className="text-2xl font-bold text-gray-900">{campaigns.length}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Active</h3>
            <p className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
            <p className="text-2xl font-bold text-blue-600">
              R{totalMetrics.revenue.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total Spend</h3>
            <p className="text-2xl font-bold text-red-600">
              R{totalMetrics.spend.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Total ROI</h3>
            <p className={`text-2xl font-bold ${totalROI >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalROI.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Impressions</h3>
            <p className="text-2xl font-bold text-gray-900">
              {totalMetrics.impressions.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {analyticsView === 'detailed' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Click-Through Rate</h3>
            <p className="text-2xl font-bold text-blue-600">
              {totalMetrics.impressions > 0 ? ((totalMetrics.clicks / totalMetrics.impressions) * 100).toFixed(2) : 0}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
            <p className="text-2xl font-bold text-green-600">
              {totalMetrics.clicks > 0 ? ((totalMetrics.conversions / totalMetrics.clicks) * 100).toFixed(2) : 0}%
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Cost Per Click</h3>
            <p className="text-2xl font-bold text-orange-600">
              R{totalMetrics.clicks > 0 ? (totalMetrics.spend / totalMetrics.clicks).toFixed(2) : 0}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Cost Per Conversion</h3>
            <p className="text-2xl font-bold text-purple-600">
              R{totalMetrics.conversions > 0 ? (totalMetrics.spend / totalMetrics.conversions).toFixed(2) : 0}
            </p>
          </div>
        </div>
      )}

      {analyticsView === 'roi' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Profitable Campaigns</h3>
            <p className="text-2xl font-bold text-green-600">
              {campaigns.filter(c => calculateCampaignROI(c).roi > 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Loss-Making Campaigns</h3>
            <p className="text-2xl font-bold text-red-600">
              {campaigns.filter(c => calculateCampaignROI(c).roi < 0).length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500">Break-Even Campaigns</h3>
            <p className="text-2xl font-bold text-gray-600">
              {campaigns.filter(c => calculateCampaignROI(c).roi === 0).length}
            </p>
          </div>
        </div>
      )}

      {/* Enhanced Campaigns Table */}
      <div className="bg-white rounded-lg shadow border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Campaign Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sponsor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ROI
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => {
                const roi = calculateCampaignROI(campaign)
                const sponsor = sponsors[campaign.sponsorId]
                
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(campaign.startDate).toLocaleDateString()} - {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{sponsor?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{sponsor?.category || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {ENHANCED_APP_PLACEMENTS[campaign.placement as keyof typeof ENHANCED_APP_PLACEMENTS] || campaign.placement}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">R{campaign.budget}</div>
                      <div className="text-xs text-gray-500">
                        Daily: R{campaign.dailyBudgetLimit || 'No limit'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white"
                        style={{ backgroundColor: getStatusColor(campaign.status) }}
                      >
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <div>Impressions: {campaign.metrics.impressions.toLocaleString()}</div>
                        <div>Clicks: {campaign.metrics.clicks}</div>
                        <div>Conversions: {campaign.metrics.conversions}</div>
                        <div>CTR: {campaign.metrics.impressions > 0 ? ((campaign.metrics.clicks / campaign.metrics.impressions) * 100).toFixed(1) : 0}%</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`text-sm font-medium ${roi.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {roi.roi.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-500">
                        R{roi.revenue.toFixed(2)} / R{roi.spend.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingCampaign(campaign)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setSelectedCampaign(campaign.id)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={() => deleteCampaign(campaign.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          
          {campaigns.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
              <p className="text-sm">Create your first enhanced campaign to get started with advanced analytics and sponsor integration.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Campaign Creation Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Create Enhanced Campaign</h3>
              <p className="text-sm text-gray-600">Advanced campaign with sponsor integration and analytics</p>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter campaign name"
                    maxLength={100}
                  />
                  <div className="text-xs text-gray-500 mt-1">Max 100 characters</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sponsor *</label>
                  <select
                    value={newCampaign.sponsorId}
                    onChange={(e) => setNewCampaign({...newCampaign, sponsorId: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Sponsor</option>
                    {Object.entries(sponsors).map(([key, sponsor]) => (
                      <option key={key} value={key}>{sponsor.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Placement Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Placement *</label>
                <select
                  value={newCampaign.placement}
                  onChange={(e) => setNewCampaign({...newCampaign, placement: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Placement</option>
                  <optgroup label="Upload & Minting System">
                    <option value="upload_start">Upload Page Entry</option>
                    <option value="file_validation">After File Validation</option>
                    <option value="metadata_entry">Metadata Entry Step</option>
                    <option value="professional_services">Professional Services Upsell</option>
                    <option value="gasless_mint_offer">Gasless Minting Upsell</option>
                    <option value="mint_success">After Successful Mint</option>
                  </optgroup>
                  <optgroup label="Radio System">
                    <option value="radio_submission_start">Radio Submission Entry</option>
                    <option value="radio_metadata_complete">After Metadata Completion</option>
                    <option value="radio_splitsheet_prompt">Split Sheet Creation</option>
                    <option value="radio_samro_upsell">SAMRO Documentation</option>
                    <option value="radio_package_complete">Package Completion</option>
                  </optgroup>
                  <optgroup label="Marketplace System">
                    <option value="marketplace_entry">Marketplace Entry</option>
                    <option value="nft_discovery">NFT Discovery Page</option>
                    <option value="purchase_flow">Purchase Flow</option>
                    <option value="collection_view">Collection Management</option>
                  </optgroup>
                  <optgroup label="Onboarding System">
                    <option value="onboarding_welcome">Onboarding Welcome</option>
                    <option value="onboarding_account">Account Setup</option>
                    <option value="onboarding_role">Role Selection</option>
                    <option value="onboarding_profile">Profile Setup</option>
                  </optgroup>
                </select>
                <div className="text-xs text-gray-500 mt-1">Choose where the sponsor content will appear</div>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign({...newCampaign, startDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="datetime-local"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign({...newCampaign, endDate: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Budget Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Budget (R)</label>
                  <input
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({...newCampaign, budget: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <div className="text-xs text-gray-500 mt-1">Total campaign budget</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit (R)</label>
                  <input
                    type="number"
                    value={newCampaign.dailyBudgetLimit}
                    onChange={(e) => setNewCampaign({...newCampaign, dailyBudgetLimit: Number(e.target.value)})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    step="0.01"
                  />
                  <div className="text-xs text-gray-500 mt-1">Daily spending limit</div>
                </div>
              </div>

              {/* Schedule Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Type</label>
                <select
                  value={newCampaign.schedule.type}
                  onChange={(e) => setNewCampaign({
                    ...newCampaign, 
                    schedule: { ...newCampaign.schedule, type: e.target.value as 'continuous' | 'scheduled' | 'burst' }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="continuous">Continuous</option>
                  <option value="scheduled">Scheduled Hours</option>
                  <option value="burst">Burst Campaign</option>
                </select>
                <div className="text-xs text-gray-500 mt-1">Campaign scheduling strategy</div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  resetNewCampaign()
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createCampaign}
                disabled={!newCampaign.name || !newCampaign.sponsorId || !newCampaign.placement}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Enhanced Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}