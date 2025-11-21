'use client'

import { useAuth } from './context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)

  const proposalSteps = [
    "Analyzing job requirements...",
    "Understanding client needs...",
    "Crafting personalized content...",
    "Optimizing for success...",
    "✨ Proposal ready!"
  ]

  const typingTexts = [
    "Dear Client, I am excited to work on your React.js project...",
    "With 5+ years of experience in full-stack development...",
    "I specialize in creating responsive, user-friendly applications...",
    "My approach includes thorough testing and clean code practices...",
    "I can deliver your project within the specified timeline..."
  ]

  // Background typing animations
  const backgroundTexts = [
    "Hello, I'm interested in your web development project...",
    "I can help you build a modern, responsive website...",
    "My expertise includes React, Node.js, and MongoDB...",
    "I'll deliver high-quality code with detailed documentation...",
    "Looking forward to discussing your requirements...",
    "I have experience with similar projects in your industry...",
    "Let's create something amazing together!",
    "I'm available to start immediately..."
  ]

  const [backgroundTyping, setBackgroundTyping] = useState(
    backgroundTexts.map(() => ({ text: "", isVisible: false }))
  )

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % proposalSteps.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // Typing animation effect
  useEffect(() => {
    const currentText = typingTexts[currentStep] || typingTexts[0]
    setTypedText("")
    setIsTyping(true)
    
    let charIndex = 0
    const typingInterval = setInterval(() => {
      if (charIndex < currentText.length) {
        setTypedText(currentText.substring(0, charIndex + 1))
        charIndex++
      } else {
        setIsTyping(false)
        clearInterval(typingInterval)
      }
    }, 50) // 50ms per character for realistic typing speed

    return () => clearInterval(typingInterval)
  }, [currentStep])

  // Background typing animations
  useEffect(() => {
    const startBackgroundTyping = (index: number) => {
      const text = backgroundTexts[index]
      let charIndex = 0
      
      setBackgroundTyping(prev => 
        prev.map((item, i) => 
          i === index ? { ...item, text: "", isVisible: true } : item
        )
      )

      const typeInterval = setInterval(() => {
        if (charIndex < text.length) {
          setBackgroundTyping(prev =>
            prev.map((item, i) =>
              i === index 
                ? { ...item, text: text.substring(0, charIndex + 1) }
                : item
            )
          )
          charIndex++
        } else {
          clearInterval(typeInterval)
          // Hide after completion
          setTimeout(() => {
            setBackgroundTyping(prev =>
              prev.map((item, i) =>
                i === index ? { ...item, isVisible: false } : item
              )
            )
          }, 2000)
        }
      }, 80)
    }

    // Start random typing animations
    const intervals = backgroundTexts.map((_, index) => {
      return setTimeout(() => {
        startBackgroundTyping(index)
        // Repeat every 15-25 seconds
        setInterval(() => startBackgroundTyping(index), 15000 + Math.random() * 10000)
      }, Math.random() * 8000) // Initial random delay
    })

    return () => {
      intervals.forEach(clearTimeout)
    }
  }, [])

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

  return (
    <main className="min-h-screen bg-white text-gray-900 overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm overflow-hidden">
        {/* Subtle background pattern for nav */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="navPattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <circle cx="30" cy="30" r="1" fill="#3B82F6"/>
                <circle cx="10" cy="10" r="0.5" fill="#3B82F6"/>
                <circle cx="50" cy="50" r="0.5" fill="#3B82F6"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#navPattern)" />
          </svg>
        </div>
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">
                ProposalCraft
              </h1>
              <p className="text-xs text-gray-500 -mt-1">Free AI Proposals</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/login" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign In
            </Link>
            <Link href="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gray-50 overflow-hidden">
        {/* Background Typing Animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {backgroundTyping.map((item, index) => (
            <AnimatePresence key={index}>
              {item.isVisible && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="absolute bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 shadow-sm max-w-xs"
                  style={{
                    top: index < 4 ? `${5 + (index * 8)}%` : `${70 + ((index - 4) * 10)}%`,
                    left: index % 2 === 0 ? `${5 + (index % 2) * 10}%` : `${75 + (index % 2) * 10}%`,
                    transform: index % 2 === 0 ? 'rotate(-2deg)' : 'rotate(2deg)',
                    zIndex: 1
                  }}
                >
                  <div className="text-xs text-gray-600 font-mono">
                    {item.text}
                    <motion.span
                      animate={{ opacity: [1, 0, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-blue-500"
                    >
                      |
                    </motion.span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          ))}
        </div>
        <div className="relative container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              {/* Left Column - Text Content */}
              <div className="text-left">
                <motion.h1 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-6xl md:text-7xl font-black mb-8 leading-tight text-gray-900"
                >
                  <motion.span 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-blue-600 inline-block"
                  >
                    AI-Powered
                  </motion.span>
                  <br />
                  Proposal Generator
                  <br />
                  <span className="text-2xl md:text-3xl font-semibold text-gray-600">100% Free Forever</span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="text-xl text-gray-600 mb-12 leading-relaxed"
                >
                  Generate winning freelance proposals in seconds. 
                  Join 25,000+ professionals increasing their success rate.
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.0 }}
                  className="flex flex-col sm:flex-row gap-6 mb-16"
                >
                  <Link href="/login" 
                    className="group bg-blue-600 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all duration-300 shadow-2xl transform hover:-translate-y-1 hover:scale-105">
                    <span className="flex items-center justify-center">
                      Start Creating Free
                      <motion.svg 
                        className="ml-2 w-5 h-5" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
                      </motion.svg>
                    </span>
                  </Link>
                  <Link href="#features" 
                    className="text-gray-600 px-8 py-4 rounded-2xl font-semibold text-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300">
                    Learn More
                  </Link>
                </motion.div>

                {/* Trust Indicators */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="flex flex-wrap items-center gap-8 opacity-70"
                >
                  <div className="flex items-center space-x-2">
                    <div className="flex -space-x-2">
                      {[1,2,3,4].map(i => (
                        <motion.div 
                          key={i} 
                          className="w-8 h-8 bg-blue-600 rounded-full border-2 border-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 1.4 + i * 0.1, type: "spring" }}
                        />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm">25,000+ active users</span>
                  </div>
                  <div className="text-gray-400">•</div>
                  <div className="text-gray-600 text-sm">⭐⭐⭐⭐⭐ 4.9/5 rating</div>
                  <div className="text-gray-400">•</div>
                  <div className="text-gray-600 text-sm">🆓 100% Free Forever</div>
                </motion.div>
              </div>

              {/* Right Column - AI Animation */}
              <div className="relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200"
                >
                  {/* Mock Browser Window */}
                  <div className="flex items-center mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1 text-center">
                      <div className="text-sm text-gray-500">ProposalCraft AI Generator</div>
                    </div>
                  </div>

                  {/* AI Generation Process */}
                  <div className="space-y-4">
                    <div className="text-lg font-semibold text-gray-900 mb-4">
                      🤖 AI is generating your proposal...
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center space-x-3"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
                        />
                        <span className="text-gray-600">{proposalSteps[currentStep]}</span>
                      </motion.div>
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-6">
                      <motion.div
                        className="bg-blue-600 h-2 rounded-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((currentStep + 1) / proposalSteps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {/* Mock Proposal Preview */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: currentStep === proposalSteps.length - 1 ? 1 : 0.3 }}
                      className="mt-6 p-4 bg-gray-50 rounded-lg border"
                    >
                      <div className="text-sm text-gray-500 mb-2">Generated Proposal Preview:</div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-300 rounded w-full"></div>
                        <div className="h-3 bg-gray-300 rounded w-4/5"></div>
                        <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-blue-200 rounded w-full"></div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Dynamic Floating Preview Cards */}
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 2, duration: 0.8 }}
                  className="absolute -top-8 -right-8 bg-white border border-blue-200 rounded-lg px-3 py-2 shadow-lg max-w-48"
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-600">Client Response</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="h-2 bg-green-100 rounded overflow-hidden"
                  >
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "85%" }}
                      transition={{ delay: 3, duration: 1.5 }}
                      className="h-full bg-green-500 rounded"
                    />
                  </motion.div>
                  <span className="text-xs text-green-600 font-medium">85% Success Rate</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 3, duration: 0.8 }}
                  className="absolute -bottom-6 -left-6 bg-white border border-purple-200 rounded-lg px-3 py-2 shadow-lg"
                >
                  <div className="flex items-center space-x-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full"
                    />
                    <span className="text-xs font-medium text-gray-600">Analyzing...</span>
                  </div>
                </motion.div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Three steps, that's it</h2>
            <p className="text-gray-600 text-lg">No complicated setup. No credit card. Just better proposals.</p>
          </motion.div>

          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.1, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="text-center"
              >
                <motion.div 
                  className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-200 rounded-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-3xl font-bold text-blue-600 relative z-10">1</span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Choose your profile</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tell us about your skills once. We'll remember it and tailor every proposal to match your experience and style.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="text-center"
              >
                <motion.div 
                  className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative"
                  whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                  animate={{ y: [-8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.3 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-blue-200 rounded-2xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                  <span className="text-3xl font-bold text-blue-600 relative z-10">2</span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Paste the job description</h3>
                <p className="text-gray-600 leading-relaxed">
                  Copy the job posting from Upwork, Fiverr, or wherever. Our AI reads it and figures out what the client actually wants.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.3, type: "spring", stiffness: 100 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="text-center"
              >
                <motion.div 
                  className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 relative overflow-visible"
                  whileHover={{ scale: 1.1, transition: { duration: 0.3 } }}
                  animate={{ scale: [1, 1.05] }}
                  transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut", delay: 0.6 }}
                >
                  <motion.div
                    className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl"
                    animate={{
                      opacity: [0, 0.3, 0],
                      scale: [0.9, 1.1, 0.9]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <span className="text-3xl font-bold text-blue-600 relative z-10">3</span>
                </motion.div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Get your proposal</h3>
                <p className="text-gray-600 leading-relaxed">
                  In about 10 seconds, you'll have a personalized proposal. Edit it if you want, or send it as-is. Your call.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Built by a freelancer, for freelancers</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                I spent years writing proposals manually. Here's what I learned and built into this tool.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-blue-100 p-3 rounded-xl flex-shrink-0 relative"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-blue-200 rounded-xl"
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <svg className="w-6 h-6 text-blue-600 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Stop spending hours on proposals</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Writing custom proposals takes forever. You're either copying the same template (and clients can tell), or spending 30+ minutes per application. This tool gets you back to actual work.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-green-100 p-3 rounded-xl flex-shrink-0 relative"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-green-200 rounded-xl"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    />
                    <svg 
                      className="w-6 h-6 text-green-600 relative z-10" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Actually sounds like you</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Most AI writing sounds robotic. This one learns your tone and adapts to different job types. Clients won't know it's AI-assisted unless you tell them.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-purple-100 p-3 rounded-xl flex-shrink-0 relative"
                    animate={{ y: [-10, 0, -10] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-purple-200 rounded-xl"
                      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <svg className="w-6 h-6 text-purple-600 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Multiple profiles for different skills</h3>
                    <p className="text-gray-600 leading-relaxed">
                      Web developer by day, content writer on weekends? Create different profiles and switch between them. Each proposal matches the right expertise.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-2xl border border-gray-200"
              >
                <div className="flex items-start space-x-4">
                  <motion.div 
                    className="bg-orange-100 p-3 rounded-xl flex-shrink-0 relative"
                    animate={{ 
                      rotate: [-5, 5],
                      scale: [1, 1.05]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      repeatType: "reverse",
                      ease: "easeInOut" 
                    }}
                  >
                    <motion.div
                      className="absolute -inset-1 bg-orange-300 rounded-xl"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
                    />
                    <motion.div
                      className="absolute inset-0 bg-orange-200 rounded-xl"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <svg className="w-6 h-6 text-orange-600 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Seriously, it's free</h3>
                    <p className="text-gray-600 leading-relaxed">
                      No free trial that expires. No premium tier. No hidden costs. I built this because proposal writing sucks, and everyone should have access to something that helps.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-8 text-gray-900">
              Ready to win more clients?
            </h2>
            <Link href="/login" 
              className="inline-flex items-center bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Get Started Free
              <motion.svg 
                className="ml-2 w-5 h-5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
                animate={{ x: [0, 3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
              >
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </motion.svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-300">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="flex items-center space-x-3 mb-4 md:mb-0"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-blue-600">
                  ProposalCraft
                </h3>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="text-gray-700 text-center"
            >
              <p className="text-gray-700 font-medium">&copy; 2025 ProposalCraft. All rights reserved. Free for freelancers worldwide ❤️</p>
            </motion.div>
          </div>
        </div>
      </footer>
    </main>
  )
}