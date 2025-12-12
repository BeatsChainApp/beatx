'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { urlFor } from '@/lib/sanity-client'
import { motion } from 'framer-motion'

interface BlogPost {
  _id: string
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt: string
  mainImage?: any
  categories?: { title: string }[]
  author?: { name: string, image?: any, bio?: string }
  featured?: boolean
}

interface EnhancedBlogGridProps {
  posts: BlogPost[]
  loading: boolean
}

export default function EnhancedBlogGrid({ posts, loading }: EnhancedBlogGridProps) {
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 9
  
  // Extract all unique categories
  const allCategories = Array.from(
    new Set(
      posts.flatMap(post => post.categories?.map(cat => cat.title) || [])
    )
  )
  
  // Filter posts based on active filter
  useEffect(() => {
    if (activeFilter === 'all') {
      setFilteredPosts(posts)
    } else if (activeFilter === 'featured') {
      setFilteredPosts(posts.filter(post => post.featured))
    } else {
      setFilteredPosts(
        posts.filter(post => 
          post.categories?.some(cat => cat.title === activeFilter)
        )
      )
    }
    setCurrentPage(1)
  }, [activeFilter, posts])
  
  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage)
  const startIndex = (currentPage - 1) * postsPerPage
  const currentPosts = filteredPosts.slice(startIndex, startIndex + postsPerPage)
  
  // Featured posts (first 3)
  const featuredPosts = posts.filter(post => post.featured).slice(0, 3)
  
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading posts...</p>
      </div>
    )
  }
  
  if (posts.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <div className="text-5xl mb-4">📝</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">No Posts Yet</h2>
        <p className="text-gray-600">
          Check back soon for the latest updates and insights!
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-10">
      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-900">Featured Posts</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredPosts.map((post) => (
              <motion.div 
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl overflow-hidden shadow-md border border-indigo-100"
              >
                {post.mainImage?.asset && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={urlFor(post.mainImage).width(600).height(400).url()}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                
                <div className="p-4 sm:p-6">
                  <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                    {post.categories?.[0] && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full truncate max-w-24 sm:max-w-none">
                        {post.categories[0].title}
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg sm:text-xl font-bold mb-2 text-gray-900 leading-tight">
                    <Link href={`/blog/${post.slug.current}`} className="hover:text-indigo-700 transition-colors line-clamp-2">
                      {post.title}
                    </Link>
                  </h3>
                  
                  {post.excerpt && (
                    <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                      {post.author?.image && (
                        <img
                          src={urlFor(post.author.image).width(40).height(40).url()}
                          alt={post.author.name}
                          className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 flex-shrink-0"
                        />
                      )}
                      <span className="text-xs sm:text-sm text-gray-700 truncate">{post.author?.name}</span>
                    </div>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}
      
      {/* Filters */}
      <section>
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            All Posts
          </button>
          
          <button
            onClick={() => setActiveFilter('featured')}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
              activeFilter === 'featured'
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
          
          {allCategories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>
      
      {/* Main Grid */}
      <section>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {currentPosts.map((post, index) => (
            <motion.article 
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              {post.mainImage?.asset && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={urlFor(post.mainImage).width(400).height(200).url()}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform hover:scale-105"
                  />
                </div>
              )}
              
              <div className="p-4 sm:p-6">
                <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
                  {post.categories?.slice(0, 2).map(category => (
                    <span 
                      key={category.title}
                      className="bg-blue-100 text-blue-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full truncate max-w-20 sm:max-w-none"
                    >
                      {category.title}
                    </span>
                  ))}
                  {post.featured && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 sm:px-2.5 py-0.5 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                
                <h3 className="text-base sm:text-lg font-bold mb-2 text-gray-900 leading-tight">
                  <Link href={`/blog/${post.slug.current}`} className="hover:text-blue-700 transition-colors line-clamp-2">
                    {post.title}
                  </Link>
                </h3>
                
                {post.excerpt && (
                  <p className="text-gray-600 text-xs sm:text-sm mb-4 line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center min-w-0 flex-1">
                    {post.author?.image && (
                      <img
                        src={urlFor(post.author.image).width(40).height(40).url()}
                        alt={post.author.name}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mr-2 flex-shrink-0"
                      />
                    )}
                    <span className="text-xs sm:text-sm text-gray-700 truncate">{post.author?.name}</span>
                  </div>
                  <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </section>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="inline-flex rounded-md shadow">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-2 sm:px-4 py-2 rounded-l-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">‹</span>
            </button>
            
            <div className="hidden md:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === page
                      ? 'bg-indigo-50 text-indigo-600 z-10'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <div className="md:hidden flex items-center px-4 border-t border-b border-gray-300 bg-white">
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center px-2 sm:px-4 py-2 rounded-r-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">›</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  )
}