'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'

interface ProposalHistoryItem {
  _id: string
  jobTitle: string
  jobDescription: string
  generatedProposal: string
  estimatedBudget: string
  timeline: string
  keyPoints: string[]
  matchScore: number
  missingSkills?: string[]
  profileUsed: string
  createdAt: string
}

interface CategorizedProposals {
  past24Hours: ProposalHistoryItem[]
  past7Days: ProposalHistoryItem[]
  past30Days: ProposalHistoryItem[]
}

interface ProposalHistoryProps {
  userId: string
  isOpen: boolean
  onClose: () => void
  onSelectProposal: (proposal: ProposalHistoryItem) => void
  isStandalone?: boolean
  mobile?: boolean
  compact?: boolean
}

export default function ProposalHistory({ userId, isOpen, onClose, onSelectProposal, isStandalone = false, mobile = false, compact = false }: ProposalHistoryProps) {
  const [proposals, setProposals] = useState<CategorizedProposals>({
    past24Hours: [],
    past7Days: [],
    past30Days: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedProposal, setSelectedProposal] = useState<ProposalHistoryItem | null>(null)

  useEffect(() => {
    if (isOpen && userId) {
      fetchProposals()
    }
  }, [isOpen, userId])

  const fetchProposals = async () => {
    try {
      setLoading(true)
      console.log('Fetching proposals for userId:', userId)
      const response = await fetch(`/api/proposal-history?userId=${userId}`)
      const result = await response.json()
      
      console.log('Fetch response:', result)
      
      if (result.success) {
        setProposals(result.data)
      } else {
        console.error('Failed to fetch proposals:', result.error)
      }
    } catch (error) {
      console.error('Error fetching proposals:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderProposalItem = (proposal: ProposalHistoryItem) => (
    <div
      key={proposal._id}
      className={`${
        mobile ? 'p-4' : compact ? 'p-2.5' : 'p-3'
      } rounded-lg cursor-pointer transition-all duration-200 border shadow-sm ${
        selectedProposal?._id === proposal._id
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md active:scale-[0.98]'
      }`}
      onClick={() => {
        setSelectedProposal(proposal)
        onSelectProposal(proposal)
      }}
    >
      <h4 className={`font-semibold text-gray-900 mb-2 ${
        mobile ? 'text-base line-clamp-2' : compact ? 'text-xs truncate' : 'text-sm truncate'
      }`}>
        {proposal.jobTitle}
      </h4>
      <div className={`flex items-center flex-wrap gap-2 mb-2 ${
        mobile ? 'text-xs' : 'text-xs'
      }`}>
        <span className={`px-2.5 py-1 rounded-full font-medium whitespace-nowrap ${
          proposal.matchScore >= 80 ? 'bg-green-100 text-green-700' :
          proposal.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
          'bg-red-100 text-red-700'
        }`}>
          {proposal.matchScore}% match
        </span>
        <span className="text-gray-500 text-xs">{formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</span>
      </div>
      {!compact && (
        <p className={`text-gray-600 ${
          mobile ? 'text-sm line-clamp-2 leading-relaxed' : 'text-xs line-clamp-2'
        }`}>
          {proposal.generatedProposal.substring(0, mobile ? 120 : 100)}...
        </p>
      )}
    </div>
  )

  const renderSection = (title: string, proposals: ProposalHistoryItem[], icon: string) => {
    if (proposals.length === 0) return null

    return (
      <div className={mobile ? 'mb-6' : 'mb-6'}>
        <h3 className={`flex items-center gap-2 font-semibold text-gray-700 mb-3 ${
          mobile ? 'text-sm' : 'text-sm'
        }`}>
          <span className={mobile ? 'text-lg' : ''}>{icon}</span>
          {title}
          <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
            {proposals.length}
          </span>
        </h3>
        <div className={mobile ? 'space-y-3' : 'space-y-2'}>
          {proposals.map(renderProposalItem)}
        </div>
      </div>
    )
  }

  if (!isOpen) return null

  // Compact version for desktop sidebar
  if (compact && !mobile) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {renderSection('Past 24 hours', proposals.past24Hours, '🕐')}
              {renderSection('Past 7 days', proposals.past7Days, '📅')}
              {renderSection('Past 30 days', proposals.past30Days, '📊')}
              
              {proposals.past24Hours.length === 0 && 
               proposals.past7Days.length === 0 && 
               proposals.past30Days.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-3xl mb-2">📝</div>
                  <p className="text-sm text-gray-500">No proposals yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start creating proposals
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    )
  }

  // Mobile-only version for history page
  if (mobile && isStandalone) {
    return (
      <div className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {renderSection('Past 24 hours', proposals.past24Hours, '🕐')}
            {renderSection('Past 7 days', proposals.past7Days, '📅')}
            {renderSection('Past 30 days', proposals.past30Days, '📊')}
            
            {proposals.past24Hours.length === 0 && 
             proposals.past7Days.length === 0 && 
             proposals.past30Days.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="text-gray-400 text-4xl">📝</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No proposals yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start creating proposals to see them here</p>
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create First Proposal</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Standalone version (for /history page)
  if (isStandalone) {
    return (
      <div className="flex bg-gray-50 h-full">
        {/* Sidebar */}
        <div className="w-80 bg-white shadow-xl overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h2 className="text-lg font-bold text-gray-900">Proposal History</h2>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="flex-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Proposal</span>
              </button>
              <button
                onClick={fetchProposals}
                className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {/* Info Banner */}
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Auto-deleted after 30 days
              </p>
            </div>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <>
                {renderSection('Past 24 hours', proposals.past24Hours, '🕐')}
                {renderSection('Past 7 days', proposals.past7Days, '📅')}
                {renderSection('Past 30 days', proposals.past30Days, '📊')}
                
                {proposals.past24Hours.length === 0 && 
                 proposals.past7Days.length === 0 && 
                 proposals.past30Days.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-4xl mb-2">📝</div>
                    <p className="text-gray-500">No proposals generated yet</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Start creating proposals to see them here
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main Content for standalone */}
        <div className="flex-1 bg-gray-50">
          {selectedProposal ? (
            <div className="h-full overflow-y-auto">
              {/* Header Bar */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setSelectedProposal(null)}
                      className="text-gray-400 hover:text-gray-600 p-1"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <div>
                      <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
                        {selectedProposal.jobTitle}
                      </h1>
                      <p className="text-sm text-gray-500">
                        Created {formatDistanceToNow(new Date(selectedProposal.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      selectedProposal.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                      selectedProposal.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedProposal.matchScore}% Match
                    </div>
                    
                    <button
                      onClick={() => window.location.href = '/dashboard'}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>New Proposal</span>
                    </button>
                    
                    <button
                      onClick={() => onSelectProposal(selectedProposal)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      <span>Use This Proposal</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 pb-24">
                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Quick Stats */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-sm text-gray-600">Budget</p>
                        <p className="font-semibold text-gray-900">{selectedProposal.estimatedBudget}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Timeline</p>
                        <p className="font-semibold text-gray-900">{selectedProposal.timeline}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Profile</p>
                        <p className="font-semibold text-gray-900 truncate">{selectedProposal.profileUsed}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Generated Proposal */}
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Generated Proposal</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                          {selectedProposal.generatedProposal}
                        </pre>
                      </div>
                    </div>

                    {/* Key Points */}
                    {selectedProposal.keyPoints.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h2>
                        <ul className="space-y-2">
                          {selectedProposal.keyPoints.map((point, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-blue-500 mt-1">•</span>
                              <span className="text-gray-700 text-sm">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Missing Skills */}
                    {selectedProposal.missingSkills && selectedProposal.missingSkills.length > 0 && (
                      <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {selectedProposal.missingSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Job Description */}
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Original Job Description</h2>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {selectedProposal.jobDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
              <div className="text-center max-w-md mx-auto p-8">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Select a Proposal
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Choose from your generated proposals on the left to view details, copy content, or reuse for similar jobs.
                </p>
                
                {/* Quick Actions */}
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create New Proposal</span>
                  </button>
                  
                  <button
                    onClick={fetchProposals}
                    className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh History</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Modal version (for dashboard overlay)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-xl overflow-y-auto">
        {/* Header with Navigation */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Proposal History</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1 hover:bg-white rounded-full transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center text-sm text-gray-600 mb-3">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex items-center hover:text-blue-600 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Dashboard
            </button>
            <svg className="w-4 h-4 mx-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-blue-600 font-medium">History</span>
          </div>

          {/* Quick Actions */}
          <div className="flex space-x-2">
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="flex-1 bg-white border border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>New Proposal</span>
            </button>
            <button
              onClick={fetchProposals}
              className="bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 px-3 py-2 rounded-lg text-sm transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Info Banner */}
          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700 flex items-center">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Auto-deleted after 30 days
            </p>
          </div>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {renderSection('Past 24 hours', proposals.past24Hours, '🕐')}
              {renderSection('Past 7 days', proposals.past7Days, '📅')}
              {renderSection('Past 30 days', proposals.past30Days, '📊')}
              
              {proposals.past24Hours.length === 0 && 
               proposals.past7Days.length === 0 && 
               proposals.past30Days.length === 0 && (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-2">📝</div>
                  <p className="text-gray-500">No proposals generated yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start creating proposals to see them here
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-50">
        {selectedProposal ? (
          <div className="h-full overflow-y-auto">
            {/* Header Bar */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setSelectedProposal(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 truncate max-w-md">
                      {selectedProposal.jobTitle}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Created {formatDistanceToNow(new Date(selectedProposal.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedProposal.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                    selectedProposal.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedProposal.matchScore}% Match
                  </div>
                  
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New Proposal</span>
                  </button>
                  
                  <button
                    onClick={() => onSelectProposal(selectedProposal)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>Use This Proposal</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Budget</p>
                      <p className="font-semibold text-gray-900">{selectedProposal.estimatedBudget}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Timeline</p>
                      <p className="font-semibold text-gray-900">{selectedProposal.timeline}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Profile</p>
                      <p className="font-semibold text-gray-900 truncate">{selectedProposal.profileUsed}</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* Generated Proposal */}
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Generated Proposal</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
                        {selectedProposal.generatedProposal}
                      </pre>
                    </div>
                  </div>

                  {/* Key Points */}
                  {selectedProposal.keyPoints.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Key Points</h2>
                      <ul className="space-y-2">
                        {selectedProposal.keyPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span className="text-gray-700 text-sm">{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Missing Skills */}
                  {selectedProposal.missingSkills && selectedProposal.missingSkills.length > 0 && (
                    <div className="mb-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Missing Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {selectedProposal.missingSkills.map((skill, index) => (
                          <span
                            key={index}
                            className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Job Description */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Original Job Description</h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {selectedProposal.jobDescription}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center max-w-md mx-auto p-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Select a Proposal
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Choose from your generated proposals on the left to view details, copy content, or reuse for similar jobs.
              </p>
              
              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = '/dashboard'}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Create New Proposal</span>
                </button>
                
                <button
                  onClick={fetchProposals}
                  className="w-full bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh History</span>
                </button>
              </div>
              
              {/* Helpful Tips */}
              <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Pro Tips
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 text-left">
                  <li>• Proposals are organized by time periods</li>
                  <li>• Use high-match proposals for similar jobs</li>
                  <li>• Copy successful proposal patterns</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}