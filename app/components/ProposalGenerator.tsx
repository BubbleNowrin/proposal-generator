'use client'

import { useState } from 'react'
import { UserProfile, JobData, GeneratedProposal } from '../types'
import ProposalHistory from './ProposalHistory'
import { useAuth } from '../context/AuthContext'

interface ProposalGeneratorProps {
  userProfile: UserProfile
  jobData: JobData
  onProposalGenerated: (proposal: GeneratedProposal) => void
  onBack: () => void
  onReset: () => void
}

export default function ProposalGenerator({ 
  userProfile, 
  jobData, 
  onProposalGenerated, 
  onBack, 
  onReset 
}: ProposalGeneratorProps) {
  const { user } = useAuth()
  const [proposal, setProposal] = useState<GeneratedProposal | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [tone, setTone] = useState('professional')
  const [length, setLength] = useState('medium')
  const [showHistory, setShowHistory] = useState(false)

  const saveToHistory = async (proposalData: GeneratedProposal) => {
    try {
      console.log('Saving proposal to history:', {
        userId: 'current-user',
        jobTitle: jobData.title,
        profileUsed: userProfile.name
      })
      
      const response = await fetch('/api/proposal-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || user?.email || 'anonymous', // Use actual user ID from auth context
          jobTitle: jobData.title,
          jobDescription: jobData.description,
          generatedProposal: proposalData.proposal,
          estimatedBudget: proposalData.estimatedBudget,
          timeline: proposalData.timeline,
          keyPoints: proposalData.keyPoints,
          matchScore: proposalData.matchScore,
          missingSkills: proposalData.missingSkills,
          profileUsed: userProfile.name
        })
      })
      
      const result = await response.json()
      console.log('Save to history result:', result)
      
      if (!result.success) {
        console.error('Failed to save to history:', result.error)
      }
    } catch (error) {
      console.error('Error saving to history:', error)
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
    onProposalGenerated(proposalData)
    setShowHistory(false)
  }

  const generateProposal = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          jobData,
          preferences: {
            tone,
            length
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate proposal')
      }

      const generatedProposal = await response.json()
      setProposal(generatedProposal)
      onProposalGenerated(generatedProposal)
      
      // Save to history
      await saveToHistory(generatedProposal)
    } catch (err) {
      setError('Failed to generate proposal. Please try again.')
      console.error('Proposal generation error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = async () => {
    if (isGenerating) return
    
    // Clear current proposal to show it's regenerating
    if (proposal) {
      setProposal({ ...proposal, proposal: 'Generating new proposal...' })
    }
    
    // Add randomness to ensure different generation
    const randomPreferences = {
      ...{ tone, length },
      regenerationSeed: Math.random(),
      timestamp: Date.now()
    }
    
    try {
      setIsGenerating(true)
      setError('')

      const response = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userProfile,
          jobData,
          preferences: randomPreferences,
          forceRegenerate: true
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate proposal')
      }

      const generatedProposal = await response.json()
      setProposal(generatedProposal)
      onProposalGenerated(generatedProposal)
    } catch (err) {
      setError('Failed to regenerate proposal. Please try again.')
      console.error('Proposal regeneration error:', err)
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    if (proposal) {
      try {
        await navigator.clipboard.writeText(proposal.proposal)
        // Show a better success message
        const button = document.querySelector('[data-copy-btn]') as HTMLButtonElement
        if (button) {
          const originalText = button.innerText
          button.innerText = '✅ Copied!'
          button.style.backgroundColor = '#10b981'
          setTimeout(() => {
            button.innerText = originalText
            button.style.backgroundColor = ''
          }, 2000)
        }
      } catch (err) {
        alert('Failed to copy to clipboard. Please select and copy manually.')
      }
    }
  }

  const getMatchColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          ✨ Proposal Generator
        </h2>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            ← Back to Job
          </button>
          
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            📋 Proposal History
          </button>
          <button
            onClick={onReset}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            🔄 Start Over
          </button>
        </div>
      </div>

      {/* Generation Options */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-800 mb-4">🎨 Customization Options</h3>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="professional">Professional & Direct</option>
              <option value="friendly">Friendly & Approachable</option>
              <option value="confident">Confident & Assertive</option>
              <option value="conversational">Conversational & Casual</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Length
            </label>
            <select
              value={length}
              onChange={(e) => setLength(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="short">Short & Punchy (150-250 words)</option>
              <option value="medium">Medium Detail (250-400 words)</option>
              <option value="long">Comprehensive (400-600 words)</option>
            </select>
          </div>
        </div>
        
        {proposal && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              💡 Change tone or length above and click "Regenerate" for a different version
            </p>
          </div>
        )}
      </div>

      {/* Generate Button */}
      {!proposal && (
        <button
          onClick={generateProposal}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
        >
          {isGenerating ? (
            <>
              <svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>AI Generating Your Winning Proposal...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Generate Winning Proposal</span>
              <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </>
          )}
        </button>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Generated Proposal */}
      {proposal && (
        <div className="space-y-6">
          {/* Match Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                Match Score: <span className={getMatchColor(proposal.matchScore)}>{proposal.matchScore}%</span>
              </h3>
              <p className="text-sm text-gray-600">Based on skills alignment and experience</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Est. Budget: <span className="font-medium">{proposal.estimatedBudget}</span></p>
              <p className="text-sm text-gray-600">Timeline: <span className="font-medium">{proposal.timeline}</span></p>
            </div>
          </div>

          {/* Missing Skills */}
          {proposal.missingSkills && proposal.missingSkills.length > 0 && (
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-gray-800 mb-2">⚠️ Skills Gap Analysis</h4>
              <p className="text-sm text-orange-700 mb-2">
                The job requires these skills that are not in your profile:
              </p>
              <div className="flex flex-wrap gap-2">
                {proposal.missingSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm border border-orange-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <p className="text-xs text-orange-600 mt-2">
                💡 Consider mentioning willingness to learn these skills or highlight transferable experience
              </p>
            </div>
          )}




          {/* Key Points */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">🎯 Key Selling Points</h4>
            <ul className="space-y-1">
              {proposal.keyPoints.map((point, index) => (
                <li key={index} className="text-sm text-blue-700">• {point}</li>
              ))}
            </ul>
          </div>

          
          {/* Proposal Text */}
          <div className="border rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-gray-800">📝 Your Proposal</h4>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={isGenerating}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium disabled:text-gray-400"
                >
                  {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
                </button>
                <button
                  onClick={copyToClipboard}
                  data-copy-btn
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  📋 Copy
                </button>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <textarea
                value={proposal.proposal}
                onChange={(e) => setProposal({...proposal, proposal: e.target.value})}
                className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none font-sans text-gray-700 leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your proposal will appear here..."
              />
            </div>
            
            <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
              <span>💡 Tip: You can edit the proposal above before copying</span>
              <span className="text-xs">
                {proposal.proposal.length} characters • ~{Math.ceil(proposal.proposal.split(' ').length / 200)} min read
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-400"
            >
              {isGenerating ? '🔄 Regenerating...' : '🔄 Regenerate with New Settings'}
            </button>
            <button
              onClick={onReset}
              className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              ✅ New Job
            </button>
          </div>
        </div>
      )}

      {/* Proposal History Modal */}
      <ProposalHistory
        userId={user?.id || user?.email || 'anonymous'}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        onSelectProposal={handleSelectFromHistory}
      />
    </div>
  )
}