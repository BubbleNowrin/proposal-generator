'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  _id: string
  title: string
  content: string
  images?: string[]
  authorName: string
  authorType: 'logged_in' | 'random' | 'anonymous'
  tags: string[]
  views: number
  voteScore: number
  commentCount: number
  isResolved: boolean
  createdAt: string
}

interface PostListProps {
  searchQuery: string
  selectedTag: string
  sortBy: string
  onPostClick: (postId: string) => void
  onTagClick: (tag: string) => void
}

export default function PostList({
  searchQuery,
  selectedTag,
  sortBy,
  onPostClick,
  onTagClick
}: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [popularTags, setPopularTags] = useState<string[]>([])

  useEffect(() => {
    fetchPosts()
  }, [searchQuery, selectedTag, sortBy, currentPage])

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        sortBy,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedTag && { tag: selectedTag })
      })

      const response = await fetch(`/api/posts?${params}`)
      const result = await response.json()

      if (result.success) {
        setPosts(result.data.posts)
        setTotalPages(result.data.pagination.totalPages)
        
        // Extract popular tags
        const allTags = result.data.posts.flatMap((post: Post) => post.tags)
        const tagCounts = allTags.reduce((acc: any, tag: string) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        }, {})
        
        const popular = Object.entries(tagCounts)
          .sort(([,a]: any, [,b]: any) => b - a)
          .slice(0, 10)
          .map(([tag]) => tag)
        
        setPopularTags(popular)
      }
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAuthorDisplay = (post: Post) => {
    switch (post.authorType) {
      case 'logged_in':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {post.authorName.charAt(0)}
            </div>
            <span className="text-blue-600 font-medium">{post.authorName}</span>
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )
      case 'random':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {post.authorName.charAt(0)}
            </div>
            <span className="text-purple-600 font-medium">{post.authorName}</span>
          </div>
        )
      case 'anonymous':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs">
              ?
            </div>
            <span className="text-gray-500">Anonymous</span>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl sm:text-6xl mb-4">🤔</div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No questions found</h3>
            <p className="text-sm sm:text-base text-gray-600">Be the first to ask a question in this community!</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {posts.map((post) => (
              <div
                key={post._id}
                onClick={() => onPostClick(post._id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 line-clamp-2">
                      {post.title}
                      {post.isResolved && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          ✓ Resolved
                        </span>
                      )}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-3 sm:mb-4 line-clamp-2">
                      {post.content.substring(0, 200)}...
                    </p>

                    {/* Display post images preview */}
                    {post.images && post.images.length > 0 && (
                      <div className="mb-4">
                        <div className="flex space-x-2 overflow-x-auto">
                          {post.images.slice(0, 3).map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`Preview ${index + 1}`}
                              className="w-16 h-16 object-cover rounded border flex-shrink-0"
                              onClick={(e) => {
                                e.stopPropagation()
                                window.open(image, '_blank')
                              }}
                            />
                          ))}
                          {post.images.length > 3 && (
                            <div className="w-16 h-16 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 flex-shrink-0">
                              +{post.images.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                      <div className="flex items-center flex-wrap gap-2 text-xs sm:text-sm text-gray-500">
                        {getAuthorDisplay(post)}
                        <span className="hidden sm:inline">•</span>
                        <span className="text-xs">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                      </div>

                      <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{post.views}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span>{post.commentCount}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                          </svg>
                          <span className={post.voteScore > 0 ? 'text-green-600 font-medium' : post.voteScore < 0 ? 'text-red-600 font-medium' : ''}>
                            {post.voteScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    {post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {post.tags.map((tag, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation()
                              onTagClick(tag)
                            }}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md hover:bg-blue-200 transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 sm:mt-8">
            <div className="flex space-x-1 sm:space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sidebar - Hidden on mobile and tablet */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        {/* Active Filters */}
        {(selectedTag || searchQuery) && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">Active Filters</h3>
            <div className="space-y-2">
              {selectedTag && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tag: #{selectedTag}</span>
                  <button
                    onClick={() => onTagClick('')}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              )}
              {searchQuery && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Search: {searchQuery}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Popular Tags */}
        {popularTags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    selectedTag === tag
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}