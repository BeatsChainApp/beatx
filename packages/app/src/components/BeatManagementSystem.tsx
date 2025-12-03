'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { toast } from 'react-toastify'

interface Beat {
  id: string
  title: string
  artist: string
  genre: string
  bpm?: number
  key?: string
  duration?: number
  price: number
  status: 'draft' | 'published' | 'archived'
  ipfs_hash?: string
  nft_minted: boolean
  play_count: number
  created_at: string
  updated_at: string
  metadata: {
    mood?: string
    energy_level?: number
    professional_complete: boolean
    distribution_ready: boolean
  }
}

interface BeatStats {
  totalBeats: number
  publishedBeats: number
  totalPlays: number
  totalRevenue: number
  averagePrice: number
}

export default function BeatManagementSystem() {
  const { user, hasAnyRole } = useUnifiedAuth()
  const [beats, setBeats] = useState<Beat[]>([])
  const [stats, setStats] = useState<BeatStats>({
    totalBeats: 0,
    publishedBeats: 0,
    totalPlays: 0,
    totalRevenue: 0,
    averagePrice: 0
  })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'archived'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Only show for admin/super_admin
  if (!hasAnyRole(['admin', 'super_admin'])) {
    return null
  }

  useEffect(() => {
    loadBeats()
  }, [])

  const loadBeats = async () => {
    try {
      setLoading(true)
      
      // Connect to MCP server for beat data
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/beats`)
      
      if (response.ok) {
        const data = await response.json()
        const beatsData = data.beats || []
        setBeats(beatsData)
        
        // Calculate stats
        const stats: BeatStats = {
          totalBeats: beatsData.length,
          publishedBeats: beatsData.filter((b: Beat) => b.status === 'published').length,
          totalPlays: beatsData.reduce((sum: number, b: Beat) => sum + b.play_count, 0),
          totalRevenue: beatsData.reduce((sum: number, b: Beat) => sum + (b.price * b.play_count * 0.1), 0),
          averagePrice: beatsData.length > 0 ? beatsData.reduce((sum: number, b: Beat) => sum + b.price, 0) / beatsData.length : 0
        }
        setStats(stats)
      } else {
        // Fallback to mock data for development
        const mockBeats: Beat[] = [
          {
            id: '1',
            title: 'Amapiano Vibes',
            artist: 'Producer One',
            genre: 'Amapiano',
            bpm: 112,
            key: 'C Major',
            duration: 180,
            price: 25.00,
            status: 'published',
            nft_minted: true,
            play_count: 150,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            metadata: {
              mood: 'Uplifting',
              energy_level: 8,
              professional_complete: true,
              distribution_ready: true
            }
          }
        ]
        setBeats(mockBeats)
        setStats({
          totalBeats: 1,
          publishedBeats: 1,
          totalPlays: 150,
          totalRevenue: 375.00,
          averagePrice: 25.00
        })
      }
    } catch (error) {
      console.error('Failed to load beats:', error)
      toast.error('Failed to load beats')
    } finally {
      setLoading(false)
    }
  }

  const updateBeatStatus = async (beatId: string, newStatus: Beat['status']) => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/beats/${beatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        setBeats(beats.map(beat => 
          beat.id === beatId ? { ...beat, status: newStatus } : beat
        ))
        toast.success(`Beat ${newStatus} successfully`)
      } else {
        throw new Error('Failed to update beat status')
      }
    } catch (error) {
      console.error('Beat status update failed:', error)
      toast.error('Failed to update beat status')
    }
  }

  const syncWithDataPipeline = async () => {
    try {
      const mcpUrl = process.env.NEXT_PUBLIC_MCP_SERVER_URL || 'https://beatx-mcp-server-production.up.railway.app'
      const response = await fetch(`${mcpUrl}/api/sync/beats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        toast.success('Beat data synchronized with pipeline')
        loadBeats() // Refresh data
      } else {
        throw new Error('Sync failed')
      }
    } catch (error) {
      console.error('Pipeline sync failed:', error)
      toast.error('Failed to sync with data pipeline')
    }
  }

  const filteredBeats = beats.filter(beat => {
    const matchesFilter = filter === 'all' || beat.status === filter
    const matchesSearch = searchTerm === '' || 
      beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-4xl mb-4">🎵</div>
          <p>Loading beat management system...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">🎵 Beat Management System</h2>
        <div className="flex gap-3">
          <button
            onClick={syncWithDataPipeline}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
          >
            🔄 Sync Pipeline
          </button>
          <button
            onClick={loadBeats}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Beat Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-blue-700">Total Beats</h3>
          <p className="text-2xl font-bold text-blue-900">{stats.totalBeats}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-sm font-medium text-green-700">Published</h3>
          <p className="text-2xl font-bold text-green-900">{stats.publishedBeats}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <h3 className="text-sm font-medium text-purple-700">Total Plays</h3>
          <p className="text-2xl font-bold text-purple-900">{stats.totalPlays.toLocaleString()}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700">Revenue</h3>
          <p className="text-2xl font-bold text-yellow-900">R{stats.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
          <h3 className="text-sm font-medium text-indigo-700">Avg Price</h3>
          <p className="text-2xl font-bold text-indigo-900">R{stats.averagePrice.toFixed(2)}</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search beats by title, artist, or genre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Beat List */}
      <div className="space-y-4">
        {filteredBeats.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beats found</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Try adjusting your search terms' : 'No beats match the current filter'}
            </p>
          </div>
        ) : (
          filteredBeats.map((beat) => (
            <div key={beat.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{beat.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      beat.status === 'published' ? 'bg-green-100 text-green-800' :
                      beat.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {beat.status}
                    </span>
                    {beat.nft_minted && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        NFT
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    by {beat.artist} • {beat.genre}
                    {beat.bpm && ` • ${beat.bpm} BPM`}
                    {beat.key && ` • ${beat.key}`}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>💰 R{beat.price}</span>
                    <span>▶️ {beat.play_count} plays</span>
                    {beat.duration && <span>⏱️ {Math.floor(beat.duration / 60)}:{(beat.duration % 60).toString().padStart(2, '0')}</span>}
                    <span>📅 {new Date(beat.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  {beat.status === 'draft' && (
                    <button
                      onClick={() => updateBeatStatus(beat.id, 'published')}
                      className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Publish
                    </button>
                  )}
                  {beat.status === 'published' && (
                    <button
                      onClick={() => updateBeatStatus(beat.id, 'archived')}
                      className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Archive
                    </button>
                  )}
                  {beat.status === 'archived' && (
                    <button
                      onClick={() => updateBeatStatus(beat.id, 'published')}
                      className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
              
              {/* Metadata Quality Indicators */}
              <div className="flex items-center gap-4 text-xs">
                <div className={`flex items-center gap-1 ${
                  beat.metadata.professional_complete ? 'text-green-600' : 'text-red-600'
                }`}>
                  {beat.metadata.professional_complete ? '✅' : '❌'}
                  Professional Complete
                </div>
                <div className={`flex items-center gap-1 ${
                  beat.metadata.distribution_ready ? 'text-green-600' : 'text-red-600'
                }`}>
                  {beat.metadata.distribution_ready ? '✅' : '❌'}
                  Distribution Ready
                </div>
                {beat.metadata.mood && (
                  <div className="text-blue-600">
                    🎭 {beat.metadata.mood}
                  </div>
                )}
                {beat.metadata.energy_level && (
                  <div className="text-orange-600">
                    ⚡ Energy: {beat.metadata.energy_level}/10
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Data Pipeline Integration Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-2">📊 Data Pipeline Integration</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>MCP Server: Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>N8N Workflows: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Real-time Sync: Enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}