'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import SocialShare from '@/components/SocialShare'
import Web3AudioPlayer from '@/components/Web3AudioPlayer'
import { dataProvider } from '@/adapters/unifiedDataProvider'
import { usePurchase } from '@/context/PurchaseContext'
import { Beat, Producer } from '@/types/data'

export default function ProducerPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <ProducerPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ProducerPageContent() {
  const params = useParams()
  const producerId = params.id as string
  const { selectBeatForPurchase } = usePurchase()
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [producer, setProducer] = useState<Producer | null>(null)
  const [beats, setBeats] = useState<Beat[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function loadData() {
      if (!producerId || typeof producerId !== 'string') {
        console.warn('Invalid producer ID:', producerId)
        setLoading(false)
        return
      }
      
      try {
        // First try to get Web3 producer data from localStorage
        let producerData = null
        let beatsData = []
        
        // Check if this is a Web3 producer (wallet address)
        if (producerId.startsWith('0x')) {
          // Get beats from localStorage for this producer
          const beatKey = `producer_beats_${producerId}`
          const storedBeats = localStorage.getItem(beatKey)
          
          if (storedBeats) {
            beatsData = JSON.parse(storedBeats)
            
            // Create Web3 producer profile
            producerData = {
              id: producerId,
              name: `Producer ${producerId.slice(0, 6)}...${producerId.slice(-4)}`,
              address: producerId,
              bio: `Web3 producer with ${beatsData.length} beats on BeatsChain`,
              location: 'Web3',
              genres: [...new Set(beatsData.map(b => b.genre))],
              totalBeats: beatsData.length,
              totalSales: 0,
              profileImageUrl: '',
              coverImageUrl: '',
              verified: true,
              isWeb3: true
            }
          }
        }
        
        // Fallback to unified provider if no Web3 data found
        if (!producerData) {
          producerData = await dataProvider.getProducer(producerId)
          
          if (producerData) {
            try {
              beatsData = await dataProvider.getProducerBeats(producerId)
              if (!Array.isArray(beatsData)) {
                beatsData = []
              }
            } catch (beatsError) {
              console.error('Error loading producer beats:', beatsError)
              beatsData = []
            }
          }
        }
        
        if (producerData) {
          setProducer(producerData)
          setBeats(beatsData)
        }
      } catch (error) {
        console.error('Error loading producer data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [producerId])

  const genres = [
    'all', 'amapiano', 'afrobeats', 'house', 'deep-house', 'tech-house', 'trap', 
    'hip-hop', 'drill', 'gqom', 'kwaito', 'electronic', 'techno', 'progressive',
    'trance', 'dubstep', 'drum-bass', 'garage', 'breakbeat', 'ambient'
  ]

  // Filter beats by selected genre
  const filteredBeats = selectedGenre === 'all' 
    ? beats 
    : beats.filter(beat => beat.genre?.toLowerCase() === selectedGenre.toLowerCase())

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-16 px-8 text-gray-500">
        <div className="text-7xl mb-4 mobile-heading">🎵</div>
        <p>Loading producer data...</p>
      </div>
    )
  }

  // Show not found state if no producer data
  if (!producer) {
    return (
      <div className="text-center py-16 px-8 text-gray-500">
        <div className="text-7xl mb-4 mobile-heading">🎵</div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-2 mobile-heading">
          Producer not found
        </h3>
        <p>The producer you're looking for doesn't exist or has been removed.</p>
        <a 
          href="/producers"
          className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded no-underline"
        >
          Browse All Producers
        </a>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div 
        className="h-[400px] bg-cover bg-center flex items-end p-8 text-white"
        style={{
          backgroundImage: producer.coverImageUrl 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${producer.coverImageUrl})`
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}
      >
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center text-2xl bg-cover bg-center mobile-heading"
              style={{
                backgroundImage: producer.profileImageUrl 
                  ? `url(${producer.profileImageUrl})` 
                  : 'none',
                backgroundColor: !producer.profileImageUrl ? 'rgba(255,255,255,0.2)' : 'transparent'
              }}
            >
              {!producer.profileImageUrl && '🎵'}
            </div>
            <div>
              <h1 className="text-4xl font-bold m-0 mobile-heading">
                {producer.name} {producer.verified ? ' ✓' : ''}
              </h1>
              <p className="text-lg opacity-90 m-0">
                {producer.location || 'Unknown'} • {beats?.length || 0} beats • {producer.totalSales || 0} sales
              </p>
              <p className="text-sm opacity-80 mt-2 mb-0">
                {producer.genres && producer.genres.length > 0 ? producer.genres.join(', ') : 'Various Genres'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {/* Bio & Social Sharing */}
        <div className="bg-white p-8 rounded-lg shadow-sm mb-8 border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-semibold text-gray-800 mobile-heading">About</h2>
            <div className="flex gap-2">
              <SocialShare size="sm" title={`Check out ${producer.name} on BeatsChain`} />
            </div>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {producer.bio || 'Beat creator on BeatsChain platform.'}
          </p>
        </div>

        {/* Genre Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Filter by Genre</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <button 
                key={genre} 
                onClick={() => setSelectedGenre(genre)} 
                className={`px-4 py-2 rounded-full border-none cursor-pointer text-sm font-medium capitalize ${selectedGenre === genre ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}
              >
                {genre.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Beats Collection */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mobile-heading">
              Beats Collection ({filteredBeats?.length || 0})
            </h2>
          </div>
          
          {!filteredBeats || filteredBeats.length === 0 ? (
            <div className="text-center py-16 px-8 text-gray-500">
              <div className="text-7xl mb-4 mobile-heading">🎵</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2 mobile-heading">No beats uploaded yet</h3>
              <p>This beat creator hasn't uploaded any beats to the platform yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBeats.map((beat) => (
                <Web3AudioPlayer 
                  key={beat.id}
                  beat={beat}
                  showWaveform={false}
                  className="mb-0"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}