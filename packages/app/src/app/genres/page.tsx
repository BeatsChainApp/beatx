'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useBeats } from '@/hooks/useBeats'
import { LinkComponent } from '@/components/LinkComponent'

const GENRE_INFO = {
  'hip-hop': {
    description: 'Classic hip hop beats with boom bap drums and soulful samples',
    color: 'bg-orange-500',
    icon: '🎤'
  },
  'trap': {
    description: 'Hard-hitting trap beats with 808s and hi-hats',
    color: 'bg-red-500',
    icon: '🔥'
  },
  'r&b': {
    description: 'Smooth R&B instrumentals perfect for vocals',
    color: 'bg-purple-500',
    icon: '💜'
  },
  'pop': {
    description: 'Catchy pop beats ready for mainstream success',
    color: 'bg-pink-500',
    icon: '⭐'
  },
  'electronic': {
    description: 'Electronic and EDM beats for the dancefloor',
    color: 'bg-blue-500',
    icon: '⚡'
  }
}

export default function GenresPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <GenresPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function GenresPageContent() {
  const { beats, loading } = useBeats()

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 mobile-container">
        <div className="flex justify-center items-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading genres...</p>
          </div>
        </div>
      </div>
    )
  }

  // Get genre statistics
  const genreStats = beats.reduce((acc, beat) => {
    const genre = beat.genre
    if (!acc[genre]) {
      acc[genre] = {
        count: 0,
        avgPrice: 0,
        totalPrice: 0,
        minPrice: Infinity,
        maxPrice: 0
      }
    }
    acc[genre].count++
    acc[genre].totalPrice += beat.price
    acc[genre].avgPrice = acc[genre].totalPrice / acc[genre].count
    acc[genre].minPrice = Math.min(acc[genre].minPrice, beat.price)
    acc[genre].maxPrice = Math.max(acc[genre].maxPrice, beat.price)
    return acc
  }, {} as Record<string, any>)

  const genres = Object.keys(genreStats).sort()

  return (
    <div className="container mx-auto px-4 py-8 mobile-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 mobile-heading">Browse by Genre</h1>
        <p className="text-gray-600">Explore beats organized by musical style and genre</p>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {genres.map(genre => {
          const info = GENRE_INFO[genre as keyof typeof GENRE_INFO] || {
            description: `${genre.charAt(0).toUpperCase() + genre.slice(1)} beats`,
            color: 'bg-gray-500',
            icon: '🎵'
          }
          const stats = genreStats[genre]

          return (
            <LinkComponent
              key={genre}
              href={`/marketplace?genre=${genre}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-all group-hover:scale-105">
                {/* Header */}
                <div className={`${info.color} p-6 text-white`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl mobile-heading">{info.icon}</span>
                        <h3 className="text-xl font-bold capitalize">{genre}</h3>
                      </div>
                      <p className="text-white/90 text-sm">{info.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold mobile-heading">{stats.count}</p>
                      <p className="text-white/90 text-sm">beats</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        ${stats.avgPrice.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Avg Price</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        ${stats.minPrice.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">From</p>
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        ${stats.maxPrice.toFixed(0)}
                      </p>
                      <p className="text-xs text-gray-500">Up to</p>
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-between text-sm text-gray-500 group-hover:text-blue-600 transition-colors">
                    <span>Browse {genre} beats</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </LinkComponent>
          )
        })}
      </div>

      {/* Popular Genres */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold mb-4">Popular Genres</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {genres
            .sort((a, b) => genreStats[b].count - genreStats[a].count)
            .map((genre, index) => (
              <LinkComponent
                key={genre}
                href={`/marketplace?genre=${genre}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div>
                  <p className="font-medium capitalize">{genre}</p>
                  <p className="text-sm text-gray-500">{genreStats[genre].count} beats</p>
                </div>
              </LinkComponent>
            ))}
        </div>
      </div>

      {/* Mock Data Notice */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
          <p className="text-yellow-800 text-sm">
            <strong>Development Mode:</strong> Genre statistics calculated from mock data. Real data will show actual genre distribution.
          </p>
        </div>
      </div>
    </div>
  )
}