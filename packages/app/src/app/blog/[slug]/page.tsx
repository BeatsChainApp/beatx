'use client'

import ResponsiveWrapper from '@/components/ResponsiveWrapper'
import UniversalLayout from '@/components/UniversalLayout'
import { useEffect, useState } from 'react'
import { client, urlFor } from '@/lib/sanity'
import { PortableText } from '@portabletext/react'

interface PageProps {
  params: { slug: string }
}

function getFallbackPost(slug: string) {
  return {
    _id: 'fallback',
    title: slug === 'what-is-a-beatnft' ? 'What is a BeatNFT?' : 'BeatsChain Blog',
    slug: { current: slug },
    publishedAt: new Date().toISOString(),
    body: [{
      _type: 'block',
      children: [{
        _type: 'span',
        text: slug === 'what-is-a-beatnft' 
          ? 'BeatNFTs are revolutionary digital assets that represent ownership of unique musical beats on the blockchain. Each BeatNFT contains metadata about the beat, including genre, BPM, musical key, and licensing terms. This creates a new paradigm for music ownership and royalty distribution in the Web3 era.'
          : 'Welcome to the BeatsChain blog. We are currently setting up our content management system. Check back soon for insights on Web3 music, beat production, and the future of decentralized music ownership.'
      }]
    }],
    categories: ['Web3', 'Music', 'NFT'],
    author: {
      name: 'BeatsChain Team',
      bio: 'Building the future of music ownership on the blockchain'
    }
  }
}

