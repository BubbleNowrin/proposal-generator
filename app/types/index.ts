export interface UserProfile {
  name: string
  title: string
  skills: string[]
  experience: string
  portfolio: string[]
  hourlyRate: number
  bio: string
  specializations: string[]
}

export interface JobData {
  title: string
  description: string
  budget: string
  duration: string
  skillsRequired: string[]
  clientInfo: {
    rating: string
    totalSpent: string
    location: string
  }
  postedTime: string
  proposalsCount: string
  url: string
}

export interface GeneratedProposal {
  proposal: string
  estimatedBudget: string
  timeline: string
  keyPoints: string[]
  matchScore: number
  missingSkills?: string[]
}