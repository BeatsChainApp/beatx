'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import React, { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardAudioPlayer from '@/components/DashboardAudioPlayer'
import { Pagination } from '@/components/Pagination'

// Real purchased beats data from user's wallet/profile

function LibraryContent() {
  const { user } = useUnifiedAuth()
  const [currentPage, setCurrentPage] = useState(1)
  const [beatsPerPage] = useState(10)
  const [purchasedBeats, setPurchasedBeats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPurchasedBeats = async () => {
      // PRIORITY: Use email as primary identifier, wallet as fallback
      const userIdentifier = user?.email || user?.address
      if (!userIdentifier) {
        setLoading(false)
        return
      }

      try {
        // Try email-based storage first, then wallet-based
        const emailKey = `purchases_email_${user.email}`
        const walletKey = `purchases_${user.address}`
        
        let stored = user?.email ? localStorage.getItem(emailKey) : null
        if (!stored && user?.address) {
          stored = localStorage.getItem(walletKey)
        }
        
        if (stored) {
          const purchases = JSON.parse(stored)
          setPurchasedBeats(purchases)
        } else {
          setPurchasedBeats([])
        }
      } catch (error) {
        console.error('Error loading purchased beats:', error)
        setPurchasedBeats([])
      } finally {
        setLoading(false)
      }
    }

    loadPurchasedBeats()
  }, [user?.email, user?.address])

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
            🎧 My Beat Library
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
            Access your purchased beats, licenses, and downloads
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 mobile-container">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Beats</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">{purchasedBeats.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">
                R{purchasedBeats.reduce((sum, beat) => sum + (beat.price || 0), 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900 mobile-heading">
                {purchasedBeats.reduce((sum, beat) => sum + (beat.downloadCount || 0), 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Purchased Beats */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Purchased Beats</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4 mobile-heading">🔄</div>
            <p className="text-gray-600">Loading your library...</p>
          </div>
        ) : purchasedBeats.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No beats purchased yet</h3>
            <p className="text-gray-500 mb-4">Browse the marketplace to find beats you love</p>
            <a
              href="/beatnfts"
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            >
              Browse BeatNFTs
            </a>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200">
              {purchasedBeats.slice((currentPage - 1) * beatsPerPage, currentPage * beatsPerPage).map((beat) => (
                <div key={beat.id} className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4">
                      {beat.coverImageUrl && (
                        <img
                          src={beat.coverImageUrl}
                          alt={beat.title}
                          className="w-16 h-16 rounded object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{beat.title}</h3>
                        <p className="text-gray-600">{beat.genre} • {beat.bpm} BPM • {beat.key}</p>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>Purchased: {beat.purchaseDate.toLocaleDateString()}</span>
                          <span className="capitalize">{beat.licenseType} License</span>
                          <span>{beat.downloadCount} downloads</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button onClick={() => alert('Download started! File will be available in your downloads.')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm">
                        Download
                      </button>
                      <button onClick={() => alert('License agreement opened! View your usage rights.')} className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50 text-sm">
                        License
                      </button>
                    </div>
                  </div>

                  <DashboardAudioPlayer 
                    beat={beat}
                    variant="profile"
                    showOwnership={true}
                    enablePurchase={false}
                    className="mb-0"
                  />
                </div>
              ))}
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={purchasedBeats.length}
              itemsPerPage={beatsPerPage}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>

      {/* Getting Started Guide */}
      {!loading && purchasedBeats.length === 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">🚀 Get Started with BeatsChain</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Marketplace</p>
                <p className="text-gray-600">Discover beats from talented producers</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Purchase Beats</p>
                <p className="text-gray-600">Choose your license and complete purchase</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-full">
                <span className="text-green-600 font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Access Library</p>
                <p className="text-gray-600">Download and manage your beats here</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

function LibraryPage() {
  return (
    <ProtectedRoute requireWallet={false}>
      <LibraryContent />
    </ProtectedRoute>
  )
}

export default dynamic(() => Promise.resolve(LibraryPage), {
  ssr: false
})