import { Suspense } from 'react'
import { Metadata } from 'next'
import { getPageBySlug } from '@/lib/sanity'
import CmsHeroSection from './HeroSection'
import CmsContentBlocks from './ContentBlocks'

import type { CmsPageData } from '@/lib/sanity/types'

interface SanityPageProps {
  slug: string
  fallback?: React.ReactNode
}

function PageSkeleton() {
  return (
    <div style={{ 
      minHeight: '50vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontSize: '1.125rem',
      color: '#6b7280'
    }}>
      Loading...
    </div>
  )
}

async function PageContent({ slug, fallback }: SanityPageProps) {
  const pageData = await getPageBySlug(slug)

  if (!pageData) {
    return fallback || (
      <div style={{ 
        minHeight: '50vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        Content loading...
      </div>
    )
  }

  return (
    <div>
      {pageData.heroSection && (
        <CmsHeroSection data={pageData.heroSection} />
      )}
      {pageData.contentBlocks && pageData.contentBlocks.length > 0 && (
        <CmsContentBlocks blocks={pageData.contentBlocks} />
      )}
    </div>
  )
}

export default function CmsPage({ slug, fallback }: SanityPageProps) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <PageContent slug={slug} fallback={fallback} />
    </Suspense>
  )
}

export async function generateMetadata({ slug }: { slug: string }): Promise<Metadata> {
  const pageData = await getPageBySlug(slug)
  return {
    title: pageData?.title || 'BeatsChain',
    description: pageData?.seo?.metaDescription
  }
}