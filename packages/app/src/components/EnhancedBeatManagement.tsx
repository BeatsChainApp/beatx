'use client'

import { useState } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useWeb3Data } from '@/context/Web3DataContext'
import { useWriteContract } from 'wagmi'
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { parseEther } from 'viem'
import { toast } from 'react-toastify'
import { motion, AnimatePresence } from 'framer-motion'
import MintExistingBeat from '@/components/MintExistingBeat'
import DashboardAudioPlayer from '@/components/DashboardAudioPlayer'

// Define Beat type if not imported
interface Beat {
  id: string
  tokenId?: string
  title: string
  description: string
  price: number
  genre: string
  bpm: number
  producerId: string
  coverImageUrl: string
  audioUrl?: string
  isActive: boolean
  tags?: string[]
  // Professional metadata fields
  album?: string
  releaseYear?: number
  recordLabel?: string
  mood?: string
  energy?: number
  key?: string
  producer?: string
  mixer?: string
  featuredArtists?: string
  explicit?: boolean
  language?: string
  timeSignature?: string
  isrc?: string
  copyrightHolder?: string
  isNFT?: boolean
  mintPending?: boolean
}

interface EnhancedBeatManagementProps {
  onBeatUpdate?: () => void
}

export default function EnhancedBeatManagement({ onBeatUpdate }: EnhancedBeatManagementProps) {
  const { user } = useUnifiedAuth()
  const { beats, loading, refreshBeats } = useWeb3Data()
  const { writeContract } = useWriteContract()
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null)
  const [processing, setProcessing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter beats for current producer
  const producerBeats = beats.filter(beat => 
    beat.producerId?.toLowerCase() === user?.address?.toLowerCase()
  )
  
  // Apply filters and search
  const filteredBeats = producerBeats.filter(beat => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && beat.isActive) || 
      (filter === 'inactive' && !beat.isActive)
    
    const matchesSearch = 
      searchTerm === '' || 
      beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      beat.genre.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const handleEditBeat = (beat: Beat) => {
    setEditingBeat({ ...beat })
  }

  const handleUpdatePrice = async (beat: Beat, newPrice: number) => {
    if (!user?.address || processing || !beat.tokenId) return

    setProcessing(true)
    try {
      // Call smart contract to update price
      await writeContract({
        address: BeatNFTConfig.address[11155111] as `0x${string}`,
        abi: BeatNFTConfig.abi,
        functionName: 'setBeatForSale',
        args: [BigInt(beat.tokenId), parseEther(newPrice.toString())]
      })

      toast.success(`✅ Updated price for "${beat.title}" to ${newPrice} ETH`)
      await refreshBeats()
      onBeatUpdate?.()
    } catch (error) {
      console.error('Failed to update price:', error)
      toast.error('Failed to update beat price')
    } finally {
      setProcessing(false)
    }
  }

  const handleToggleAvailability = async (beat: Beat) => {
    if (!user?.address || processing || !beat.tokenId) return

    setProcessing(true)
    try {
      if (beat.isActive) {
        // Remove from sale
        await writeContract({
          address: BeatNFTConfig.address[11155111] as `0x${string}`,
          abi: BeatNFTConfig.abi,
          functionName: 'removeBeatFromSale',
          args: [BigInt(beat.tokenId)]
        })
        toast.success(`🚫 Removed "${beat.title}" from marketplace`)
      } else {
        // Put back on sale
        await writeContract({
          address: BeatNFTConfig.address[11155111] as `0x${string}`,
          abi: BeatNFTConfig.abi,
          functionName: 'setBeatForSale',
          args: [BigInt(beat.tokenId), parseEther(beat.price.toString())]
        })
        toast.success(`✅ Listed "${beat.title}" on marketplace`)
      }

      await refreshBeats()
      onBeatUpdate?.()
    } catch (error) {
      console.error('Failed to toggle availability:', error)
      toast.error('Failed to update beat availability')
    } finally {
      setProcessing(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingBeat || processing) return

    setProcessing(true)
    try {
      // Update price if changed
      const originalBeat = producerBeats.find(b => b.id === editingBeat.id)
      if (originalBeat && originalBeat.price !== editingBeat.price) {
        await handleUpdatePrice(editingBeat, editingBeat.price)
      }

      // Update local metadata (for display purposes)
      const beatKey = `beat_metadata_${editingBeat.id}`
      localStorage.setItem(beatKey, JSON.stringify({
        name: editingBeat.title,
        description: editingBeat.description,
        attributes: editingBeat.tags?.map(tag => ({ trait_type: 'tag', value: tag })) || [],
        updatedAt: new Date().toISOString()
      }))

      toast.success(`✅ Updated "${editingBeat.title}"`)
      setEditingBeat(null)
      await refreshBeats()
      onBeatUpdate?.()
    } catch (error) {
      console.error('Failed to save beat:', error)
      toast.error('Failed to save changes')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-lg font-semibold">🎵 My Beats ({producerBeats.length})</h2>
        
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search beats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <svg 
              className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          {/* Filter */}
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                filter === 'all'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                filter === 'active'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                filter === 'inactive'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Inactive
            </button>
          </div>
          
          {/* Upload Button */}
          <a 
            href="/upload" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Beat
          </a>
        </div>
      </div>

      {producerBeats.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-5xl mb-4">🎵</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No beats uploaded yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start creating and uploading your beats to see them here. You'll be able to manage pricing, availability, and track sales.
          </p>
          <a 
            href="/upload" 
            className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Upload Your First Beat
          </a>
        </div>
      ) : filteredBeats.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🔍</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No beats match your search</h3>
          <p className="text-gray-600 mb-4">Try adjusting your search or filter criteria</p>
          <button
            onClick={() => {
              setSearchTerm('')
              setFilter('all')
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          <AnimatePresence>
            {filteredBeats.map((beat) => (
              <motion.div 
                key={beat.id} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-48">
                      <img 
                        src={beat.coverImageUrl} 
                        alt={beat.title}
                        className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:opacity-80"
                        onClick={() => {
                          if (beat.audioUrl) {
                            const audio = new Audio(beat.audioUrl)
                            audio.play()
                          }
                        }}
                      />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{beat.title}</h3>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                        <span className="text-sm text-gray-500">{beat.genre}</span>
                        <span className="text-sm text-gray-500">{beat.bpm} BPM</span>
                        <span className="text-sm font-medium text-green-600">
                          {beat.price} ETH
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          beat.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {beat.isActive ? 'On Sale' : 'Not Listed'}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          beat.isNFT 
                            ? 'bg-blue-100 text-blue-800' 
                            : beat.mintPending
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {beat.isNFT ? '🎫 NFT' : beat.mintPending ? '⛽ Pending' : '📁 Local'}
                        </span>
                        {beat.tokenId && (
                          <span className="text-xs text-gray-400">
                            Token #{beat.tokenId}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MintExistingBeat 
                      beat={beat}
                      onMintSuccess={(tokenId, txHash) => {
                        console.log('Beat minted:', tokenId, txHash)
                        refreshBeats()
                        onBeatUpdate?.()
                      }}
                    />
                    <button
                      onClick={() => handleEditBeat(beat)}
                      disabled={processing}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleAvailability(beat)}
                      disabled={processing}
                      className={`inline-flex items-center px-3 py-1.5 border text-sm font-medium rounded disabled:opacity-50 ${
                        beat.isActive 
                          ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100' 
                          : 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {beat.isActive ? (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                          Delist
                        </>
                      ) : (
                        <>
                          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          List
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Modal */}
      {editingBeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          >
            <h3 className="text-lg font-semibold mb-4">Edit Beat</h3>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingBeat.title}
                    onChange={(e) => setEditingBeat({...editingBeat, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    value={editingBeat.price}
                    onChange={(e) => setEditingBeat({...editingBeat, price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {/* Album & Release Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Album</label>
                  <input
                    type="text"
                    value={editingBeat.album || ''}
                    onChange={(e) => setEditingBeat({...editingBeat, album: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Release Year</label>
                  <input
                    type="number"
                    value={editingBeat.releaseYear || new Date().getFullYear()}
                    onChange={(e) => setEditingBeat({...editingBeat, releaseYear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Record Label</label>
                  <input
                    type="text"
                    value={editingBeat.recordLabel || ''}
                    onChange={(e) => setEditingBeat({...editingBeat, recordLabel: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              {/* Musical Properties */}
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                  <select
                    value={editingBeat.genre}
                    onChange={(e) => setEditingBeat({...editingBeat, genre: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="hip-hop">Hip-Hop</option>
                    <option value="electronic">Electronic</option>
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="r&b">R&B</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">BPM</label>
                  <input
                    type="number"
                    value={editingBeat.bpm}
                    onChange={(e) => setEditingBeat({...editingBeat, bpm: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
                  <select
                    value={editingBeat.key || 'C'}
                    onChange={(e) => setEditingBeat({...editingBeat, key: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="C">C Major</option>
                    <option value="D">D Major</option>
                    <option value="E">E Major</option>
                    <option value="F">F Major</option>
                    <option value="G">G Major</option>
                    <option value="A">A Major</option>
                    <option value="B">B Major</option>
                    <option value="Am">A Minor</option>
                    <option value="Cm">C Minor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mood</label>
                  <select
                    value={editingBeat.mood || 'neutral'}
                    onChange={(e) => setEditingBeat({...editingBeat, mood: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="energetic">Energetic</option>
                    <option value="calm">Calm</option>
                    <option value="dark">Dark</option>
                    <option value="uplifting">Uplifting</option>
                  </select>
                </div>
              </div>
              
              {/* Credits */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Producer</label>
                  <input
                    type="text"
                    value={editingBeat.producer || ''}
                    onChange={(e) => setEditingBeat({...editingBeat, producer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mixer</label>
                  <input
                    type="text"
                    value={editingBeat.mixer || ''}
                    onChange={(e) => setEditingBeat({...editingBeat, mixer: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Featured Artists</label>
                  <input
                    type="text"
                    value={editingBeat.featuredArtists || ''}
                    onChange={(e) => setEditingBeat({...editingBeat, featuredArtists: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingBeat.description}
                  onChange={(e) => setEditingBeat({...editingBeat, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={editingBeat.tags?.join(', ') || ''}
                    onChange={(e) => setEditingBeat({
                      ...editingBeat, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingBeat.explicit || false}
                      onChange={(e) => setEditingBeat({...editingBeat, explicit: e.target.checked})}
                    />
                    <span className="text-sm text-gray-700">Explicit Content</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingBeat(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}