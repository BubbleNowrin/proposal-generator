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
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link 
              href="/dashboard" 
              className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-lg font-semibold text-gray-800">Proposal History</h1>
          </div>
        </div>
      </nav>

      {/* Full-screen history component */}
      <div className="relative" style={{ height: 'calc(100vh - 80px - 80px)' }}>
        <ProposalHistory
          userId={user?.id || user?.email || 'anonymous'}
          isOpen={true}
          onClose={handleClose}
          onSelectProposal={handleSelectProposal}
          isStandalone={true}
        />
      </div>

      {/* Bottom Navigation */}
      <DashboardBottomNav
        activeTab="history"
        onTabChange={handleTabChange}
      />
    </div>
  )
}