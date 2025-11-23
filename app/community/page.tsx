'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PostList from '../components/community/PostList'
import CreatePost from '../components/community/CreatePost'
import PostView from '../components/community/PostView'

export default function CommunityPage() {
  const { user } = useAuth()
  const [view, setView] = useState<'list' | 'create' | 'post'>('list')
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const handleCreatePost = () => {
    setView('create')
  }

  const handlePostCreated = () => {
    setView('list')
  }

  const handlePostClick = (postId: string) => {
    setSelectedPostId(postId)
    setView('post')
  }

  const handleBackToList = () => {
    setView('list')
    setSelectedPostId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.location.href = user ? '/dashboard' : '/'}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"} />
                </svg>
                <span>{user ? 'Dashboard' : 'Home'}</span>
              </button>
              <span className="text-gray-300">•</span>
              <div className="text-2xl font-bold text-gray-900">
                🌐 Community Portal
              </div>
            </div>
            
            
            {view === 'list' && (
              <button
                onClick={handleCreatePost}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Ask Question</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          {view === 'list' && (
            <div className="pb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
                {/* Search Bar */}
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search questions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                  <option value="votes">Highest Voted</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'list' && (
          <PostList
            searchQuery={searchQuery}
            selectedTag={selectedTag}
            sortBy={sortBy}
            onPostClick={handlePostClick}
            onTagClick={setSelectedTag}
          />
        )}

        {view === 'create' && (
          <CreatePost
            user={user}
            onPostCreated={handlePostCreated}
            onCancel={handleBackToList}
          />
        )}

        {view === 'post' && selectedPostId && (
          <PostView
            postId={selectedPostId}
            user={user}
            onBack={handleBackToList}
          />
        )}
      </main>
    </div>
  )
}