'use client'

import { useState } from 'react'
import ProposalHistory from '../components/ProposalHistory'
import DashboardBottomNav from '../components/DashboardBottomNav'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HistoryPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [selectedProposal, setSelectedProposal] = useState<any>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleSelectProposal = (proposal: any) => {
    setSelectedProposal(proposal)
    // Could redirect to dashboard with this proposal loaded
    // For now, just show selection
  }

  const handleClose = () => {
    // This shouldn't be called in standalone page, but just in case
    window.location.href = '/dashboard'
  }

  const handleTabChange = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        router.push('/dashboard')
        break
      case 'history':
        // Already on history page
        break
      case 'posts':
        router.push('/community/my-posts')
        break
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Left side - Back button */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium text-sm sm:text-base">Dashboard</span>
              </Link>
            </div>

            {/* Center - Title */}
            <div className="flex-1 text-center">
              <h1 className="text-base sm:text-lg font-semibold text-gray-800">
                <span className="sm:hidden">📚 History</span>
                <span className="hidden sm:inline">📚 Proposal History</span>
              </h1>
            </div>

            {/* Right side - Desktop only sidebar toggle */}
            <div className="w-16 flex justify-end">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors p-2 rounded-lg hover:bg-gray-100"
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <svg className={`w-5 h-5 transition-transform duration-200 ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile-First Layout */}
      <div className="lg:hidden">
        {/* Mobile View */}
        {!selectedProposal ? (
          /* Proposal List View */
          <div className="min-h-screen bg-gray-50">
            <div className="sticky top-[60px] bg-white border-b border-gray-200 px-4 py-3 z-20 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">📚 Your Proposals</h2>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Tap to view</div>
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                <button className="px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm">All</button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap shadow-sm">High Score</button>
                <button className="px-4 py-2 bg-white border border-gray-300 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-50 active:bg-gray-100 transition-colors whitespace-nowrap shadow-sm">Recent</button>
              </div>
            </div>
            
            <div className="px-4 py-4 space-y-3" style={{ paddingBottom: '100px' }}>
              <ProposalHistory
                userId={user?.id || user?.email || 'anonymous'}
                isOpen={true}
                onClose={handleClose}
                onSelectProposal={handleSelectProposal}
                isStandalone={true}
                mobile={true}
              />
            </div>
          </div>
        ) : (
          /* Proposal Detail View */
          <div className="min-h-screen bg-gray-50">
            <div className="sticky top-[60px] bg-white border-b border-gray-200 px-3 py-3 z-20 shadow-sm">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedProposal(null)}
                  className="p-2.5 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold text-gray-900 line-clamp-1">{selectedProposal.jobTitle}</h2>
                  <div className="flex items-center flex-wrap gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedProposal.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                      selectedProposal.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedProposal.matchScore}% Match
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-4 space-y-4" style={{ paddingBottom: '100px' }}>
              <div className="space-y-4">
                {/* Quick Stats Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Project Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Budget
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{selectedProposal.estimatedBudget}</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Timeline
                      </span>
                      <span className="text-sm font-semibold text-gray-900">{selectedProposal.timeline}</span>
                    </div>
                  </div>
                </div>
                
                {/* Proposal Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-800 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Generated Proposal
                    </h3>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">{selectedProposal.generatedProposal}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(selectedProposal.generatedProposal)
                      alert('Proposal copied to clipboard!')
                    }}
                    className="bg-white border-2 border-gray-300 text-gray-700 px-4 py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={() => window.location.href = '/dashboard'}
                    className="bg-blue-500 text-white px-4 py-3 rounded-xl font-medium transition-all active:scale-95 flex items-center justify-center space-x-2 shadow-sm"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>New</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex" style={{ height: 'calc(100vh - 80px - 80px)' }}>
        {/* Sidebar */}
        <div className={`
          ${sidebarCollapsed ? 'w-16' : 'w-96'} 
          transition-all duration-300 ease-in-out 
          bg-white border-r border-gray-200 
          flex flex-col overflow-hidden
        `}>
          {!sidebarCollapsed && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Recent Proposals</h2>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">All</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors">High Score</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors">Recent</button>
              </div>
            </div>
          )}
          
          {/* Collapsed Sidebar Content */}
          {sidebarCollapsed && (
            <div className="flex flex-col items-center p-2 space-y-4">
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="p-3 rounded-lg hover:bg-gray-100 transition-colors"
                title="Expand sidebar"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-sm">📝</span>
              </div>
            </div>
          )}
          
          {/* History List */}
          {!sidebarCollapsed && (
            <div className="flex-1 overflow-hidden">
              <ProposalHistory
                userId={user?.id || user?.email || 'anonymous'}
                isOpen={true}
                onClose={handleClose}
                onSelectProposal={handleSelectProposal}
                isStandalone={true}
                compact={true}
              />
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 bg-gray-50 p-6 overflow-auto">
          {selectedProposal ? (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedProposal.jobTitle}</h1>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className={`px-3 py-1 rounded-full font-medium ${
                          selectedProposal.matchScore >= 80 ? 'bg-green-100 text-green-700' :
                          selectedProposal.matchScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {selectedProposal.matchScore}% Match
                        </span>
                        <span>{selectedProposal.estimatedBudget}</span>
                        <span>{selectedProposal.timeline}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedProposal(null)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Proposal</h3>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedProposal.generatedProposal}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center">
              <div>
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Select a Proposal</h2>
                <p className="text-gray-500 mb-6">Choose a proposal from the sidebar to view details and content.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <DashboardBottomNav
        activeTab="history"
        onTabChange={handleTabChange}
      />
    </div>
  )
}