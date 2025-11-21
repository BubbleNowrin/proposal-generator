'use client'

import { useState, useEffect } from 'react'
import { UserProfile } from '../../types'
import CreateProfileForm from './CreateProfileForm'

interface ProfileDashboardProps {
  onProfileSelected: (profile: UserProfile) => void
}

interface DBProfile {
  id: string
  name: string
  title: string
  skills: string[]
  experience: string
  portfolio: string[]
  hourlyRate: number
  bio: string
  specializations: string[]
  isActive: boolean
}

export default function ProfileDashboard({ onProfileSelected }: ProfileDashboardProps) {
  const [profiles, setProfiles] = useState<DBProfile[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false)
  const [editingProfile, setEditingProfile] = useState<DBProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({})
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        setAlert(null)
      }, 4000) // Auto-hide after 4 seconds
      return () => clearTimeout(timer)
    }
  }, [alert])

  const showAlert = (type: 'success' | 'error', message: string) => {
    setAlert({ type, message })
  }

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/profiles')
      if (response.ok) {
        const data = await response.json()
        setProfiles(data.profiles)
        
        if (data.profiles.length === 0) {
          setShowCreateForm(true)
        }
      } else {
        setError('Failed to load profiles')
      }
    } catch (err) {
      setError('Network error loading profiles')
    } finally {
      setLoading(false)
    }
  }

  const continueToProposal = () => {
    const activeProfile = profiles.find(p => p.isActive)
    if (activeProfile) {
      // Convert to UserProfile format and pass to parent
      onProfileSelected({
        name: activeProfile.name,
        title: activeProfile.title,
        skills: activeProfile.skills,
        experience: activeProfile.experience,
        portfolio: activeProfile.portfolio,
        hourlyRate: activeProfile.hourlyRate,
        bio: activeProfile.bio,
        specializations: activeProfile.specializations
      })
    }
  }

  const switchProfile = async (profile: DBProfile) => {
    const loadingKey = `switch-${profile.id}`
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }))
    
    try {
      const response = await fetch(`/api/profiles/${profile.id}/activate`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Update local state
        setProfiles(profiles.map(p => ({
          ...p,
          isActive: p.id === profile.id
        })))
        setShowProfileSwitcher(false)
        setError('')
        showAlert('success', `✅ Switched to ${profile.name}'s profile`)
      } else {
        showAlert('error', '❌ Failed to switch profile')
      }
    } catch (err) {
      showAlert('error', '❌ Failed to switch profile')
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const handleCreateProfile = async (profileData: Omit<DBProfile, 'id' | 'isActive'>) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...profileData, isActive: true })
      })

      if (response.ok) {
        const data = await response.json()
        await loadProfiles() // Reload to get updated list
        setShowCreateForm(false)
        
        // Newly created profile is automatically active
      } else {
        setError('Failed to create profile')
      }
    } catch (err) {
      setError('Network error creating profile')
    }
  }

  const handleUpdateProfile = async (profileData: Omit<DBProfile, 'id' | 'isActive'>) => {
    if (!editingProfile) return

    const loadingKey = `update-${editingProfile.id}`
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }))

    try {
      const response = await fetch(`/api/profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        await loadProfiles() // Reload to get updated list
        setEditingProfile(null)
        setError('')
        showAlert('success', '✅ Profile updated successfully!')
      } else {
        showAlert('error', '❌ Failed to update profile')
      }
    } catch (err) {
      showAlert('error', '❌ Network error updating profile')
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  const deleteProfile = async (profileId: string) => {
    const profile = profiles.find(p => p.id === profileId)
    if (!profile) return
    
    // Custom confirmation - we'll show a better confirmation later
    if (!confirm(`Are you sure you want to delete "${profile.name}"? This action cannot be undone.`)) return

    const loadingKey = `delete-${profileId}`
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }))

    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setProfiles(profiles.filter(p => p.id !== profileId))
        showAlert('success', `🗑️ Profile "${profile.name}" deleted successfully`)
      } else {
        showAlert('error', '❌ Failed to delete profile')
      }
    } catch (err) {
      showAlert('error', '❌ Network error deleting profile')
    } finally {
      setActionLoading(prev => ({ ...prev, [loadingKey]: false }))
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="loader mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your profiles...</p>
      </div>
    )
  }

  if (showCreateForm) {
    return (
      <CreateProfileForm
        onSubmit={handleCreateProfile}
        onCancel={() => setShowCreateForm(false)}
        showCancel={profiles.length > 0}
      />
    )
  }

  if (editingProfile) {
    return (
      <CreateProfileForm
        onSubmit={handleUpdateProfile}
        onCancel={() => setEditingProfile(null)}
        showCancel={true}
        initialData={editingProfile}
        isEditing={true}
        isLoading={actionLoading[`update-${editingProfile.id}`]}
      />
    )
  }

  const activeProfile = profiles.find(p => p.isActive)

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          👤 Your Professional Profiles
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
        >
          + New Profile
        </button>
      </div>

      {/* Alert Component */}
      {alert && (
        <div className={`mb-6 p-4 rounded-lg border ${
          alert.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-600'
        } flex items-center justify-between`}>
          <div className="flex items-center">
            {alert.type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{alert.message}</span>
          </div>
          <button
            onClick={() => setAlert(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {profiles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No profiles yet</h3>
          <p className="text-gray-600 mb-6">Create your first professional profile to get started</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-lg"
          >
            Create Your First Profile
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Profile Display */}
          {activeProfile && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6 shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-xl">
                        {activeProfile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase mr-3 shadow-sm">
                        Active Profile
                      </span>
                    </div>
                    <h3 className="font-bold text-2xl text-gray-900 mb-1">{activeProfile.name}</h3>
                    <p className="text-gray-700 font-medium text-lg">{activeProfile.title}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-emerald-700 font-bold text-xl">${activeProfile.hourlyRate}/hour</span>
                      <span className="text-gray-600 text-sm bg-white px-3 py-1 rounded-full">
                        {activeProfile.skills.length} skills
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
                    <button
                      onClick={() => setEditingProfile(activeProfile)}
                      disabled={actionLoading[`update-${activeProfile.id}`]}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                      title="Edit Profile"
                    >
                      {actionLoading[`update-${activeProfile.id}`] ? (
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => deleteProfile(activeProfile.id)}
                      disabled={actionLoading[`delete-${activeProfile.id}`]}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                      title="Delete Profile"
                    >
                      {actionLoading[`delete-${activeProfile.id}`] ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {activeProfile.skills.slice(0, 6).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-sm border border-gray-100"
                    >
                      {skill}
                    </span>
                  ))}
                  {activeProfile.skills.length > 6 && (
                    <span className="bg-white text-gray-600 px-3 py-1 rounded-lg text-sm border border-gray-100">
                      +{activeProfile.skills.length - 6} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                  className="bg-white text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm border border-gray-200"
                >
                  Switch Profile
                </button>
                <button
                  onClick={continueToProposal}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Continue to Job Entry →
                </button>
              </div>
            </div>
          )}

          {/* Profile Switcher */}
          {showProfileSwitcher && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-semibold text-xl text-gray-900">Choose Profile</h4>
                <button
                  onClick={() => setShowProfileSwitcher(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid gap-4">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className={`group p-5 border-2 rounded-xl cursor-pointer transition-all relative ${
                      profile.isActive
                        ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                    } ${actionLoading[`switch-${profile.id}`] ? 'pointer-events-none' : ''}`}
                    onClick={() => !actionLoading[`switch-${profile.id}`] && switchProfile(profile)}
                  >
                    {/* Loading overlay for switching profile */}
                    {actionLoading[`switch-${profile.id}`] && (
                      <div className="absolute inset-0 bg-white bg-opacity-75 rounded-xl flex items-center justify-center">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-sm font-medium">Switching...</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm ${
                            profile.isActive 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-gray-200 text-gray-700 group-hover:bg-gray-300'
                          }`}>
                            {profile.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1">
                            <h5 className="font-semibold text-lg text-gray-900 truncate">{profile.name}</h5>
                            {profile.isActive && (
                              <span className="ml-3 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 truncate">{profile.title}</p>
                          <p className="text-emerald-700 font-bold mt-1">${profile.hourlyRate}/hour</p>
                        </div>
                      </div>
                      <div className={`flex items-center space-x-1 bg-white rounded-lg p-1 shadow-sm transition-opacity ${
                        actionLoading[`switch-${profile.id}`] || actionLoading[`delete-${profile.id}`] 
                          ? 'opacity-100' 
                          : 'opacity-0 group-hover:opacity-100'
                      }`}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingProfile(profile)
                          }}
                          disabled={actionLoading[`update-${profile.id}`] || actionLoading[`delete-${profile.id}`]}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50"
                          title="Edit Profile"
                        >
                          {actionLoading[`update-${profile.id}`] ? (
                            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          )}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteProfile(profile.id)
                          }}
                          disabled={actionLoading[`delete-${profile.id}`] || actionLoading[`switch-${profile.id}`]}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                          title="Delete Profile"
                        >
                          {actionLoading[`delete-${profile.id}`] ? (
                            <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}