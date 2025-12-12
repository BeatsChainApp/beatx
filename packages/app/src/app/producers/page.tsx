'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import React from 'react'
import CmsHeroSection from '@/components/HeroSection'
import ProducerCard from '@/components/ProducerCard'
import { Pagination } from '@/components/Pagination'
import { dataProvider } from '@/adapters/unifiedDataProvider'
import { Producer } from '@/types/data'
import { client } from '@/lib/sanity-client'


export default function ProducersPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <ProducersPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function ProducersPageContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [producers, setProducers] = useState<Producer[]>([])
  const [loading, setLoading] = useState(true)
  const [heroData, setHeroData] = useState(null)
  const producersPerPage = 12

  // Load producers and hero data
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        
        // Get Web3 producers first, then fallback to Sanity
        let producersData = []
        
        // Get Web3 producers from localStorage
        const web3Producers = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key?.startsWith('producer_beats_')) {
            const address = key.replace('producer_beats_', '')
            const beatsStr = localStorage.getItem(key)
            if (beatsStr) {
              const beats = JSON.parse(beatsStr)
              if (beats.length > 0) {
                web3Producers.push({
                  id: address,
                  name: `Producer ${address.slice(0, 6)}...${address.slice(-4)}`,
                  address,
                  bio: `Web3 producer with ${beats.length} beats`,
                  location: 'Web3',
                  genres: [...new Set(beats.map(b => b.genre))],
                  totalBeats: beats.length,
                  totalSales: 0,
                  profileImageUrl: '',
                  coverImageUrl: '',
                  verified: true,
                  isWeb3: true
                })
              }
            }
          }
        }
        
        // Combine Web3 producers with Sanity fallback
        if (web3Producers.length > 0) {
          producersData = web3Producers
        } else {
          producersData = await dataProvider.getAllProducers()
        }
        
        setProducers(producersData)
        
        // Load hero data from Sanity
        if (client) {
          try {
            const data = await client.fetch(`*[_type == "page" && slug.current == "producers"][0].heroSection`)
            if (data) setHeroData(data)
          } catch (error) {
            console.warn('Failed to fetch hero data from Sanity:', error)
          }
        }
      } catch (error) {
        console.error('Error loading producers:', error)
        setProducers([])
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="text-center py-12">
          <div className="text-6xl mb-4 mobile-heading">🎵</div>
          <p className="text-gray-600">Loading producers...</p>
        </div>
      </div>
    )
  }
  
  const allProducers = producers
  const totalPages = Math.ceil(allProducers.length / producersPerPage)
  const startIndex = (currentPage - 1) * producersPerPage
  const currentProducers = allProducers.slice(startIndex, startIndex + producersPerPage)

  return (
    <div>
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 min-h-[50vh] sm:min-h-[60vh] flex items-center text-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              🎤 Meet Our Beat Makers
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto px-4">
              Connect with South Africa's most talented beat creators and producers
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-4">
              <div className="bg-gray-900 bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-gray-900 border-opacity-20 text-xs sm:text-sm font-medium">
                🎹 Growing Community
              </div>
              <div className="bg-gray-900 bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-gray-900 border-opacity-20 text-xs sm:text-sm font-medium">
                🇿🇦 South African Focus
              </div>
              <div className="bg-gray-900 bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-gray-900 border-opacity-20 text-xs sm:text-sm font-medium">
                🚀 New Platform
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">

      {/* Radio Submission Card */}
      <div className="mb-6 sm:mb-8">
        <RadioSubmissionCard />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <input
            type="text"
            placeholder="Search producers..."
            className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500"
          />
          <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option>All Genres</option>
            <option>Amapiano</option>
            <option>Hip Hop</option>
            <option>Afrobeats</option>
            <option>House</option>
            <option>Trap</option>
          </select>
          <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option>All Locations</option>
            <option>Johannesburg</option>
            <option>Cape Town</option>
            <option>Durban</option>
            <option>Pretoria</option>
          </select>
          <select className="px-3 sm:px-4 py-2 border border-gray-300 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-yellow-500">
            <option>Sort by Rating</option>
            <option>Most Sales</option>
            <option>Most Beats</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Producers Grid */}
      {currentProducers.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-600">
          <div className="text-6xl sm:text-8xl mb-4">🎵</div>
          <h3 className="text-xl sm:text-2xl font-semibold mb-2 text-gray-900">No beat makers yet</h3>
          <p className="text-sm sm:text-base">Be the first beat creator to join our platform!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {currentProducers.map((producer, index) => (
            <ProducerCard key={`${producer.id}-${index}`} producer={producer} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalItems={allProducers.length}
          itemsPerPage={producersPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      </div>
    </div>
  )
}