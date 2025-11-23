'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href: string
  icon?: string
}

interface BreadcrumbNavigationProps {
  items?: BreadcrumbItem[]
  className?: string
}

export default function BreadcrumbNavigation({ items, className = '' }: BreadcrumbNavigationProps) {
  const pathname = usePathname()
  
  // Auto-generate breadcrumbs if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (pathname === '/') return []
    
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: '🏠' }
    ]
    
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      let label = segment.charAt(0).toUpperCase() + segment.slice(1)
      let icon = ''
      
      // Custom labels for known routes
      switch (segment) {
        case 'dashboard':
          label = 'AI Proposals'
          icon = '🤖'
          break
        case 'community':
          label = 'Community'
          icon = '🌐'
          break
        case 'my-posts':
          label = 'My Posts'
          icon = '📝'
          break
        case 'login':
          label = 'Sign In'
          icon = '🔐'
          break
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        icon
      })
    })
    
    return breadcrumbs
  }
  
  const breadcrumbItems = items || generateBreadcrumbs()
  
  if (breadcrumbItems.length <= 1) return null
  
  return (
    <nav className={`flex items-center space-x-2 text-sm ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <div key={item.href} className="flex items-center space-x-2">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <Link
            href={item.href}
            className={`flex items-center space-x-1 hover:text-blue-600 transition-colors ${
              index === breadcrumbItems.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-500'
            }`}
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.label}</span>
          </Link>
        </div>
      ))}
    </nav>
  )
}