'use client'

import { useState, useEffect } from 'react'
import { profileStorage, StoredProfile } from '../lib/storage'
import { UserProfile } from '../types'

interface ProfileManagerProps {
  onProfileSelected: (profile: UserProfile) => void
}

export default function ProfileManager({ onProfileSelected }: ProfileManagerProps) {
  const [profiles, setProfiles] = useState<StoredProfile[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [currentProfile, setCurrentProfile] = useState<StoredProfile | null>(null)

  useEffect(() => {
    const loadedProfiles = profileStorage.getAllProfiles()
    const current = profileStorage.getCurrentProfile()
    
    setProfiles(loadedProfiles)
    setCurrentProfile(current)
    
    // If there's a current profile, auto-select it
    if (current) {
      onProfileSelected({
        name: current.name,
        title: current.title,
        skills: current.skills,
        experience: current.experience,
        portfolio: current.portfolio,
        hourlyRate: current.hourlyRate,
        bio: current.bio,
        specializations: current.specializations
      })
    } else if (loadedProfiles.length === 0) {
      setShowCreateForm(true)
    }
  }, [onProfileSelected])

  const handleCreateProfile = (profileData: Omit<StoredProfile, 'id' | 'createdAt' | 'lastUsed'>) => {
    const saved = profileStorage.saveProfile(profileData)
    const updatedProfiles = profileStorage.getAllProfiles()
    
    setProfiles(updatedProfiles)
    setCurrentProfile(saved)
    setShowCreateForm(false)
    
    onProfileSelected({
      name: saved.name,
      title: saved.title,
      skills: saved.skills,
      experience: saved.experience,
      portfolio: saved.portfolio,
      hourlyRate: saved.hourlyRate,
      bio: saved.bio,
      specializations: saved.specializations
    })
  }

  const handleSelectProfile = (profile: StoredProfile) => {
    profileStorage.setCurrentProfile(profile.id)
    setCurrentProfile(profile)
    
    onProfileSelected({
      name: profile.name,
      title: profile.title,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      hourlyRate: profile.hourlyRate,
      bio: profile.bio,
      specializations: profile.specializations
    })
  }

  const handleDeleteProfile = (profileId: string) => {
    if (confirm('Are you sure you want to delete this profile?')) {
      profileStorage.deleteProfile(profileId)
      const updatedProfiles = profileStorage.getAllProfiles()
      setProfiles(updatedProfiles)
      
      if (currentProfile?.id === profileId) {
        setCurrentProfile(null)
      }
    }
  }

  if (showCreateForm) {
    return <CreateProfileForm onSubmit={handleCreateProfile} onCancel={() => setShowCreateForm(false)} />
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          👤 Your Profiles
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          + New Profile
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No profiles found. Create your first profile to get started!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
          >
            Create First Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                currentProfile?.id === profile.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1" onClick={() => handleSelectProfile(profile)}>
                  <h3 className="font-medium text-gray-800">{profile.name}</h3>
                  <p className="text-sm text-gray-600">{profile.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Last used: {new Date(profile.lastUsed).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {currentProfile?.id === profile.id && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Current
                    </span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteProfile(profile.id)
                    }}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {currentProfile && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ Profile Active: {currentProfile.name}</p>
          <p className="text-sm text-green-600">Ready to generate proposals!</p>
        </div>
      )}
    </div>
  )
}

function CreateProfileForm({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (profile: Omit<StoredProfile, 'id' | 'createdAt' | 'lastUsed'>) => void
  onCancel: () => void 
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    title: '',
    skills: '',
    experience: '',
    portfolio: '',
    hourlyRate: '',
    bio: '',
    specializations: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const profile = {
      name: formData.name,
      email: formData.email,
      title: formData.title,
      skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      experience: formData.experience,
      portfolio: formData.portfolio.split('\n').map(s => s.trim()).filter(s => s),
      hourlyRate: parseFloat(formData.hourlyRate) || 0,
      bio: formData.bio,
      specializations: formData.specializations.split(',').map(s => s.trim()).filter(s => s)
    }
    
    onSubmit(profile)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Create Your Profile
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕ Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (for profile identification) *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
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
          />
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
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
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
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          Save Profile & Continue
        </button>
      </form>
    </div>
  )
}