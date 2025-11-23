'use client'

import { useState } from 'react'
import FileUpload from '../FileUpload'

interface CreateProfileFormProps {
  onSubmit: (profileData: any) => void
  onCancel: () => void
  showCancel: boolean
  initialData?: any
  isEditing?: boolean
  isLoading?: boolean
}

export default function CreateProfileForm({ onSubmit, onCancel, showCancel, initialData, isEditing, isLoading }: CreateProfileFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    title: initialData?.title || '',
    skills: initialData?.skills?.join(', ') || '',
    experience: initialData?.experience || '',
    portfolio: initialData?.portfolio?.join('\n') || '',
    hourlyRate: initialData?.hourlyRate?.toString() || '',
    bio: initialData?.bio || '',
    specializations: initialData?.specializations?.join(', ') || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const profileData = {
      name: formData.name,
      title: formData.title,
      skills: formData.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s),
      experience: formData.experience,
      portfolio: formData.portfolio.split('\n').map((s: string) => s.trim()).filter((s: string) => s),
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      bio: formData.bio,
      specializations: formData.specializations.split(',').map((s: string) => s.trim()).filter((s: string) => s)
    }
    
    onSubmit(profileData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleFileProcessed = (result: any) => {
    if (result.success && result.parsedData) {
      const data = result.parsedData
      setFormData({
        name: data.name || formData.name,
        title: data.title || formData.title,
        skills: data.skills?.join(', ') || formData.skills,
        experience: data.experience || formData.experience,
        portfolio: data.portfolio?.join('\n') || formData.portfolio,
        hourlyRate: data.hourlyRate?.toString() || formData.hourlyRate,
        bio: data.bio || formData.bio,
        specializations: data.specializations?.join(', ') || formData.specializations
      })
    }
  }

  const fillSampleData = () => {
    setFormData({
      name: 'John Developer',
      title: 'Full Stack MERN Developer',
      skills: 'React, Node.js, MongoDB, Express.js, TypeScript, JavaScript, Next.js, PostgreSQL',
      experience: 'Full Stack Developer with 3+ years of experience building modern web applications using the MERN stack. Specialized in creating responsive, scalable, and high-performance applications.',
      portfolio: 'E-commerce platform with React and Node.js\nSaaS dashboard with real-time analytics\nMobile-responsive portfolio website',
      hourlyRate: '25',
      bio: 'Passionate full-stack developer focused on creating efficient, user-friendly web applications. I enjoy solving complex problems and delivering high-quality code that meets business objectives.',
      specializations: 'E-commerce Development, SaaS Applications, API Development, Database Design'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? '✏️ Edit Profile' : '📝 Create Professional Profile'}
        </h2>
        {showCancel && (
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕ Cancel
          </button>
        )}
      </div>

      {!isEditing && (
        <div className="mb-6 space-y-4">
          {/* File Upload Section */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-green-800 font-medium mb-2">🚀 Quick Setup</h3>
            <p className="text-green-700 text-sm mb-4">
              Upload your CV, LinkedIn profile screenshot, or any professional document to auto-fill your profile
            </p>
            <FileUpload 
              onFileProcessed={handleFileProcessed}
              uploadType="profile"
              className="mb-4"
            />
          </div>
          
          {/* Sample Data Section */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 mb-2">
              <strong>💡 Alternative:</strong> Create multiple profiles for different specializations or client types.
            </p>
            <button
              onClick={fillSampleData}
              className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
            >
              Fill with sample data to get started quickly →
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Your Full Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Title *
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Full Stack Developer"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skills (comma separated) *
          </label>
          <input
            type="text"
            name="skills"
            required
            value={formData.skills}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="React, Node.js, Python, MongoDB, AWS"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience Summary *
          </label>
          <textarea
            name="experience"
            required
            value={formData.experience}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Brief overview of your professional experience..."
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hourly Rate ($) *
            </label>
            <input
              type="number"
              name="hourlyRate"
              required
              value={formData.hourlyRate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="25"
              min="1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specializations (comma separated)
            </label>
            <input
              type="text"
              name="specializations"
              value={formData.specializations}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="E-commerce, SaaS, API Development"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Portfolio/Previous Work (one per line)
          </label>
          <textarea
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="E-commerce platform built with MERN stack&#10;Mobile app with React Native&#10;AI chatbot integration"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Bio
          </label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="A brief bio that highlights your unique value proposition..."
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            isEditing ? '💾 Update Profile' : 'Create Profile & Continue →'
          )}
        </button>
      </form>
    </div>
  )
}