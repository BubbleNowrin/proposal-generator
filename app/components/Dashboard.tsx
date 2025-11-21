'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ProfileDashboard from './profile/ProfileDashboard'
import SimpleJobEntry from './SimpleJobEntry'
import ProposalGenerator from './ProposalGenerator'
import { UserProfile, JobData, GeneratedProposal } from '../types'
import Link from 'next/link'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleProfileSelected = (profile: UserProfile) => {
    setUserProfile(profile)
    setCurrentStep(2)
  }

  const handleJobSubmitted = (job: JobData) => {
    setJobData(job)
    setCurrentStep(3)
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
    setCurrentStep(1)
    setJobData(null)
    setProposal(null)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">ProposalCraft</h1>
                <p className="text-xs text-gray-500">Free AI Proposals</p>
              </div>
            </Link>

            {/* Right Side - Profile Menu */}
            <div className="flex items-center space-x-4">
              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 rounded-full pl-3 pr-2 py-2 transition-colors"
                >
                  <span className="text-sm font-medium text-gray-700 hidden sm:block">{user?.name}</span>
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </button>

                {/* Dropdown Menu */}
                {showProfileMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10"
                      onClick={() => setShowProfileMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>
                      
                      {/* Menu Items */}
                      <button
                        onClick={() => {
                          setCurrentStep(1)
                          setShowProfileMenu(false)
                        }}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                      >
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>My Profiles</span>
                      </button>
                      
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false)
                            logout()
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                        >
                          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    step <= currentStep
                      ? 'bg-blue-600'
                      : 'bg-gray-300'
                  }`}
                >
                  {step}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {step === 1 && 'Profiles'}
                  {step === 2 && 'Job Entry'}
                  {step === 3 && 'Generate Proposal'}
                </span>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 ml-4 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Profile Status Bar */}
        {userProfile && currentStep > 1 && (
          <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">✅ Active Profile: {userProfile.name}</p>
                <p className="text-sm text-green-600">{userProfile.title} • ${userProfile.hourlyRate}/hr</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={goToProfiles}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Switch Profile
                </button>
                {currentStep === 3 && (
                  <button
                    onClick={startNewJob}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 shadow-lg"
                  >
                    New Job
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Content */}
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
      </div>
    </main>
  )
}