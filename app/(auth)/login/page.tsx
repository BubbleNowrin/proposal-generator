'use client'

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import LoginForm from '../../components/auth/LoginForm'
import SignupForm from '../../components/auth/SignupForm'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const [showSignup, setShowSignup] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-3">
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
          <Link href="/" className="text-gray-600 hover:text-gray-900 font-medium">
            ← Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {showSignup ? (
            <SignupForm onSwitchToLogin={() => setShowSignup(false)} />
          ) : (
            <LoginForm onSwitchToSignup={() => setShowSignup(true)} />
          )}
        </div>
      </div>
    </main>
  )
}