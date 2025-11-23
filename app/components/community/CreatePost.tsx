'use client'

import { useState } from 'react'
import { generateRandomName } from '../../utils/randomNames'
import Swal from 'sweetalert2'
import ImageUpload from './ImageUpload'

interface User {
  id: string
  email: string
  name: string
}

interface CreatePostProps {
  user: User | null
  onPostCreated: () => void
  onCancel: () => void
}

export default function CreatePost({ user, onPostCreated, onCancel }: CreatePostProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [authorType, setAuthorType] = useState<'logged_in' | 'random' | 'anonymous'>
    (user ? 'logged_in' : 'anonymous')
  const [customName, setCustomName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const getAuthorName = () => {
    switch (authorType) {
      case 'logged_in':
        return user?.name || 'Unknown User'
      case 'random':
        return customName || generateRandomName()
      case 'anonymous':
        return 'Anonymous'
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !content.trim()) {
      await Swal.fire({
        title: 'Missing Information',
        text: 'Please fill in both the title and question details',
        icon: 'warning',
        confirmButtonColor: '#3B82F6',
        confirmButtonText: 'Got it'
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          images,
          authorName: getAuthorName(),
          authorType,
          authorId: user?.id || null
        })
      })

      const result = await response.json()

      if (result.success) {
        await Swal.fire({
          title: 'Question Posted!',
          text: 'Your question has been posted successfully',
          icon: 'success',
          confirmButtonColor: '#10B981',
          confirmButtonText: 'View Question'
        })
        onPostCreated()
      } else {
        await Swal.fire({
          title: 'Error',
          text: 'Failed to create question: ' + result.error,
          icon: 'error',
          confirmButtonColor: '#EF4444',
          confirmButtonText: 'Try Again'
        })
      }
    } catch (error) {
      console.error('Error creating post:', error)
      await Swal.fire({
        title: 'Network Error',
        text: 'Failed to create question. Please check your connection and try again.',
        icon: 'error',
        confirmButtonColor: '#EF4444',
        confirmButtonText: 'Try Again'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateNewName = () => {
    setCustomName(generateRandomName())
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ask a Question</h1>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700 p-1"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Author Type Selection */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">How would you like to post?</h3>
          <div className="space-y-3">
            {user && (
              <label className="flex items-start sm:items-center">
                <input
                  type="radio"
                  value="logged_in"
                  checked={authorType === 'logged_in'}
                  onChange={(e) => setAuthorType(e.target.value as any)}
                  className="mt-1 sm:mt-0 mr-3 flex-shrink-0"
                />
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 min-w-0">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {user.name.charAt(0)}
                    </div>
                    <span className="font-medium truncate">{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-500">(Verified account)</span>
                  </div>
                </div>
              </label>
            )}
            
            <label className="flex items-start sm:items-center">
              <input
                type="radio"
                value="random"
                checked={authorType === 'random'}
                onChange={(e) => setAuthorType(e.target.value as any)}
                className="mt-1 sm:mt-0 mr-3 flex-shrink-0"
              />
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 min-w-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {(customName || generateRandomName()).charAt(0)}
                  </div>
                  <span className="font-medium truncate">{customName || 'Random Username'}</span>
                </div>
                <button
                  type="button"
                  onClick={generateNewName}
                  className="text-purple-600 hover:text-purple-800 text-sm underline self-start sm:self-auto"
                >
                  Generate New
                </button>
              </div>
            </label>
            
            <label className="flex items-start sm:items-center">
              <input
                type="radio"
                value="anonymous"
                checked={authorType === 'anonymous'}
                onChange={(e) => setAuthorType(e.target.value as any)}
                className="mt-1 sm:mt-0 mr-3 flex-shrink-0"
              />
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm flex-shrink-0">
                    ?
                  </div>
                  <span className="font-medium">Anonymous</span>
                </div>
                <span className="text-sm text-gray-500">(Completely private)</span>
              </div>
            </label>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your programming question? Be specific and clear."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              maxLength={200}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200 characters</p>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Details *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Provide all the details. What did you try? What exactly isn't working? Include code, error messages, or screenshots if helpful."
              rows={6}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base resize-y min-h-[120px]"
              maxLength={10000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/10,000 characters</p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="javascript, react, nodejs (comma separated)"
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <p className="text-xs text-gray-500 mt-1">
              Add tags to help others find your question. Separate multiple tags with commas.
            </p>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images (Optional)
            </label>
            <ImageUpload
              onImagesChange={setImages}
              maxImages={5}
              className="mt-2"
            />
          </div>

          {/* Preview */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-3">Preview</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  authorType === 'logged_in' ? 'bg-blue-500' :
                  authorType === 'random' ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  {authorType === 'anonymous' ? '?' : getAuthorName().charAt(0)}
                </div>
                <span className="font-medium">{getAuthorName()}</span>
                {authorType === 'logged_in' && (
                  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">
                {title || 'Your question title will appear here'}
              </h4>
              <p className="text-gray-700 whitespace-pre-wrap">
                {content || 'Your question details will appear here'}
              </p>
              {images.length > 0 && (
                <div className="mt-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}
              {tags && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.split(',').map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-4 sm:pt-6 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 sm:px-6 py-2 sm:py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
              className="px-4 sm:px-6 py-2 sm:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              <span>{isSubmitting ? 'Posting...' : 'Post Question'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}