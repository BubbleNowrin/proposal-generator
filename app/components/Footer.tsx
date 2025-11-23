'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">FreelanceHub</h3>
                <p className="text-gray-400 text-xs sm:text-sm">Complete Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm sm:text-base leading-relaxed max-w-sm">
              Everything freelancers need to succeed - AI proposals, file tools, community platform, and analytics.
            </p>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4">Platform</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/dashboard" className="hover:text-white transition-colors">AI Proposals</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Community</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">File Tools</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Analytics</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/community" className="hover:text-white transition-colors">Ask Questions</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Browse Topics</Link></li>
              <li><Link href="/community/my-posts" className="hover:text-white transition-colors">My Posts</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Help Others</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link href="/community" className="hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link href="/community" className="hover:text-white transition-colors">Feature Requests</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-gray-400 text-xs sm:text-sm text-center w-full sm:w-auto">
              © 2025 FreelanceHub. Built for freelancers, by freelancers.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-6 items-center w-full sm:w-auto">
              <Link href="/community" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/community" className="text-gray-400 hover:text-white text-xs sm:text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}