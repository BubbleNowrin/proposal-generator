'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ProfileDashboard from './profile/ProfileDashboard'
import SimpleJobEntry from './SimpleJobEntry'
import ProposalGenerator from './ProposalGenerator'
import ProposalHistory from './ProposalHistory'
import DashboardBottomNav from './DashboardBottomNav'
import { UserProfile, JobData, GeneratedProposal } from '../types'
import Link from 'next/link'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleProfileSelected = (profile: UserProfile) => {
    setUserProfile(profile)
    setCurrentStep(2)
    setActiveTab('dashboard')
  }

  const handleJobSubmitted = (job: JobData) => {
    setJobData(job)
    setCurrentStep(3)
    setActiveTab('dashboard')
  }

  const handleProposalGenerated = (generatedProposal: GeneratedProposal) => {
    setProposal(generatedProposal)
  }

  const startNewJob = () => {
    setCurrentStep(2)
    setJobData(null)
    setProposal(null)
  }

  const goToProfiles = () => {
    setActiveTab('dashboard')
    setCurrentStep(1)
    setJobData(null)
    setProposal(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    
    switch (tab) {
      case 'dashboard':
        setShowHistory(false)
        break
      case 'profiles':
        setCurrentStep(1)
        setShowHistory(false)
        break
      case 'history':
        setShowHistory(true)
        break
      case 'posts':
        window.location.href = '/community/my-posts'
        break
    }
  }

  const handleSelectFromHistory = (historicalProposal: any) => {
    const proposalData: GeneratedProposal = {
      proposal: historicalProposal.generatedProposal,
      estimatedBudget: historicalProposal.estimatedBudget,
      timeline: historicalProposal.timeline,
      keyPoints: historicalProposal.keyPoints,
      matchScore: historicalProposal.matchScore,
      missingSkills: historicalProposal.missingSkills
    }
    setProposal(proposalData)
    setShowHistory(false)
    setActiveTab('dashboard')
    setCurrentStep(3)
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-16 pb-20">
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress Steps - Hidden when history is open */}
        {!showHistory && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center justify-center space-x-8 py-8">
              {/* Step 1 */}
              <div className={`flex flex-col items-center transition-colors ${
                currentStep === 1 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="text-sm font-medium">Choose Profile</span>
                <span className="text-xs opacity-75">Select freelance profile</span>
              </div>

              {/* Connector */}
              <div className={`h-0.5 w-16 transition-colors ${
                currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>

              {/* Step 2 */}
              <div className={`flex flex-col items-center transition-colors ${
                currentStep === 2 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="text-sm font-medium">Enter Job</span>
                <span className="text-xs opacity-75">Job description & details</span>
              </div>

              {/* Connector */}
              <div className={`h-0.5 w-16 transition-colors ${
                currentStep >= 3 ? 'bg-blue-600' : 'bg-gray-300'
              }`}></div>

              {/* Step 3 */}
              <div className={`flex flex-col items-center transition-colors ${
                currentStep === 3 ? 'text-blue-600' : 'text-gray-400'
              }`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition-colors ${
                  currentStep >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  3
                </div>
                <span className="text-sm font-medium">Generate</span>
                <span className="text-xs opacity-75">AI proposal creation</span>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <ProfileDashboard onProfileSelected={handleProfileSelected} />
          )}
          
          {currentStep === 2 && userProfile && (
            <SimpleJobEntry 
              onJobSubmitted={handleJobSubmitted}
              onBack={goToProfiles}
            />
          )}
          
          {currentStep === 3 && userProfile && jobData && (
            <ProposalGenerator
              userProfile={userProfile}
              jobData={jobData}
              onProposalGenerated={handleProposalGenerated}
              onBack={() => setCurrentStep(2)}
              onReset={startNewJob}
            />
          )}
        </div>

        {/* Proposal History */}
        {showHistory && (
          <ProposalHistory
            userId={user?.id || user?.email || 'anonymous'}
            isOpen={true}
            onClose={() => {
              setShowHistory(false)
              setActiveTab('dashboard')
            }}
            onSelectProposal={handleSelectFromHistory}
          />
        )}
      </div>

      {/* Bottom Navigation */}
      <DashboardBottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </main>
  )
}