'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect, useState } from 'react'
import { client } from '@/lib/sanity-client'
import CmsHeroSection from '@/components/HeroSection'
import EnhancedBlogGrid from '@/components/EnhancedBlogGrid'

export default function BlogPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BlogPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BlogPageContent() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [heroData, setHeroData] = useState(null)

  useEffect(() => {
    async function fetchPosts() {
      if (!client) {
        setLoading(false)
        return
      }
      try {
        const data = await client.fetch(`*[_type == "post" && defined(publishedAt)] | order(publishedAt desc) {
          _id, title, slug, excerpt, publishedAt, mainImage, categories[]->{ title }, author->{ name, image, bio }
        }`)
        setPosts(Array.isArray(data) ? data : [])
      } catch {
        setPosts([])
      }
      setLoading(false)
    }
    
    async function fetchHeroData() {
      if (!client) return
      try {
        const data = await client.fetch(`*[_type == "page" && slug.current == "blog"][0].heroSection`)
        if (data) setHeroData(data)
      } catch {}
    }
    
    fetchPosts()
    fetchHeroData()
  }, [])

  // No need for pagination here as it's handled by the EnhancedBlogGrid component

  return (
    <div>
      {/* Hero Section - CMS or Fallback */}
      {heroData ? (
        <CmsHeroSection data={heroData} />
      ) : (
        <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-700 min-h-[40vh] sm:min-h-[50vh] flex items-center text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
              📝 BeatsChain Blog
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90 max-w-3xl mx-auto px-4">
              Latest insights on music production, Web3, and the future of beats
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center px-4">
              <div className="bg-white bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-white border-opacity-20 text-xs sm:text-sm font-medium">
                🎵 Music Insights
              </div>
              <div className="bg-white bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-white border-opacity-20 text-xs sm:text-sm font-medium">
                🔗 Web3 Updates
              </div>
              <div className="bg-white bg-opacity-10 px-3 sm:px-4 py-2 rounded-full border border-white border-opacity-20 text-xs sm:text-sm font-medium">
                💡 Producer Tips
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <EnhancedBlogGrid posts={posts} loading={loading} />
      </div>
    </div>
  )
}