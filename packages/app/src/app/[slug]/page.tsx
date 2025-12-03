'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getPageBySlug } from '@/lib/sanity-client'
import { notFound } from 'next/navigation'
import HeroSection from '@/components/HeroSection'
import fallbackContent from '@/utils/fallbackContent'
import SEO from '@/components/SEO'
import ContentBlockRenderer from '@/components/blocks/ContentBlockRenderer'

export default function DynamicPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <DynamicPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function DynamicPageContent() {
  const params = useParams()
  const slug = params.slug as string
  const [pageData, setPageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  useEffect(() => {
    async function fetchPage() {
      try {
        // Use enhanced client with error handling
        const data = await getPageBySlug(slug)

        if (data) {
          setPageData(data)
        } else {
          // If no Sanity data, check for fallback
          if (fallbackContent[slug]) {
            setPageData(fallbackContent[slug])
            setUseFallback(true)
          } else {
            notFound()
          }
        }
      } catch (error) {
        console.error('Error fetching page:', error)
        // On error, use fallback if available
        if (fallbackContent[slug]) {
          setPageData(fallbackContent[slug])
          setUseFallback(true)
        } else {
          notFound()
        }
      } finally {
        setLoading(false)
      }
    }

    fetchPage()
  }, [slug])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!pageData) {
    return notFound()
  }

  return (
    <>
      <SEO 
        title={pageData.title}
        description={pageData.description || `BeatsChain - ${pageData.title}`}
        ogImage={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.beatschain.app'}/api/og/${slug}`}
      />
      
      <div>
        {pageData.heroSection && <HeroSection data={pageData.heroSection} />}

        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 mobile-heading">{pageData.title}</h1>
          
          {useFallback ? (
            // Render fallback content
            <div dangerouslySetInnerHTML={{ __html: pageData.content }} />
          ) : (
            // Render Sanity content blocks
            <div>
              {/* Render content blocks if available */}
              {pageData.contentBlocks && pageData.contentBlocks.length > 0 && (
                <ContentBlockRenderer blocks={pageData.contentBlocks} />
              )}
              
              {/* Render regular content */}
              {pageData.content && (
                <ContentBlockRenderer blocks={pageData.content} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}