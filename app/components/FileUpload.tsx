'use client'

import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileProcessed: (extractedData: any) => void
  uploadType: 'profile' | 'job'
  className?: string
}

export default function FileUpload({ onFileProcessed, uploadType, className = '' }: FileUploadProps) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList) => {
    if (files.length === 0) return
    
    const file = files[0]
    const maxSize = 10 * 1024 * 1024 // 10MB
    
    if (file.size > maxSize) {
      setError('File size must be less than 10MB')
      return
    }

    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ]

    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a Word document (.doc/.docx), text file (.txt), or image (JPG/PNG)')
      return
    }

    setError('')
    setIsProcessing(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', uploadType)

      const response = await fetch('/api/upload-parse', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process file')
      }

      const result = await response.json()
      onFileProcessed(result)
    } catch (err) {
      setError('Failed to process file. Please try again.')
      console.error('Upload error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files)
    }
  }

  const openFileSelector = () => {
    fileInputRef.current?.click()
  }

  const uploadTitle = uploadType === 'profile' 
    ? '📄 Upload Profile Document' 
    : '📋 Upload Job Description'

  const uploadDescription = uploadType === 'profile'
    ? 'Upload your CV, LinkedIn profile screenshot, or any document containing your professional information'
    : 'Upload job posting screenshot, PDF, or document with job description'

  return (
    <div className={`${className}`}>
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!isProcessing ? openFileSelector : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".doc,.docx,.txt,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          disabled={isProcessing}
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Processing file...</p>
            <p className="text-sm text-gray-500">Extracting information using AI</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {uploadTitle}
            </h3>
            <p className="text-gray-600 mb-4 max-w-sm">
              {uploadDescription}
            </p>
            <div className="text-sm text-gray-500">
              <span className="font-medium">Supported formats:</span> Word documents (.doc/.docx), Text files (.txt), Images (JPG/PNG)
            </div>
            <div className="text-xs text-gray-400 mt-1">
              💡 Best results: Upload CV as Word doc, or screenshots of LinkedIn/job postings
            </div>
            <div className="text-sm text-gray-400 mt-1">
              Max file size: 10MB
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">❌ {error}</p>
        </div>
      )}
    </div>
  )
}