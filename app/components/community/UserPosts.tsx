'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface Post {
  _id: string
  title: string
  content: string
  tags: string[]
  views: number
  voteScore: number
  commentCount: number
  isResolved: boolean
  createdAt: string
}

interface Activity {
  _id: string
  activityType: 'post_created' | 'comment_created' | 'vote_cast' | 'answer_accepted'
  targetTitle?: string
  metadata?: {
    postTitle?: string
    commentContent?: string
  }
  createdAt: string
}

interface User {
  id: string
  email: string
  name: string
}

interface UserPostsProps {
  user: User
  onPostClick: (postId: string) => void
}

export default function UserPosts({ user, onPostClick }: UserPostsProps) {
  const [posts, setPosts] = useState<Post[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [activeTab, setActiveTab] = useState<'posts' | 'activity'>('posts')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [user.id])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      
      const [postsResponse, activityResponse] = await Promise.all([
        fetch(`/api/user/posts?userId=${user.id}`),
        fetch(`/api/user/activity?userId=${user.id}`)
      ])

      const postsResult = await postsResponse.json()
      const activityResult = await activityResponse.json()

      if (postsResult.success) {
        setPosts(postsResult.data.posts)
      }
      
      if (activityResult.success) {
        setActivities(activityResult.data.activities)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'post_created':
        return '📝'
      case 'comment_created':
        return '💬'
      case 'vote_cast':
        return '👍'
      case 'answer_accepted':
        return '✅'
      default:
        return '📋'
    }
  }

  const getActivityDescription = (activity: Activity) => {
    switch (activity.activityType) {
      case 'post_created':
        return `Posted question: "${activity.targetTitle}"`
      case 'comment_created':
        return `Answered question: "${activity.metadata?.postTitle}"`
      case 'vote_cast':
        return `Voted on: "${activity.metadata?.postTitle}"`
      case 'answer_accepted':
        return `Accepted answer for: "${activity.metadata?.postTitle}"`
      default:
        return 'Unknown activity'
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
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              {user.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">Community Member</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{posts.length}</div>
              <div className="text-sm text-blue-600">Questions Posted</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {posts.reduce((sum, post) => sum + post.voteScore, 0)}
              </div>
              <div className="text-sm text-green-600">Total Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {activities.length}
              </div>
              <div className="text-sm text-purple-600">Activities</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('posts')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'posts'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              My Questions ({posts.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Recent Activity ({activities.length})
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {posts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No questions yet</h3>
                  <p className="text-gray-600">Start by asking your first question in the community!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post._id}
                    onClick={() => onPostClick(post._id)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600">
                          {post.title}
                          {post.isResolved && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Resolved
                            </span>
                          )}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {post.content.substring(0, 150)}...
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                            <span>•</span>
                            <span>{post.views} views</span>
                            <span>•</span>
                            <span>{post.commentCount} answers</span>
                            <span>•</span>
                            <span className={post.voteScore > 0 ? 'text-green-600' : post.voteScore < 0 ? 'text-red-600' : ''}>
                              {post.voteScore} score
                            </span>
                          </div>
                        </div>

                        {post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {post.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-4">
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No activity yet</h3>
                  <p className="text-gray-600">Start participating in the community to see your activity here!</p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div
                    key={activity._id}
                    className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="text-2xl">
                      {getActivityIcon(activity.activityType)}
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-900">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}