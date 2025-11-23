'use client'

import { useState } from 'react'
import { JobData } from '../types'
import FileUpload from './FileUpload'

interface SimpleJobEntryProps {
  onJobSubmitted: (jobData: JobData) => void
  onBack: () => void
}

export default function SimpleJobEntry({ onJobSubmitted, onBack }: SimpleJobEntryProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    skills: '',
    deadline: ''
  })

  const [budgetValidation, setBudgetValidation] = useState({
    isValid: true,
    message: '',
    type: 'neutral'
  })

  const [skillsValidation, setSkillsValidation] = useState({
    isValid: true,
    message: '',
    type: 'neutral'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate budget and skills format before submission
    const budgetValid = validateBudget(formData.budget)
    const skillsValid = validateSkills(formData.skills)
    
    if (!budgetValid.isValid) {
      setBudgetValidation(budgetValid)
      return
    }
    
    if (!skillsValid.isValid) {
      setSkillsValidation(skillsValid)
      return
    }
    
    const jobData: JobData = {
      title: formData.title,
      description: formData.description,
      budget: formData.budget,
      duration: formData.deadline,
      skillsRequired: formData.skills.split(',').map(s => s.trim()).filter(s => s),
      clientInfo: {
        rating: 'N/A',
        totalSpent: 'N/A',
        location: 'N/A'
      },
      postedTime: 'Now',
      proposalsCount: 'Unknown',
      url: 'manual-entry'
    }
    
    onJobSubmitted(jobData)
  }

  const validateSkills = (skills: string) => {
    if (!skills.trim()) {
      return { isValid: true, message: '', type: 'neutral' }
    }

    // Check if skills are separated by commas
    const hasCommas = skills.includes(',')
    const skillsArray = skills.split(',').map(s => s.trim()).filter(s => s)
    
    // Detect if user typed skills without commas (multiple words without commas)
    const wordsWithoutCommas = skills.trim().split(/\s+/).length
    const potentialSkills = ['react', 'vue', 'angular', 'node', 'python', 'javascript', 'typescript', 'php', 'java', 'css', 'html', 'next', 'nuxt', 'express', 'laravel', 'django', 'mongodb', 'mysql', 'postgresql']
    
    if (!hasCommas && wordsWithoutCommas > 1) {
      // Check if multiple words look like separate skills
      const words = skills.toLowerCase().split(/\s+/)
      const matchedSkills = words.filter(word => 
        potentialSkills.some(skill => word.includes(skill) || skill.includes(word))
      )
      
      if (matchedSkills.length > 1) {
        return {
          isValid: false,
          message: `💡 Separate skills with commas: "${skills.split(/\s+/).join(', ')}"`,
          type: 'error'
        }
      }
    }

    if (hasCommas && skillsArray.length > 0) {
      // Check for empty skills after splitting
      const emptySkills = skills.split(',').some(s => s.trim() === '')
      if (emptySkills) {
        return {
          isValid: false,
          message: '💡 Remove extra commas (no empty skills)',
          type: 'error'
        }
      }

      return {
        isValid: true,
        message: `✅ ${skillsArray.length} skills detected`,
        type: 'success'
      }
    }

    if (skillsArray.length === 1) {
      return {
        isValid: true,
        message: '✅ Single skill format is fine',
        type: 'success'
      }
    }

    return { isValid: true, message: '', type: 'neutral' }
  }

  const validateBudget = (budget: string) => {
    if (!budget) {
      return { isValid: true, message: '', type: 'neutral' }
    }

    const budgetLower = budget.toLowerCase().trim()
    const hasNumbers = /\d/.test(budget)
    const hasDollar = budget.includes('$')
    
    if (!hasDollar) {
      return {
        isValid: false,
        message: '💡 Add $ sign (e.g., $25-50/hour)',
        type: 'error'
      }
    }

    if (!hasNumbers) {
      return {
        isValid: false,
        message: '💡 Add budget amount (e.g., $25-50/hour)',
        type: 'error'
      }
    }

    // Check for valid formats
    const hourlyPattern = /\$\d+(-\d+)?\/hour?/i
    const monthlyPattern = /\$\d+(-\d+)?\/(month|monthly)/i
    const fixedPattern = /\$\d+(-\d+)?$/
    const rangePattern = /\$\d+-\d+$/

    if (hourlyPattern.test(budget)) {
      return {
        isValid: true,
        message: '✅ Valid hourly rate format',
        type: 'success'
      }
    }

    if (monthlyPattern.test(budget)) {
      return {
        isValid: true,
        message: '✅ Valid monthly budget format',
        type: 'success'
      }
    }

    if (fixedPattern.test(budget) || rangePattern.test(budget)) {
      return {
        isValid: true,
        message: '✅ Valid fixed budget format',
        type: 'success'
      }
    }

    // Give specific hints based on what they typed
    if (budgetLower.includes('hour') && !budgetLower.includes('/hour')) {
      return {
        isValid: false,
        message: '💡 Use /hour format (e.g., $25-50/hour)',
        type: 'error'
      }
    }

    if (budgetLower.includes('month') && !budgetLower.includes('/month')) {
      return {
        isValid: false,
        message: '💡 Use /monthly format (e.g., $500/monthly)',
        type: 'error'
      }
    }

    if (budget.includes('-') && !budget.match(/\$\d+-\d+/)) {
      return {
        isValid: false,
        message: '💡 Range format: $min-max (e.g., $25-50/hour)',
        type: 'error'
      }
    }

    return {
      isValid: false,
      message: '💡 Try: $25-50/hour, $1000-2000, or $500/monthly',
      type: 'error'
    }
  }

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Auto-add comma after space if user typed multiple words
    const words = value.trim().split(' ')
    if (words.length > 1 && !value.includes(',')) {
      // Check if the last character is a space and we have multiple words
      if (value.endsWith(' ') && words[words.length - 1] === '') {
        // Add comma before the space
        value = words.slice(0, -1).join(' ') + ', '
      }
    }
    
    setFormData({
      ...formData,
      skills: value
    })

    const validation = validateSkills(value)
    setSkillsValidation(validation)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData({
      ...formData,
      [name]: value
    })

    // Real-time validation
    if (name === 'budget') {
      const validation = validateBudget(value)
      setBudgetValidation(validation)
    } else if (name === 'skills') {
      const validation = validateSkills(value)
      setSkillsValidation(validation)
    }
  }

  const handleFileProcessed = (result: any) => {
    if (result.success && result.parsedData) {
      const data = result.parsedData
      setFormData({
        title: data.title || formData.title,
        description: data.description || formData.description,
        budget: data.budget || formData.budget,
        skills: data.skillsRequired?.join(', ') || formData.skills,
        deadline: data.duration || formData.deadline
      })
      
      // Clear validations after auto-fill
      setBudgetValidation({ isValid: true, message: '', type: 'neutral' })
      setSkillsValidation({ isValid: true, message: '', type: 'neutral' })
    }
  }

  // Quick fill with sample data
  const fillSampleData = () => {
    setFormData({
      title: 'Full Stack Developer Needed for Critical Bug Fix',
      description: `I need an experienced full stack developer to fix critical bugs in my web application.

**Issues to fix:**
• Core feature returning inconsistent data
• API requests failing under certain conditions
• UI state not updating properly
• Database queries returning incorrect results

**Tech Stack:**
• Frontend: React/Next.js
• Backend: Node.js/Express
• Database: PostgreSQL
• Deployment: Vercel/AWS

**What I need:**
• Quick diagnosis of root causes
• Clean, maintainable fixes
• Thorough testing
• Clear documentation of changes

**Timeline:** 5-10 hours total work

**Your proposal should include:**
• Confirmation you can start immediately
• Your experience with our tech stack
• Examples of similar bug fixes
• Your debugging approach`,
      budget: '$25-50/hour',
      skills: 'React, Next.js, Node.js, PostgreSQL, Express.js, JavaScript, TypeScript, Debugging',
      deadline: '5-10 hours over 1-2 weeks'
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          📝 Job Details
        </h2>
        <button
          onClick={onBack}
          className="text-blue-500 hover:text-blue-700 font-medium"
        >
          ← Back
        </button>
      </div>

      <div className="mb-6 space-y-4">
        {/* File Upload Section */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-green-800 font-medium mb-2">🚀 Quick Job Entry</h3>
          <p className="text-green-700 text-sm mb-4">
            Upload a job posting screenshot, PDF, or document to auto-fill the job details
          </p>
          <FileUpload 
            onFileProcessed={handleFileProcessed}
            uploadType="job"
            className="mb-4"
          />
        </div>
        
        {/* Sample Data Section */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 mb-2">
            <strong>💡 Alternative:</strong> Copy and paste the job details directly from Upwork for best results.
          </p>
          <button
            onClick={fillSampleData}
            className="text-blue-600 hover:text-blue-800 font-medium underline text-sm"
          >
            Or click here to load sample job data →
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Title *
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Full Stack Developer for E-commerce Platform"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description *
          </label>
          <textarea
            name="description"
            required
            value={formData.description}
            onChange={handleChange}
            rows={12}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Paste the complete job description here..."
          />
          <p className="text-xs text-gray-500 mt-1">
            Include project details, requirements, tech stack, timeline, etc.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget/Rate *
            </label>
            <div className="relative">
              <input
                type="text"
                name="budget"
                required
                value={formData.budget}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  budgetValidation.type === 'error' 
                    ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                    : budgetValidation.type === 'success' 
                    ? 'border-green-300 focus:ring-green-500 bg-green-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="$25-50/hour or $1000-2000 or $500/monthly"
              />
              {budgetValidation.message && (
                <div className={`mt-2 text-sm flex items-center ${
                  budgetValidation.type === 'error' ? 'text-red-600' : 
                  budgetValidation.type === 'success' ? 'text-green-600' : 
                  'text-gray-600'
                }`}>
                  <span>{budgetValidation.message}</span>
                </div>
              )}
            </div>
            {!budgetValidation.message && (
              <div className="text-xs text-gray-600 mt-1">
                <strong>Format examples:</strong><br/>
                • Hourly: <code className="bg-gray-100 px-1 rounded">$25-50/hour</code><br/>
                • Fixed: <code className="bg-gray-100 px-1 rounded">$1000-2000</code><br/>
                • Monthly: <code className="bg-gray-100 px-1 rounded">$500/monthly</code>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timeline *
            </label>
            <input
              type="text"
              name="deadline"
              required
              value={formData.deadline}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="2-3 weeks, 20 hours, etc."
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skills Required *
            </label>
            <div className="relative">
              <input
                type="text"
                name="skills"
                required
                value={formData.skills}
                onChange={handleSkillsChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-colors ${
                  skillsValidation.type === 'error' 
                    ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                    : skillsValidation.type === 'success' 
                    ? 'border-green-300 focus:ring-green-500 bg-green-50'
                    : 'border-gray-300 focus:ring-blue-500'
                }`}
                placeholder="React Node.js PostgreSQL (commas added automatically)"
              />
              {skillsValidation.message && (
                <div className={`mt-2 text-sm flex items-center ${
                  skillsValidation.type === 'error' ? 'text-red-600' : 
                  skillsValidation.type === 'success' ? 'text-green-600' : 
                  'text-gray-600'
                }`}>
                  <span>{skillsValidation.message}</span>
                </div>
              )}
            </div>
            {!skillsValidation.message && (
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple skills with commas (e.g., React, Node.js, PostgreSQL)
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-3"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Generate Winning Proposal</span>
          <svg className="w-5 h-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>

      </form>
    </div>
  )
}