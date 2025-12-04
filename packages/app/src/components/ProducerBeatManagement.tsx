'use client'

import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useWeb3Data } from '@/context/Web3DataContext'
// TODO: Replace with Thirdweb contract interactions
import { BeatNFTConfig } from '@/contracts/BeatNFT'
import { parseEther } from 'viem'
import { toast } from 'react-toastify'
import { Beat } from '@/types'

interface BeatManagementProps {
  onBeatUpdate?: () => void
}

export default function ProducerBeatManagement({ onBeatUpdate }: BeatManagementProps) {
  const { user } = useUnifiedAuth()
  const { beats, loading, refreshBeats } = useWeb3Data()
  // TODO: Implement with Thirdweb
  const writeContract = () => {}
  const publicClient = null
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null)
  const [processing, setProcessing] = useState(false)

  // Filter beats for current producer
  const producerBeats = beats.filter(beat => 
    beat.producerId.toLowerCase() === user?.address?.toLowerCase()
  )

  const handleEditBeat = (beat: Beat) => {
    setEditingBeat({ ...beat })
  }

  const handleUpdatePrice = async (beat: Beat, newPrice: number) => {
    if (!user?.address || processing) return

    setProcessing(true)
    try {
      // Call smart contract to update price
      await writeContract({
        address: BeatNFTConfig.address[11155111] as `0x${string}`,
        abi: BeatNFTConfig.abi,
        functionName: 'setBeatForSale',
        args: [BigInt(beat.tokenId || 0), parseEther(newPrice.toString())]
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
    if (!user?.address || processing) return

    setProcessing(true)
    try {
      if (beat.isActive) {
        // Remove from sale
        await writeContract({
          address: BeatNFTConfig.address[11155111] as `0x${string}`,
          abi: BeatNFTConfig.abi,
          functionName: 'removeBeatFromSale',
          args: [BigInt(beat.tokenId || 0)]
        })
        toast.success(`🚫 Removed "${beat.title}" from marketplace`)
      } else {
        // Put back on sale
        await writeContract({
          address: BeatNFTConfig.address[11155111] as `0x${string}`,
          abi: BeatNFTConfig.abi,
          functionName: 'setBeatForSale',
          args: [BigInt(beat.tokenId || 0), parseEther(beat.price.toString())]
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
        title: editingBeat.title,
        description: editingBeat.description,
        tags: editingBeat.tags,
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
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">🎵 My Beats ({producerBeats.length})</h2>
      </div>

      {producerBeats.length === 0 ? (
        <div className="p-8 text-center">
          <div className="text-4xl mb-4">🎵</div>
          <p className="text-gray-600 mb-2">No beats uploaded yet</p>
          <p className="text-sm text-gray-500 mb-4">Start creating and uploading your beats to see them here</p>
          <a 
            href="/upload" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Upload Your First Beat
          </a>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {producerBeats.map((beat) => (
            <div key={beat.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img 
                    src={beat.coverImageUrl} 
                    alt={beat.title}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900">{beat.title}</h3>
                    <p className="text-sm text-gray-500">{beat.genre} • {beat.bpm} BPM</p>
                    <div className="flex items-center space-x-4 mt-1">
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
                      {beat.tokenId && (
                        <span className="text-xs text-gray-400">
                          Token #{beat.tokenId}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditBeat(beat)}
                    disabled={processing}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleToggleAvailability(beat)}
                    disabled={processing}
                    className={`text-sm font-medium disabled:opacity-50 ${
                      beat.isActive 
                        ? 'text-red-600 hover:text-red-900' 
                        : 'text-green-600 hover:text-green-900'
                    }`}
                  >
                    {beat.isActive ? 'Remove' : 'List'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingBeat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit Beat</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={editingBeat.title}
                  onChange={(e) => setEditingBeat({...editingBeat, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (ETH)
                </label>
                <input
                  type="number"
                  step="0.001"
                  min="0.001"
                  value={editingBeat.price}
                  onChange={(e) => setEditingBeat({...editingBeat, price: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingBeat.description}
                  onChange={(e) => setEditingBeat({...editingBeat, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}