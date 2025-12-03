'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useState, useEffect } from 'react'
import { useUnifiedAuth } from '@/context/UnifiedAuthContext'
import { useBeats } from '@/hooks/useBeats'
import { useBeatNFT } from '@/hooks/useBeatNFT.enhanced'
import DashboardLayout from '@/components/DashboardLayout'
import BeatCard from '@/components/BeatCard'
import { LinkComponent } from '@/components/LinkComponent'
import ProtectedRoute from '@/components/ProtectedRoute'

function MusicDashboardContent() {
  const { user } = useUnifiedAuth()
  const { beats } = useBeats()
  const { balance } = useBeatNFT()
  const [favorites, setFavorites] = useState<string[]>([])
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([])
  const [following, setFollowing] = useState<string[]>([])

  useEffect(() => {
    // Load user data from localStorage
    if (user?.address) {
      const userFavorites = JSON.parse(localStorage.getItem(`favorites_${user.address}`) || '[]')
      const userRecent = JSON.parse(localStorage.getItem(`recent_${user.address}`) || '[]')
      const userFollowing = JSON.parse(localStorage.getItem(`following_${user.address}`) || '[]')
      
      setFavorites(userFavorites)
      setRecentlyPlayed(userRecent)
      setFollowing(userFollowing)
    }
  }, [user])

  const toggleFavorite = (beatId: string) => {
    const newFavorites = favorites.includes(beatId) 
      ? favorites.filter(id => id !== beatId)
      : [...favorites, beatId]
    
    setFavorites(newFavorites)
    if (user?.address) {
      localStorage.setItem(`favorites_${user.address}`, JSON.stringify(newFavorites))
    }
  }

  const favoriteBeats = beats.filter(beat => favorites.includes(beat.id))
  const trendingBeats = beats.slice(0, 6)
  const recommendedBeats = beats.filter(beat => !favorites.includes(beat.id)).slice(0, 4)

  return (
      <div>
        <h1 className="text-3xl font-bold mb-6 mobile-heading">🎧 Music Dashboard</h1>
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-2 mobile-heading">Welcome back, Music Lover!</h2>
          <p className="opacity-90 mb-4">Discover amazing beats from talented SA producers</p>
          <div className="flex gap-4 text-sm">
            <div className="bg-white/20 px-3 py-1 rounded-full">
              ❤️ {favorites.length} Favorites
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              🎵 {recentlyPlayed.length} Recently Played
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              👥 {following.length} Following
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{favorites.length}</p>
              </div>
              <div className="text-red-500 text-2xl mobile-heading">❤️</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recently Played</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{recentlyPlayed.length}</p>
              </div>
              <div className="text-blue-500 text-2xl mobile-heading">🎵</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Following</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{following.length}</p>
              </div>
              <div className="text-green-500 text-2xl mobile-heading">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Credits</p>
                <p className="text-2xl font-bold text-gray-900 mobile-heading">{balance.hasProNFT ? '∞' : balance.credits}</p>
              </div>
              <div className="text-purple-500 text-2xl mobile-heading">🎫</div>
            </div>
          </div>
        </div>

        {/* Trending Beats */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">🔥 Trending Beats</h2>
            <LinkComponent href="/browse" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
              View All
            </LinkComponent>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingBeats.map((beat) => (
              <BeatCard 
                key={beat.id} 
                beat={beat}
                onFavorite={() => toggleFavorite(beat.id)}
                isFavorite={favorites.includes(beat.id)}
              />
            ))}
          </div>
        </div>

        {/* Your Favorites */}
        {favorites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">❤️ Your Favorites</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteBeats.slice(0, 6).map((beat) => (
                <BeatCard 
                  key={beat.id} 
                  beat={beat}
                  onFavorite={() => toggleFavorite(beat.id)}
                  isFavorite={true}
                />
              ))}
            </div>
            {favoriteBeats.length > 6 && (
              <div className="text-center mt-4">
                <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                  View All Favorites ({favoriteBeats.length})
                </button>
              </div>
            )}
          </div>
        )}

        {/* Recommended for You */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">✨ Recommended for You</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedBeats.map((beat) => (
              <BeatCard 
                key={beat.id} 
                beat={beat}
                onFavorite={() => toggleFavorite(beat.id)}
                isFavorite={favorites.includes(beat.id)}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <LinkComponent href="/browse" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3 mobile-heading">🔍</div>
                <h3 className="font-semibold mb-2">Discover Beats</h3>
                <p className="text-sm text-gray-600">Explore thousands of beats from SA producers</p>
              </div>
            </div>
          </LinkComponent>

          <LinkComponent href="/producers" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3 mobile-heading">🎤</div>
                <h3 className="font-semibold mb-2">Find Producers</h3>
                <p className="text-sm text-gray-600">Connect with talented beat makers</p>
              </div>
            </div>
          </LinkComponent>

          <LinkComponent href="/beatnft-store" className="block">
            <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="text-center">
                <div className="text-4xl mb-3 mobile-heading">🎫</div>
                <h3 className="font-semibold mb-2">Get Credits</h3>
                <p className="text-sm text-gray-600">Purchase BeatNFT credits for uploads</p>
              </div>
            </div>
          </LinkComponent>
        </div>
      </div>
  )
}

export default function MusicDashboard() {
  return (
    <UniversalLayout requireAuth={true} allowedRoles={["producer","admin","super_admin"]}>
      <ResponsiveWrapper pageType="dashboard">
        <MusicDashboardContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}