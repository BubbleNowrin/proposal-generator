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
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20 backdrop-blur-sm bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <button
                onClick={() => window.location.href = user ? '/dashboard' : '/'}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="hidden sm:inline font-medium">{user ? 'Dashboard' : 'Home'}</span>
              </button>
              
              <svg className="w-4 h-4 text-gray-300 hidden sm:inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              
              <div className="flex items-center space-x-2 min-w-0">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  <span className="hidden sm:inline">🌐 Community</span>
                  <span className="sm:hidden">🌐</span>
                </div>
                <div className="hidden lg:flex items-center space-x-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Ask questions, share knowledge</span>
                </div>
              </div>
            </div>
            
            {view === 'list' && (
              <button
                onClick={handleCreatePost}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 sm:px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-1 sm:space-x-2 flex-shrink-0 shadow-sm hover:shadow-md transform hover:scale-105"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm sm:text-base hidden sm:inline">Ask Question</span>
                <span className="text-sm sm:hidden">Ask</span>
              </button>
            )}
          </div>

          {/* Search and Filters */}
          {view === 'list' && (
            <div className="pb-4 sm:pb-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-6">
                {/* Search Bar */}
                <div className="flex-1 lg:max-w-md">
                  <div className="relative group">
                    <svg className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search questions, topics, or keywords..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all duration-200 bg-gray-50 focus:bg-white shadow-sm"
                    />
                  </div>
                </div>

                {/* Filters and Sort */}
                <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Filter Tags */}
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <button 
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedTag === '' 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTag('')}
                    >
                      All
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedTag === 'proposal' 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTag('proposal')}
                    >
                      Proposals
                    </button>
                    <button 
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        selectedTag === 'freelancing' 
                          ? 'bg-blue-100 text-blue-700 shadow-sm' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      onClick={() => setSelectedTag('freelancing')}
                    >
                      Freelancing
                    </button>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex-shrink-0">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 sm:py-2.5 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm font-medium text-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    >
                      <option value="newest">🕐 Newest</option>
                      <option value="oldest">📅 Oldest</option>
                      <option value="popular">🔥 Popular</option>
                      <option value="votes">⭐ Top Voted</option>
                    </select>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm text-gray-500">
                <div className="flex items-center flex-wrap gap-2 sm:gap-4">
                  <span className="flex items-center space-x-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="hidden sm:inline">Community discussions</span>
                    <span className="sm:hidden">Discussions</span>
                  </span>
                  {searchQuery && (
                    <span className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                      </svg>
                      <span className="truncate max-w-[150px] sm:max-w-none">Searching: "{searchQuery}"</span>
                    </span>
                  )}
                </div>
                <button 
                  className="flex items-center space-x-1 hover:text-blue-600 transition-colors text-xs sm:text-sm"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedTag('')
                    setSortBy('newest')
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Reset</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
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