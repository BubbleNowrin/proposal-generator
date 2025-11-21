// Simple localStorage wrapper for profile management
export interface StoredProfile {
  id: string
  name: string
  email: string
  title: string
  skills: string[]
  experience: string
  portfolio: string[]
  hourlyRate: number
  bio: string
  specializations: string[]
  createdAt: string
  lastUsed: string
}

const STORAGE_KEY = 'upwork_generator_profiles'
const CURRENT_PROFILE_KEY = 'upwork_generator_current_profile'

export const profileStorage = {
  // Get all profiles
  getAllProfiles(): StoredProfile[] {
    if (typeof window === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  },

  // Save a profile
  saveProfile(profile: Omit<StoredProfile, 'id' | 'createdAt' | 'lastUsed'>): StoredProfile {
    const profiles = this.getAllProfiles()
    const existingIndex = profiles.findIndex(p => p.email === profile.email)
    
    const savedProfile: StoredProfile = {
      ...profile,
      id: existingIndex >= 0 ? profiles[existingIndex].id : Date.now().toString(),
      createdAt: existingIndex >= 0 ? profiles[existingIndex].createdAt : new Date().toISOString(),
      lastUsed: new Date().toISOString()
    }

    if (existingIndex >= 0) {
      profiles[existingIndex] = savedProfile
    } else {
      profiles.push(savedProfile)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    this.setCurrentProfile(savedProfile.id)
    return savedProfile
  },

  // Get current active profile
  getCurrentProfile(): StoredProfile | null {
    if (typeof window === 'undefined') return null
    try {
      const currentId = localStorage.getItem(CURRENT_PROFILE_KEY)
      if (!currentId) return null
      
      const profiles = this.getAllProfiles()
      const profile = profiles.find(p => p.id === currentId)
      
      if (profile) {
        // Update last used
        profile.lastUsed = new Date().toISOString()
        this.saveProfile(profile)
      }
      
      return profile || null
    } catch {
      return null
    }
  },

  // Set current active profile
  setCurrentProfile(profileId: string): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(CURRENT_PROFILE_KEY, profileId)
  },

  // Delete a profile
  deleteProfile(profileId: string): void {
    const profiles = this.getAllProfiles().filter(p => p.id !== profileId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
    
    // If deleted profile was current, clear it
    const currentId = localStorage.getItem(CURRENT_PROFILE_KEY)
    if (currentId === profileId) {
      localStorage.removeItem(CURRENT_PROFILE_KEY)
    }
  },

  // Clear all data
  clearAll(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(CURRENT_PROFILE_KEY)
  }
}