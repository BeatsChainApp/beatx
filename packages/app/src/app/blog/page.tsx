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
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          minHeight: '50vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.2)' }}></div>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <h1 style={{ fontSize: '3.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
              📝 BeatsChain Blog
            </h1>
            <p style={{ fontSize: '1.25rem', marginBottom: '2rem', opacity: 0.9 }}>
              Latest insights on music production, Web3, and the future of beats
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                🎵 Music Insights
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                🔗 Web3 Updates
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.75rem 1.5rem', borderRadius: '2rem', border: '1px solid rgba(255,255,255,0.2)' }}>
                💡 Producer Tips
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EnhancedBlogGrid posts={posts} loading={loading} />
      </div>
    </div>
  )
}