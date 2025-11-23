'use client'

import { ReactNode } from 'react'
import BreadcrumbNavigation from './BreadcrumbNavigation'

interface DashboardLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  actions?: ReactNode
  className?: string
}

export default function DashboardLayout({ 
  children, 
  title, 
  subtitle, 
  actions, 
  className = '' 
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 pt-16 ${className}`}>
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex-1">
              <BreadcrumbNavigation className="mb-2" />
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
                {subtitle && (
                  <>
                    <span className="text-gray-300">•</span>
                    <p className="text-gray-600">{subtitle}</p>
                  </>
                )}
              </div>
            </div>
            {actions && (
              <div className="flex items-center space-x-3">
                {actions}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}