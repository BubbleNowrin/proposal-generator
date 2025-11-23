'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">FH</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">FreelanceHub</h3>
                <p className="text-gray-400 text-sm">Complete Platform</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
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
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 FreelanceHub. Built for freelancers, by freelancers.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/community" className="text-gray-400 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link href="/community" className="text-gray-400 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}