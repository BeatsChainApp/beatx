'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import CmsHeroSection from '@/components/HeroSection'
import ProducerCard from '@/components/ProducerCard'
import { Pagination } from '@/components/Pagination'
import { dataProvider } from '@/adapters/unifiedDataProvider'
import { Producer } from '@/types/data'
import { client } from '@/lib/sanity-client'
import RadioSubmissionCard from '@/components/producer/RadioSubmissionCard'

export default function ProducersPage() {
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🎵</div>
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
        <div style={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          color: '#1f2937',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              🎤 Meet Our Beat Makers
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
              Connect with South Africa's most talented beat creators and producers
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(31,41,55,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(31,41,55,0.2)' }}>
                🎹 Growing Community
              </div>
              <div style={{ background: 'rgba(31,41,55,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(31,41,55,0.2)' }}>
                🇿🇦 South African Focus
              </div>
              <div style={{ background: 'rgba(31,41,55,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(31,41,55,0.2)' }}>
                🚀 New Platform
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Radio Submission Card */}
      <div style={{ marginBottom: '2rem' }}>
        <RadioSubmissionCard />
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '2rem',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <input
            type="text"
            placeholder="Search producers..."
            style={{
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.375rem',
              fontSize: '0.875rem'
            }}
          />
          <select style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            <option>All Genres</option>
            <option>Hip Hop</option>
            <option>Trap</option>
            <option>Electronic</option>
            <option>R&B</option>
            <option>Lo-Fi</option>
          </select>
          <select style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            <option>All Locations</option>
            <option>United States</option>
            <option>Europe</option>
            <option>Asia</option>
          </select>
          <select style={{
            padding: '0.75rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem'
          }}>
            <option>Sort by Rating</option>
            <option>Most Sales</option>
            <option>Most Beats</option>
            <option>Newest</option>
          </select>
        </div>
      </div>

      {/* Producers Grid */}
      {currentProducers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#6b7280' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎵</div>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1f2937' }}>No beat makers yet</h3>
          <p>Be the first beat creator to join our platform!</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
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