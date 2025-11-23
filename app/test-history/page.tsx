'use client'

import { useState } from 'react'

export default function TestHistoryPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/proposal-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'current-user',
          jobTitle: 'Test Job Title',
          jobDescription: 'This is a test job description',
          generatedProposal: 'This is a test proposal generated for testing purposes.',
          estimatedBudget: '$1000-2000',
          timeline: '2-3 weeks',
          keyPoints: ['Test point 1', 'Test point 2'],
          matchScore: 85,
          missingSkills: ['React'],
          profileUsed: 'Test Profile'
        })
      })
      
      const data = await response.json()
      setResult(`Save result: ${JSON.stringify(data, null, 2)}`)
      console.log('Save result:', data)
    } catch (error) {
      setResult(`Error saving: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testFetch = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/proposal-history?userId=test-user-123')
      const data = await response.json()
      setResult(`Fetch result: ${JSON.stringify(data, null, 2)}`)
      console.log('Fetch result:', data)
    } catch (error) {
      setResult(`Error fetching: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test Proposal History API</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={testSave}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Save Proposal'}
          </button>
          
          <button
            onClick={testFetch}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
          >
            {loading ? 'Testing...' : 'Test Fetch Proposals'}
          </button>
        </div>

        {result && (
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}