'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import React, { useState } from 'react'
import { useSiteSettings } from '@/hooks/useSiteSettings'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import { LinkComponent } from '@/components/LinkComponent'
import { toast } from 'react-toastify'
import LogoUploader from '@/components/LogoUploader'

function AdminSettingsContent() {
  const { user, isAuthenticated, hasAnyRole } = useUnifiedAuth()
  const { 
    settings, 
    loading, 
    saving,
    updateSettings,
    addFeaturedGenre,
    removeFeaturedGenre,
    toggleMaintenanceMode,
    validateSettings
  } = useSiteSettings()
  
  const [activeTab, setActiveTab] = useState('platform')
  const [newGenre, setNewGenre] = useState('')
  const [formData, setFormData] = useState(settings)

  const tabs = [
    { id: 'platform', name: 'Platform Settings', icon: '⚙️' },
    { id: 'blockchain', name: 'Blockchain', icon: '⛓️' },
    { id: 'site', name: 'Site Settings', icon: '🌐' },
    { id: 'cms', name: 'CMS', icon: '📝' }
  ]

  React.useEffect(() => {
    setFormData(settings)
  }, [settings])



  const handleSave = async () => {
    const validationErrors = validateSettings(formData)
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => toast.error(error))
      return
    }

    const success = await updateSettings(formData)
    if (success) {
      toast.success('Settings saved successfully!')
    } else {
      toast.error('Failed to save settings')
    }
  }

  const handleAddGenre = async () => {
    if (!newGenre.trim()) return
    
    const success = await addFeaturedGenre(newGenre.trim())
    if (success) {
      setNewGenre('')
      toast.success('Genre added successfully!')
    } else {
      toast.error('Genre already exists or failed to add')
    }
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-gray-600 to-gray-800 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <h1 className="text-3xl font-bold mb-2 mobile-heading">⚙️ System Settings</h1>
          <LinkComponent href="/admin" className="text-white/80 hover:text-white">← Back to Admin</LinkComponent>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
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

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow p-6">
            {activeTab === 'platform' && (
              <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Fee (%)</label>
              <input
                type="number"
                value={formData.platformFee}
                onChange={(e) => setFormData({...formData, platformFee: parseFloat(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
                min="0" max="15" step="0.1"
              />
              <p className="text-sm text-gray-600 mt-1">Commission taken from each sale (0-15%) - Smart contract deployed with 15%</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Google Tag Manager ID</label>
              <input
                type="text"
                value={formData.gtmId || ''}
                onChange={(e) => setFormData({...formData, gtmId: e.target.value})}
                placeholder="GTM-XXXXXXX"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-sm text-gray-600 mt-1">Google Analytics tracking ID</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Twitter URL</label>
                <input
                  type="url"
                  value={formData.socialMedia?.twitter || ''}
                  onChange={(e) => setFormData({...formData, socialMedia: {...formData.socialMedia, twitter: e.target.value}})}
                  placeholder="https://twitter.com/beatschain"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Instagram URL</label>
                <input
                  type="url"
                  value={formData.socialMedia?.instagram || ''}
                  onChange={(e) => setFormData({...formData, socialMedia: {...formData.socialMedia, instagram: e.target.value}})}
                  placeholder="https://instagram.com/beatschain"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Platform Logo</label>
              <LogoUploader 
                currentLogo={formData.logo} 
                onUpload={(file) => {
                  // In a real implementation, you would upload the file to a server
                  // and get back a URL. For now, we'll create a data URL.
                  const reader = new FileReader()
                  reader.onload = (e) => {
                    setFormData({...formData, logo: e.target?.result as string})
                    toast.success('Logo uploaded successfully!')
                  }
                  reader.readAsDataURL(file)
                }} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Max Upload Size (MB)</label>
              <input
                type="number"
                value={formData.maxUploadSize}
                onChange={(e) => setFormData({...formData, maxUploadSize: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border rounded-md"
                min="1" max="100"
              />
              <p className="text-sm text-gray-600 mt-1">Maximum audio file size for uploads</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Min Price (ETH)</label>
                <input
                  type="number"
                  value={formData.minimumPrice}
                  onChange={(e) => setFormData({...formData, minimumPrice: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0" step="0.001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Max Price (ETH)</label>
                <input
                  type="number"
                  value={formData.maximumPrice}
                  onChange={(e) => setFormData({...formData, maximumPrice: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                  min="0" step="0.1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Featured Genres</label>
              <div className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="Add new genre"
                    className="flex-1 px-3 py-2 border rounded-md"
                  />
                  <button
                    onClick={handleAddGenre}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {settings.featuredGenres.map(genre => (
                  <span
                    key={genre}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {genre}
                    <button
                      onClick={() => removeFeaturedGenre(genre)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-green-800">Registration Open</h3>
                  <p className="text-sm text-green-600">Allow new user registrations</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.registrationOpen}
                    onChange={(e) => setFormData({...formData, registrationOpen: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-blue-800">Sanity CMS</h3>
                  <p className="text-sm text-blue-600">Content management system integration</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.cmsEnabled || false}
                    onChange={(e) => setFormData({...formData, cmsEnabled: e.target.checked})}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <h3 className="font-medium text-red-800">Maintenance Mode</h3>
                <p className="text-sm text-red-600">Temporarily disable the platform</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={toggleMaintenanceMode}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

              </div>
            )}

            {activeTab === 'blockchain' && (
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-800 mb-2">BeatNFT Smart Contract V2 Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Contract Address:</p>
                      <p className="font-mono bg-white p-2 rounded text-xs break-all">0xcf7f010edb33f5c8582e8f97e20ef76be8b83311</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Network:</p>
                      <p className="font-medium">Sepolia Testnet</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Max File Size (MB)</label>
                  <input
                    type="number"
                    value={100}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                  <p className="text-sm text-gray-600 mt-1">Maximum file size enforced by smart contract (V2)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Storage Per Credit (MB)</label>
                  <input
                    type="number"
                    value={50}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                  <p className="text-sm text-gray-600 mt-1">Storage allocation per credit (V2 feature)</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pro NFT Price (ETH)</label>
                  <input
                    type="number"
                    value={0.1}
                    disabled
                    className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  />
                  <p className="text-sm text-gray-600 mt-1">Price for Pro NFT upgrade (unlimited storage)</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-800 mb-2">Credit Packages</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">10 credits:</span> 0.01 ETH
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">25 credits:</span> 0.02 ETH
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">50 credits:</span> 0.035 ETH
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">100 credits:</span> 0.06 ETH
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-medium text-purple-800 mb-2">Size-Based Pricing</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">0-10MB:</span> 1 credit
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">10-25MB:</span> 2 credits
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">25-50MB:</span> 3 credits
                    </div>
                    <div className="bg-white p-2 rounded">
                      <span className="font-medium">50-100MB:</span> 5 credits
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <a 
                    href="https://sepolia.etherscan.io/address/0xcf7f010edb33f5c8582e8f97e20ef76be8b83311" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 text-center"
                  >
                    View on Etherscan
                  </a>
                  <LinkComponent 
                    href="/admin/blockchain"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 text-center"
                  >
                    Blockchain Dashboard
                  </LinkComponent>
                </div>
              </div>
            )}

            {activeTab === 'site' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Google Tag Manager ID</label>
                  <input
                    type="text"
                    value={formData.gtmId || ''}
                    onChange={(e) => setFormData({...formData, gtmId: e.target.value})}
                    placeholder="GTM-XXXXXXX"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-sm text-gray-600 mt-1">Google Analytics tracking ID</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Twitter URL</label>
                    <input
                      type="url"
                      value={formData.socialMedia?.twitter || ''}
                      onChange={(e) => setFormData({...formData, socialMedia: {...formData.socialMedia, twitter: e.target.value}})}
                      placeholder="https://twitter.com/beatschain"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Instagram URL</label>
                    <input
                      type="url"
                      value={formData.socialMedia?.instagram || ''}
                      onChange={(e) => setFormData({...formData, socialMedia: {...formData.socialMedia, instagram: e.target.value}})}
                      placeholder="https://instagram.com/beatschain"
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Platform Logo</label>
                  <LogoUploader 
                    currentLogo={formData.logo} 
                    onUpload={(file) => {
                      // In a real implementation, you would upload the file to a server
                      // and get back a URL. For now, we'll create a data URL.
                      const reader = new FileReader()
                      reader.onload = (e) => {
                        setFormData({...formData, logo: e.target?.result as string})
                        toast.success('Logo uploaded successfully!')
                      }
                      reader.readAsDataURL(file)
                    }} 
                  />
                </div>
              </div>
            )}

            {activeTab === 'cms' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-blue-800">Sanity CMS</h3>
                    <p className="text-sm text-blue-600">Content management system integration</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.cmsEnabled || false}
                      onChange={(e) => setFormData({...formData, cmsEnabled: e.target.checked})}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Sanity Project ID</label>
                  <input
                    type="text"
                    value={formData.sanityProjectId || ''}
                    onChange={(e) => setFormData({...formData, sanityProjectId: e.target.value})}
                    placeholder="your-project-id"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-sm text-gray-600 mt-1">Sanity project identifier</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Dataset</label>
                  <input
                    type="text"
                    value={formData.sanityDataset || 'production'}
                    onChange={(e) => setFormData({...formData, sanityDataset: e.target.value})}
                    placeholder="production"
                    className="w-full px-3 py-2 border rounded-md"
                  />
                  <p className="text-sm text-gray-600 mt-1">Sanity dataset name</p>
                </div>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminSettingsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminSettingsPageContent() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']}>
      <AdminSettingsContent />
    </ProtectedRoute>
  )
}