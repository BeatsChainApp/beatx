'use client'

import { useState } from 'react'
import { useBeats } from '@/hooks/useBeats'
import BeatCard from './BeatCard'

export default function EnhancedBeatManagement() {
  const { beats } = useBeats()
  const [filter, setFilter] = useState('all')

  return (
    <div>
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            All Beats
          </button>
          <button 
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded ${filter === 'published' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            Published
          </button>
          <button 
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded ${filter === 'draft' ? 'bg-purple-600 text-white' : 'bg-gray-200'}`}
          >
            Drafts
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beats.map((beat) => (
          <BeatCard key={beat.id} beat={beat} />
        ))}
      </div>

      {beats.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
          <h3 className="text-xl font-semibold mb-2">No beats yet</h3>
          <p className="text-gray-600">Upload your first beat to get started</p>
        </div>
      )}
    </div>
  )
}