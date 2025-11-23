'use client'

import { useState, useRef } from 'react'

interface ImageUploadProps {
  onImagesChange: (images: string[]) => void
  maxImages?: number
  className?: string
}

export default function ImageUpload({ 
  onImagesChange, 
  maxImages = 5, 
  className = '' 
}: ImageUploadProps) {
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadToImageBB = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=701a0d7cdce71a8410d4cf17c044dfba`, {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error('Failed to upload to ImageBB')
    }

    const data = await response.json()
    return data.data.url
  }

  const handleFileSelect = async (files: FileList) => {
    if (files.length === 0) return
    
    if (images.length + files.length > maxImages) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    setUploading(true)

    try {
      const newImages: string[] = []
      const validFiles: File[] = []

      // Validate all files first
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
          alert(`${file.name} is not a supported image format. Please use JPG, PNG, GIF, or WebP.`)
          continue
        }

        // Validate file size (32MB max for ImageBB)
        if (file.size > 32 * 1024 * 1024) {
          alert(`${file.name} is too large. Maximum 32MB per image.`)
          continue
        }

        validFiles.push(file)
      }

      // Upload valid files
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        setUploadProgress(`Uploading ${file.name} (${i + 1}/${validFiles.length})...`)

        try {
          const imageUrl = await uploadToImageBB(file)
          newImages.push(imageUrl)
        } catch (uploadError) {
          console.error(`Failed to upload ${file.name}:`, uploadError)
          alert(`Failed to upload ${file.name}. Please try again.`)
        }
      }

      if (newImages.length > 0) {
        const updatedImages = [...images, ...newImages]
        setImages(updatedImages)
        onImagesChange(updatedImages)
      }
      
    } catch (error) {
      console.error('Error uploading images:', error)
      alert('Failed to upload images')
    } finally {
      setUploading(false)
      setUploadProgress('')
    }
  }

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index)
    setImages(updatedImages)
    onImagesChange(updatedImages)
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
      />

      <div className="space-y-4">
        {/* Upload Button */}
        <button
          type="button"
          onClick={openFileSelector}
          disabled={uploading || images.length >= maxImages}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600">
            {uploading ? (uploadProgress || 'Uploading to ImageBB...') : `Click to add images (${images.length}/${maxImages})`}
          </p>
          <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 32MB each</p>
        </button>

        {/* Image Preview */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}