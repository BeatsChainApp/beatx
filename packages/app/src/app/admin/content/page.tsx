'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useWeb3Data } from '@/context/Web3DataContext'
import { useWriteContract } from 'wagmi'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Pagination } from '@/components/Pagination'
import { toast } from 'react-toastify'
import { Beat } from '@/types'
import DashboardAudioPlayer from '@/components/DashboardAudioPlayer'

interface ContentModerationAction {
  beatId: string
  action: 'approve' | 'reject' | 'flag' | 'takedown'
  reason: string
  moderatedBy: string
  moderatedAt: string
  blockNumber?: number
}

function AdminContentContent() {
  const { user } = useUnifiedAuth()
  const { beats, loading, refreshBeats } = useWeb3Data()
  const { writeContract } = useWriteContract()
  const [filter, setFilter] = useState<'all' | 'pending' | 'flagged' | 'approved' | 'rejected'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [beatsPerPage] = useState(10)
  const [moderatingBeat, setModeratingBeat] = useState<Beat | null>(null)
  const [moderationReason, setModerationReason] = useState('')
  const [processing, setProcessing] = useState(false)

  const [moderationActions, setModerationActions] = useState<ContentModerationAction[]>([])

  useEffect(() => {
    loadModerationActions()
  }, [])

  const loadModerationActions = () => {
    if (typeof window === 'undefined') return
    
    try {
      const stored = localStorage.getItem('content_moderation_actions')
      if (stored) {
        setModerationActions(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load moderation actions:', error)
    }
  }

  const saveModerationAction = (action: ContentModerationAction) => {
    if (typeof window === 'undefined') return
    
    try {
      const updated = [...moderationActions, action]
      setModerationActions(updated)
      localStorage.setItem('content_moderation_actions', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save moderation action:', error)
    }
  }

  const getBeatModerationStatus = (beatId: string) => {
    const actions = moderationActions.filter(action => action.beatId === beatId)
    if (actions.length === 0) return 'pending'
    
    const latestAction = actions.sort((a, b) => new Date(b.moderatedAt).getTime() - new Date(a.moderatedAt).getTime())[0]
    return latestAction.action
  }

  const filteredBeats = beats.filter(beat => {
    const status = getBeatModerationStatus(beat.id)
    if (filter === 'all') return true
    if (filter === 'pending') return status === 'pending' || !moderationActions.some(a => a.beatId === beat.id)
    return status === filter
  })

  const handleModerateContent = (beat: Beat, action: 'approve' | 'reject' | 'flag' | 'takedown') => {
    setModeratingBeat(beat)
    setModerationReason('')
    
    if (action === 'approve') {
      handleConfirmModeration(beat, action, 'Content approved for platform')
    } else {
      // For other actions, show reason modal
      setModeratingBeat(beat)
    }
  }

  const handleConfirmModeration = async (beat: Beat, action: 'approve' | 'reject' | 'flag' | 'takedown', reason?: string) => {
    if (!user?.address || processing) return
    
    setProcessing(true)
    try {
      const moderationAction: ContentModerationAction = {
        beatId: beat.id,
        action,
        reason: reason || moderationReason,
        moderatedBy: user.address,
        moderatedAt: new Date().toISOString(),
        blockNumber: Date.now() // Placeholder for actual block number
      }
      
      saveModerationAction(moderationAction)
      
      // Update beat status in localStorage if needed
      if (action === 'takedown' || action === 'reject') {
        const beatKey = `beat_status_${beat.id}`
        localStorage.setItem(beatKey, JSON.stringify({
          status: action,
          reason: moderationAction.reason,
          moderatedAt: moderationAction.moderatedAt,
          moderatedBy: user.address
        }))
      }
      
      const actionMessages = {
        approve: '✅ Content approved',
        reject: '❌ Content rejected', 
        flag: '🚩 Content flagged for review',
        takedown: '🚫 Content taken down'
      }
      
      toast.success(`${actionMessages[action]}: ${beat.title}`)
      setModeratingBeat(null)
      setModerationReason('')
      
    } catch (error) {
      console.error('Failed to moderate content:', error)
      toast.error('Failed to moderate content')
    } finally {
      setProcessing(false)
    }
  }

  const getStatusBadge = (beatId: string) => {
    const status = getBeatModerationStatus(beatId)
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      flagged: 'bg-orange-100 text-orange-800',
      takedown: 'bg-gray-100 text-gray-800'
    }
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badges[status as keyof typeof badges] || badges.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-8">
        <div className="container mx-auto px-4 mobile-container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 mobile-heading">🛡️ Content Moderation</h1>
              <p className="opacity-90">Review and moderate beat uploads</p>
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
            <h2 className="text-lg font-semibold">Filter Content</h2>
          </div>
          <div className="flex gap-2">
            {(['all', 'pending', 'flagged', 'approved', 'rejected'] as const).map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === filterOption
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">
              Content ({filteredBeats.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading content...</p>
            </div>
          ) : filteredBeats.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-4xl mb-4 mobile-heading">📝</div>
              <p className="text-gray-600 mb-2">No content found</p>
              <p className="text-sm text-gray-500">Content will appear here as users upload beats</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBeats.slice((currentPage - 1) * beatsPerPage, currentPage * beatsPerPage).map((beat) => (
                    <tr key={beat.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="w-64">
                          <DashboardAudioPlayer 
                            beat={beat}
                            variant="admin"
                            showModeration={true}
                            onApprove={() => handleModerateContent(beat, 'approve')}
                            onReject={() => handleModerateContent(beat, 'reject')}
                            className="mb-0"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {beat.producerId.slice(0, 6)}...{beat.producerId.slice(-4)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(beat.id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {beat.createdAt.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleModerateContent(beat, 'approve')}
                            className="text-green-600 hover:text-green-900"
                            disabled={processing}
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleModerateContent(beat, 'flag')}
                            className="text-orange-600 hover:text-orange-900"
                            disabled={processing}
                          >
                            Flag
                          </button>
                          <button 
                            onClick={() => handleModerateContent(beat, 'reject')}
                            className="text-red-600 hover:text-red-900"
                            disabled={processing}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <Pagination
            currentPage={currentPage}
            totalItems={filteredBeats.length}
            itemsPerPage={beatsPerPage}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Moderation Modal */}
        {moderatingBeat && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Moderate Content</h3>
              <p className="text-gray-600 mb-4">
                Moderating: <strong>{moderatingBeat.title}</strong>
              </p>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason *
                </label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="Enter moderation reason..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setModeratingBeat(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmModeration(moderatingBeat, 'flag')}
                  disabled={!moderationReason.trim() || processing}
                  className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Flag Content'}
                </button>
                <button
                  onClick={() => handleConfirmModeration(moderatingBeat, 'reject')}
                  disabled={!moderationReason.trim() || processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminContentPage() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["admin","super_admin"]}>
      <ResponsiveWrapper pageType="admin">
        <AdminContentPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function AdminContentPageContent() {
  return (
    <ProtectedRoute anyRole={['admin', 'super_admin']}>
      <AdminContentContent />
    </ProtectedRoute>
  )
}