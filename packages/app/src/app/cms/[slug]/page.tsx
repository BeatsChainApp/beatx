import { Metadata } from 'next'
import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'

interface PageProps {
  params: { slug: string }
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return { title: 'BeatsChain' }
}

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
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1f2937' }}>
        BeatsChain
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '2rem' }}>
        Content management system is being configured.
      </p>
      <a href="/" style={{ color: '#3b82f6', textDecoration: 'underline' }}>
        ← Back to Home
      </a>
    </div>
  )
}