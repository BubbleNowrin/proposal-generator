'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { generateRandomName } from '../../utils/randomNames'
import ImageUpload from './ImageUpload'
import Swal from 'sweetalert2'

interface User {
  id: string
  email: string
  name: string
}

interface Post {
  _id: string
  title: string
  content: string
  images?: string[]
  authorName: string
  authorType: 'logged_in' | 'random' | 'anonymous'
  authorId?: string
  tags: string[]
  views: number
  voteScore: number
  commentCount: number
  isResolved: boolean
  createdAt: string
  votes: {
    up: string[]
    down: string[]
  }
}

interface Comment {
  _id: string
  content: string
  images?: string[]
  authorName: string
  authorType: 'logged_in' | 'random' | 'anonymous'
  authorId?: string
  voteScore: number
  isAccepted: boolean
  createdAt: string
  votes: {
    up: string[]
    down: string[]
  }
}

interface PostViewProps {
  postId: string
  user: User | null
  onBack: () => void
}

export default function PostView({ postId, user, onBack }: PostViewProps) {
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [commentImages, setCommentImages] = useState<string[]>([])
  const [commentAuthorType, setCommentAuthorType] = useState<'logged_in' | 'random' | 'anonymous'>
    (user ? 'logged_in' : 'anonymous')
  const [commentCustomName, setCommentCustomName] = useState('')
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/posts/${postId}`)
      const result = await response.json()

      if (result.success) {
        setPost(result.data.post)
        setComments(result.data.comments)
      }
    } catch (error) {
      console.error('Error fetching post:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (type: 'up' | 'down', targetType: 'post' | 'comment', targetId: string) => {
    // Allow anonymous voting - use IP or session ID as fallback
    const voterId = user?.id || `anonymous_${Date.now()}_${Math.random()}`

    try {
      const endpoint = targetType === 'post' ? `/api/posts/${targetId}` : `/api/comments/${targetId}`
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'vote',
          voteType: type,
          userId: voterId
        })
      })

      if (response.ok) {
        // Refresh the post data
        fetchPost()
      }
    } catch (error) {
      console.error('Error voting:', error)
    }
  }

  const handleAcceptAnswer = async (commentId: string) => {
    if (!user) {
      const result = await Swal.fire({
        title: 'Login Required',
        text: 'You need to be logged in to accept answers',
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#3B82F6',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Go to Login',
        cancelButtonText: 'Cancel'
      })
      
      if (result.isConfirmed) {
        window.location.href = '/login'
      }
      return
    }
    
    if (post?.authorId !== user.id) {
      await Swal.fire({
        title: 'Permission Denied',
        text: 'Only the question author can accept answers',
        icon: 'warning',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'Got it'
      })
      return
    }

    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'accept',
          userId: user.id
        })
      })

      if (response.ok) {
        fetchPost()
      }
    } catch (error) {
      console.error('Error accepting answer:', error)
    }
  }

  const getCommentAuthorName = () => {
    switch (commentAuthorType) {
      case 'logged_in':
        return user?.name || 'Unknown User'
      case 'random':
        return commentCustomName || generateRandomName()
      case 'anonymous':
        return 'Anonymous'
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newComment.trim()) {
      await Swal.fire({
        title: 'Missing Content',
        text: 'Please write your answer before posting',
        icon: 'warning',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'Got it'
      })
      return
    }

    setIsSubmittingComment(true)

    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
          images: commentImages,
          authorName: getCommentAuthorName(),
          authorType: commentAuthorType,
          authorId: user?.id || null
        })
      })

      const result = await response.json()

      if (result.success) {
        setNewComment('')
        setCommentImages([])
        await Swal.fire({
          title: 'Answer Posted!',
          text: 'Your answer has been posted successfully',
          icon: 'success',
          confirmButtonColor: '#10B981',
          confirmButtonText: 'Great!'
        })
        fetchPost()
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Failed to post answer: ' + result.error,
          icon: 'error',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'Try Again'
        })
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      await Swal.fire({
        title: 'Network Error',
        text: 'Failed to post answer. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Try Again'
      })
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const getAuthorDisplay = (authorName: string, authorType: string, showVerified = true) => {
    switch (authorType) {
      case 'logged_in':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {authorName.charAt(0)}
            </div>
            <span className="text-blue-600 font-medium">{authorName}</span>
            {showVerified && (
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        )
      case 'random':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {authorName.charAt(0)}
            </div>
            <span className="text-purple-600 font-medium">{authorName}</span>
          </div>
        )
      case 'anonymous':
        return (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm">
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

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h3>
        <button
          onClick={onBack}
          className="text-blue-600 hover:text-blue-800"
        >
          ← Back to posts
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Post */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Questions</span>
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => window.location.href = user ? '/dashboard' : '/'}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={user ? "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 0 012 2v2H8V5z" : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"} />
                </svg>
                <span className="text-sm">{user ? 'Dashboard' : 'Home'}</span>
              </button>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
            {post.isResolved && (
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                ✓ Resolved
              </span>
            )}
          </h1>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              {getAuthorDisplay(post.authorName, post.authorType)}
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 text-sm">
                Asked {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
              </span>
              <span className="text-gray-500">•</span>
              <span className="text-gray-500 text-sm">{post.views} views</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('up', 'post', post._id)}
                  className="p-1 rounded text-gray-500 hover:text-green-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                </button>
                <span className={`font-semibold ${
                  post.voteScore > 0 ? 'text-green-600' : 
                  post.voteScore < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {post.voteScore}
                </span>
                <button
                  onClick={() => handleVote('down', 'post', post._id)}
                  className="p-1 rounded text-gray-500 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <pre className="whitespace-pre-wrap font-sans text-gray-700">{post.content}</pre>
            
            {/* Display post images */}
            {post.images && post.images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {post.images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Post image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => {
                        // Open image in new tab for full view
                        window.open(image, '_blank')
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Answers ({comments.length})
          </h2>

          {/* Comment Form */}
          <div className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-3">Post an Answer</h3>
            
            {/* Comment Author Type Selection */}
            <div className="mb-4">
              <div className="flex space-x-6">
                {user && (
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="logged_in"
                      checked={commentAuthorType === 'logged_in'}
                      onChange={(e) => setCommentAuthorType(e.target.value as any)}
                      className="mr-2"
                    />
                    <span className="text-sm">{user.name} (Verified)</span>
                  </label>
                )}
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="random"
                    checked={commentAuthorType === 'random'}
                    onChange={(e) => setCommentAuthorType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Random username</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="anonymous"
                    checked={commentAuthorType === 'anonymous'}
                    onChange={(e) => setCommentAuthorType(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="text-sm">Anonymous</span>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmitComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your answer here. Be helpful and provide clear explanations."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
                maxLength={5000}
              />
              
              <div className="mb-4">
                <ImageUpload
                  onImagesChange={setCommentImages}
                  maxImages={3}
                  className="mt-3"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">{newComment.length}/5,000 characters</p>
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                >
                  {isSubmittingComment && (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  )}
                  <span>{isSubmittingComment ? 'Posting...' : 'Post Answer'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No answers yet. Be the first to help!</p>
              </div>
            ) : (
              comments
                .sort((a, b) => {
                  // Sort accepted answers first, then by votes
                  if (a.isAccepted && !b.isAccepted) return -1
                  if (!a.isAccepted && b.isAccepted) return 1
                  return b.voteScore - a.voteScore
                })
                .map((comment) => (
                  <div
                    key={comment._id}
                    className={`border-l-4 pl-4 ${
                      comment.isAccepted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          {getAuthorDisplay(comment.authorName, comment.authorType)}
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-500 text-sm">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                          {comment.isAccepted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Accepted Answer
                            </span>
                          )}
                        </div>

                        <div className="prose max-w-none mb-4">
                          <pre className="whitespace-pre-wrap font-sans text-gray-700">{comment.content}</pre>
                          
                          {/* Display comment images */}
                          {comment.images && comment.images.length > 0 && (
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                              {comment.images.map((image, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={image}
                                    alt={`Comment image ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => {
                                      // Open image in new tab for full view
                                      window.open(image, '_blank')
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleVote('up', 'comment', comment._id)}
                              className="p-1 rounded text-gray-500 hover:text-green-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                              </svg>
                            </button>
                            <span className={`text-sm font-medium ${
                              comment.voteScore > 0 ? 'text-green-600' : 
                              comment.voteScore < 0 ? 'text-red-600' : 'text-gray-600'
                            }`}>
                              {comment.voteScore}
                            </span>
                            <button
                              onClick={() => handleVote('down', 'comment', comment._id)}
                              className="p-1 rounded text-gray-500 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                              </svg>
                            </button>
                          </div>

                          {user && post.authorId === user.id && !comment.isAccepted && (
                            <button
                              onClick={() => handleAcceptAnswer(comment._id)}
                              className="text-green-600 hover:text-green-800 text-sm font-medium"
                            >
                              ✓ Accept Answer
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}