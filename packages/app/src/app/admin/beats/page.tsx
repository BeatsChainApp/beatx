'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useSupabase } from '@/hooks/useSupabase'

interface Beat {
  id: string
  title: string
  artist: string
  album?: string
  genre: string
  bpm?: number
  isrc?: string
  professional_complete: boolean
  distribution_ready: boolean
  created_at: string
  plays?: number
}

export default function AdminBeatsPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminBeatsPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminBeatsPageContent() {
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const supabase = useSupabase()

  useEffect(() => {
    fetchBeats()
  }, [filter])

  const fetchBeats = async () => {
    try {
      setLoading(true)
      if (!supabase) return

      let query = supabase.from('beats').select('*')
      
      if (filter === 'professional') {
        query = query.eq('professional_complete', true)
      } else if (filter === 'distribution') {
        query = query.eq('distribution_ready', true)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      setBeats(data || [])
    } catch (error) {
      console.error('Error fetching beats:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (beat: Beat) => {
    if (beat.distribution_ready) {
      return <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Distribution Ready</span>
    } else if (beat.professional_complete) {
      return <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">Professional</span>
    } else {
      return <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">Basic</span>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 mobile-heading">Beats Management</h1>
          <p className="text-gray-600">Manage all beats in the platform</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {[
            { key: 'all', label: 'All Beats' },
            { key: 'professional', label: 'Professional' },
            { key: 'distribution', label: 'Distribution Ready' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-gray-900 mobile-heading">{beats.length}</div>
            <div className="text-sm text-gray-600">Total Beats</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600 mobile-heading">
              {beats.filter(b => b.professional_complete).length}
            </div>
            <div className="text-sm text-gray-600">Professional</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600 mobile-heading">
              {beats.filter(b => b.distribution_ready).length}
            </div>
            <div className="text-sm text-gray-600">Distribution Ready</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600 mobile-heading">
              {beats.reduce((sum, b) => sum + (b.plays || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Total Plays</div>
          </div>
        </div>

        {/* Beats Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Track
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISRC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plays
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Loading beats...
                    </td>
                  </tr>
                ) : beats.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      No beats found
                    </td>
                  </tr>
                ) : (
                  beats.map((beat) => (
                    <tr key={beat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{beat.title}</div>
                        {beat.album && (
                          <div className="text-sm text-gray-500">{beat.album}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {beat.artist}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                          {beat.genre}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(beat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {beat.isrc || 'Not assigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {beat.plays || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(beat.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}