export default function BlogPostPage({ params }: PageProps) {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BlogPostPageContent params={params} />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BlogPostPageContent({ params }: { params: { slug: string } }) {
  const [post, setPost] = useState(getFallbackPost(params.slug))
  const [loading, setLoading] = useState(true)
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPost() {
      try {
        setLoading(true)
        setError(null)
        
        if (!client) {
          console.warn('Sanity client not available, using fallback content')
          setLoading(false)
          return
        }
        
        const data = await client.fetch(`*[_type == "post" && slug.current == $slug][0] {
          _id, title, slug, publishedAt, mainImage, body, categories[]->{ title }, author->{ name, bio, image }, excerpt
        }`, { slug: params.slug })
        
        if (data) {
          setPost(data)
          
          // Process hero image if available
          if (data.mainImage?.asset) {
            try {
              const imageUrl = urlFor(data.mainImage).width(1920).url()
              setHeroImageUrl(imageUrl)
            } catch (imageError) {
              console.warn('Failed to process hero image:', imageError)
            }
          }
        } else {
          console.warn(`No post found for slug: ${params.slug}, using fallback`)
        }
      } catch (fetchError) {
        console.error('Failed to fetch blog post:', fetchError)
        setError('Failed to load blog post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [params.slug])
  
  const shareUrl = `https://beatschain.app/blog/${post.slug.current}`
  const shareTitle = encodeURIComponent(post.title)
  const shareDescription = encodeURIComponent(
    post.excerpt || 
    (Array.isArray(post.body) && post.body[0]?.children?.[0]?.text?.substring(0, 160)) || 
    'Read this article on BeatsChain'
  )

  // Client-side title update for immediate feedback
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${post.title} | BeatsChain Blog`
    }
  }, [post.title])

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">❌</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Post</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <a href="/blog" className="text-blue-600 hover:text-blue-800 underline">
          ← Back to Blog
        </a>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading blog post...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 min-h-[40vh] flex items-center text-white relative overflow-hidden" style={{
        background: heroImageUrl 
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImageUrl})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10 text-center">
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {post.categories?.slice(0, 3).map((category: any, index: number) => (
              <span key={index} className="bg-white bg-opacity-20 text-white px-3 py-1 rounded-full text-xs sm:text-sm font-medium border border-white border-opacity-30">
                {category.title || category}
              </span>
            ))}
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-4 sm:mb-6">
            {post.title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg opacity-90 max-w-3xl mx-auto px-4">
            {post.excerpt || 'Insights on Web3 beats, BeatNFTs, and the future of beat ownership'}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-6 sm:mt-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm">
                {post.author?.name?.charAt(0) || '👤'}
              </div>
              <span className="text-sm opacity-90">{post.author?.name}</span>
            </div>
            <span className="hidden sm:inline text-sm opacity-70">•</span>
            <time className="text-sm opacity-90">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </div>
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <header className="mb-6 sm:mb-8">
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.map((category: any) => (
            <span key={category.title || category} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
              {category.title || category}
            </span>
          ))}
        </div>
        
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-4 sm:mb-6">
          {post.title}
        </h1>
        
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {post.author?.image?.asset && !loading ? (() => {
            try {
              const imageUrl = urlFor(post.author.image).width(48).height(48).url()
              if (imageUrl) {
                return (
                  <img
                    src={imageUrl}
                    alt={post.author.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )
              }
            } catch {}
            return (
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: '#e5e7eb', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1.25rem',
                color: '#6b7280'
              }}>
                {post.author.name?.charAt(0) || '👤'}
              </div>
            )
          })() : (
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg sm:text-xl text-gray-600">
              {post.author.name?.charAt(0) || '👤'}
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 text-sm sm:text-base">{post.author?.name}</p>
            <time className="text-xs sm:text-sm text-gray-600">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </header>

      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-gray-700 mb-8 sm:mb-12">
        {post.body && Array.isArray(post.body) ? (
          <PortableText 
            value={post.body}
            components={{
              block: {
                h1: ({children}) => <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>,
                h2: ({children}) => <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mt-6 mb-3 text-gray-900">{children}</h2>,
                h3: ({children}) => <h3 className="text-lg sm:text-xl md:text-2xl font-semibold mt-6 mb-3 text-gray-900">{children}</h3>,
                h4: ({children}) => <h4 className="text-base sm:text-lg md:text-xl font-semibold mt-4 mb-2 text-gray-900">{children}</h4>,
                blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 my-6 italic text-gray-600">{children}</blockquote>,
                normal: ({children}) => <p className="my-4 leading-relaxed">{children}</p>
              },
              list: {
                bullet: ({children}) => <ul className="my-4 pl-6 list-disc space-y-2">{children}</ul>,
                number: ({children}) => <ol className="my-4 pl-6 list-decimal space-y-2">{children}</ol>
              },
              listItem: {
                bullet: ({children}) => <li className="leading-relaxed">{children}</li>,
                number: ({children}) => <li className="leading-relaxed">{children}</li>
              },
              marks: {
                strong: ({children}) => <strong className="font-bold">{children}</strong>,
                em: ({children}) => <em className="italic">{children}</em>,
                code: ({children}) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{children}</code>,
                link: ({children, value}) => <a href={value?.href} className="text-blue-600 underline hover:text-blue-800" target={value?.href?.startsWith('http') ? '_blank' : '_self'} rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : ''}>{children}</a>
              },
              types: {
                image: ({ value }: any) => {
                  if (!value?.asset) return null
                  try {
                    const imageUrl = urlFor(value).width(800).url()
                    if (!imageUrl) return null
                    return (
                      <div className="my-8 text-center">
                        <img
                          src={imageUrl}
                          alt={value.alt || ''}
                          className="max-w-full h-auto rounded-lg mx-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {value.caption && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {value.caption}
                          </p>
                        )}
                      </div>
                    )
                  } catch {
                    return null
                  }
                },
                code: ({ value }: any) => (
                  <pre style={{background: '#1f2937', color: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', overflow: 'auto', margin: '1.5rem 0'}}>
                    <code style={{fontFamily: 'monospace', fontSize: '0.875rem'}}>{value.code}</code>
                  </pre>
                ),
                video: ({ value }: any) => {
                  if (!value?.url) return null
                  return (
                    <div style={{margin: '2rem 0', textAlign: 'center'}}>
                      <video controls style={{maxWidth: '100%', borderRadius: '0.5rem'}}>
                        <source src={value.url} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  )
                },
                audio: ({ value }: any) => {
                  if (!value?.url) return null
                  return (
                    <div style={{margin: '2rem 0', textAlign: 'center'}}>
                      <audio controls style={{width: '100%', maxWidth: '500px'}}>
                        <source src={value.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )
                }
              }
            }}
          />
        ) : (
          <p>{post.body}</p>
        )}
      </div>

      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border border-gray-200 mb-6 sm:mb-8">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900">
          Share this article
        </h3>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <span className="hidden sm:inline">Share on </span>Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <span className="hidden sm:inline">Share on </span>Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${shareTitle}&summary=${shareDescription}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-blue-800 transition-colors"
          >
            <span className="hidden sm:inline">Share on </span>LinkedIn
          </a>
          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(shareUrl)
              }
            }}
            className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Copy Link
          </button>
          <a href="/blog" className="text-blue-600 hover:text-blue-800 underline px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium">
            ← Back to Blog
          </a>
        </div>
      </div>
    </article>
    </div>
  )
}