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

export default function BlogPostPage() {
  return (
    <UniversalLayout>
      <ResponsiveWrapper pageType="public">
        <BlogPostPageContent />
      </ResponsiveWrapper>
    </UniversalLayout>
  )
}

function BlogPostPageContent() {
  const [post, setPost] = useState(getFallbackPost(params.slug))
  const [loading, setLoading] = useState(true)
  const [heroImageUrl, setHeroImageUrl] = useState('')

  useEffect(() => {
    async function fetchPost() {
      if (!client) {
        setLoading(false)
        return
      }
      try {
        const data = await client.fetch(`*[_type == "post" && slug.current == $slug][0] {
          _id, title, slug, publishedAt, mainImage, body, categories[]->{ title }, author->{ name, bio, image }
        }`, { slug: params.slug })
        
        if (data) {
          setPost(data)
          
          // Process hero image if available
          if (data.mainImage?.asset) {
            try {
              const imageUrl = urlFor(data.mainImage).width(1920).url()
              setHeroImageUrl(imageUrl)
            } catch (error) {
              console.warn('Failed to process hero image:', error)
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch blog post:', error)
      }
      setLoading(false)
    }
    fetchPost()
  }, [params.slug])
  
  const shareUrl = `https://beatschain.app/blog/${post.slug.current}`
  const shareTitle = encodeURIComponent(post.title)
  const shareDescription = encodeURIComponent(post.excerpt || post.body?.[0]?.children?.[0]?.text?.substring(0, 160) || 'Read this article on BeatsChain')

  // Client-side title update for immediate feedback
  useEffect(() => {
    document.title = `${post.title} | BeatsChain Blog`
  }, [post.title])

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: heroImageUrl 
          ? `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(${heroImageUrl})`
          : 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        color: 'white',
        position: 'relative'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {post.categories?.slice(0, 3).map((category: any, index: number) => (
              <span key={index} style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '1rem',
                fontSize: '0.75rem',
                fontWeight: '500',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                {category.title || category}
              </span>
            ))}
          </div>
          <h1 style={{ fontSize: '3rem', fontWeight: 'bold', lineHeight: '1.2', marginBottom: '1rem' }}>
            {post.title}
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
            {post.excerpt || 'Insights on Web3 beats, BeatNFTs, and the future of beat ownership'}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: 'rgba(255,255,255,0.2)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '1rem'
              }}>
                {post.author?.name?.charAt(0) || '👤'}
              </div>
              <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>{post.author?.name}</span>
            </div>
            <span style={{ fontSize: '0.875rem', opacity: 0.7 }}>•</span>
            <time style={{ fontSize: '0.875rem', opacity: 0.9 }}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </div>
      
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {post.categories?.map((category: any) => (
            <span key={category.title || category} style={{
              background: '#dbeafe',
              color: '#1e40af',
              padding: '0.25rem 0.75rem',
              borderRadius: '1rem',
              fontSize: '0.75rem',
              fontWeight: '500'
            }}>
              {category.title || category}
            </span>
          ))}
        </div>
        
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', lineHeight: '1.2', color: '#1f2937', marginBottom: '1rem' }}>
          {post.title}
        </h1>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
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
          )}
          <div>
            <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>{post.author?.name}</p>
            <time style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </header>

      <div style={{ 
        fontSize: '1.125rem', 
        lineHeight: '1.7', 
        color: '#374151',
        marginBottom: '3rem'
      }}>
        {loading ? (
          <p>Loading content...</p>
        ) : post.body && Array.isArray(post.body) ? (
          <PortableText 
            value={post.body}
            components={{
              block: {
                h1: ({children}) => <h1 style={{fontSize: '2.5rem', fontWeight: 'bold', margin: '2rem 0 1rem', color: '#1f2937'}}>{children}</h1>,
                h2: ({children}) => <h2 style={{fontSize: '2rem', fontWeight: 'bold', margin: '1.5rem 0 1rem', color: '#1f2937'}}>{children}</h2>,
                h3: ({children}) => <h3 style={{fontSize: '1.5rem', fontWeight: '600', margin: '1.5rem 0 1rem', color: '#1f2937'}}>{children}</h3>,
                h4: ({children}) => <h4 style={{fontSize: '1.25rem', fontWeight: '600', margin: '1rem 0 0.5rem', color: '#1f2937'}}>{children}</h4>,
                blockquote: ({children}) => <blockquote style={{borderLeft: '4px solid #3b82f6', paddingLeft: '1rem', margin: '1.5rem 0', fontStyle: 'italic', color: '#6b7280'}}>{children}</blockquote>,
                normal: ({children}) => <p style={{margin: '1rem 0', lineHeight: '1.7'}}>{children}</p>
              },
              list: {
                bullet: ({children}) => <ul style={{margin: '1rem 0', paddingLeft: '2rem', listStyleType: 'disc'}}>{children}</ul>,
                number: ({children}) => <ol style={{margin: '1rem 0', paddingLeft: '2rem', listStyleType: 'decimal'}}>{children}</ol>
              },
              listItem: {
                bullet: ({children}) => <li style={{margin: '0.5rem 0'}}>{children}</li>,
                number: ({children}) => <li style={{margin: '0.5rem 0'}}>{children}</li>
              },
              marks: {
                strong: ({children}) => <strong style={{fontWeight: 'bold'}}>{children}</strong>,
                em: ({children}) => <em style={{fontStyle: 'italic'}}>{children}</em>,
                code: ({children}) => <code style={{background: '#f3f4f6', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontFamily: 'monospace'}}>{children}</code>,
                link: ({children, value}) => <a href={value?.href} style={{color: '#3b82f6', textDecoration: 'underline'}} target={value?.href?.startsWith('http') ? '_blank' : '_self'} rel={value?.href?.startsWith('http') ? 'noopener noreferrer' : ''}>{children}</a>
              },
              types: {
                image: ({ value }: any) => {
                  if (!value?.asset) return null
                  try {
                    const imageUrl = urlFor(value).width(800).url()
                    if (!imageUrl) return null
                    return (
                      <div style={{ margin: '2rem 0', textAlign: 'center' }}>
                        <img
                          src={imageUrl}
                          alt={value.alt || ''}
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: '0.5rem' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                        {value.caption && (
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
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

      <div style={{
        background: '#f9fafb',
        padding: '2rem',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem', color: '#1f2937' }}>
          Share this article
        </h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#1da1f2',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Share on Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${shareTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#1877f2',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Share on Facebook
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${shareTitle}&summary=${shareDescription}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#0077b5',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Share on LinkedIn
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              border: 'none',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Copy Link
          </button>
          <a href="/blog" style={{ color: '#3b82f6', textDecoration: 'underline', padding: '0.5rem 1rem' }}>
            ← Back to Blog
          </a>
        </div>
      </div>
    </article>
    </div>
  )
}