import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { UserProfile, JobData, GeneratedProposal } from '../../types'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { userProfile, jobData, preferences, forceRegenerate = false } = await request.json()

    if (!process.env.GROQ_API_KEY) {
      console.log('No GROQ_API_KEY found, using fallback')
      // Use fallback but still make it varied
      const skillMatch = calculateSkillMatch(userProfile.skills, jobData.skillsRequired)
      const proposalText = generateFallbackProposal(userProfile, jobData, preferences)
      const estimatedBudget = extractBudgetEstimate(jobData.budget, userProfile.hourlyRate)
      const timeline = extractTimelineEstimate(jobData.duration)
      const keyPoints = generateKeyPoints(userProfile, jobData)
      const matchScore = calculateMatchScore(userProfile, jobData)

      return NextResponse.json({
        proposal: proposalText,
        estimatedBudget,
        timeline,
        keyPoints,
        matchScore,
        missingSkills: skillMatch.missingSkills
      })
    }

    // Calculate skill match for use throughout the function
    const skillMatch = calculateSkillMatch(userProfile.skills, jobData.skillsRequired)

    // Calculate match score with some variation
    const matchScore = calculateMatchScore(userProfile, jobData, forceRegenerate)

    // Generate proposal using Groq
    const proposalText = await generateProposalText(userProfile, jobData, preferences, forceRegenerate)
    
    // Extract budget and timeline estimates
    const estimatedBudget = extractBudgetEstimate(jobData.budget, userProfile.hourlyRate)
    const timeline = extractTimelineEstimate(jobData.duration)
    
    // Generate key points with variation
    const keyPoints = generateKeyPoints(userProfile, jobData, forceRegenerate)

    const generatedProposal: GeneratedProposal = {
      proposal: proposalText,
      estimatedBudget,
      timeline,
      keyPoints,
      matchScore,
      missingSkills: skillMatch.missingSkills
    }

    return NextResponse.json(generatedProposal)
    
  } catch (error) {
    console.error('Proposal generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate proposal' },
      { status: 500 }
    )
  }
}

async function generateProposalText(
  userProfile: UserProfile, 
  jobData: JobData, 
  preferences: any,
  forceRegenerate: boolean = false
): Promise<string> {
  const prompt = `You are an expert Upwork proposal writer who creates personalized, winning proposals. Based on the job and freelancer details below, write a compelling proposal.

JOB DETAILS:
Title: ${jobData.title}
Description: ${jobData.description}
Budget: ${jobData.budget}
Skills Required: ${jobData.skillsRequired.join(', ')}
Timeline: ${jobData.duration}

FREELANCER PROFILE:
Name: ${userProfile.name}
Title: ${userProfile.title}
Skills: ${userProfile.skills.join(', ')}
Rate: $${userProfile.hourlyRate}/hour
Experience: ${userProfile.experience}
Specializations: ${userProfile.specializations.join(', ')}

WRITING GUIDELINES:
- Tone: ${preferences.tone}
- Length: ${preferences.length}
- Start with a hook that shows you READ and UNDERSTOOD the specific job requirements
- Highlight 2-3 most relevant skills/experiences that match the job
- Address the client's pain points or challenges mentioned in the job description
- Provide a brief solution approach or methodology
- Include specific deliverables or outcomes you'll provide
- End with a clear call to action
- Avoid generic phrases like "I'm excited about this opportunity"
- Don't just list skills - show HOW you'll solve their specific problem

IMPORTANT: Make this proposal feel like it was written specifically for THIS job, not a template. Reference specific details from the job description and explain exactly how your background makes you the right fit.

Write a ${preferences.length === 'short' ? '150-250 word' : preferences.length === 'medium' ? '250-400 word' : '400-600 word'} proposal that stands out from generic applications.`

  try {
    // Add randomness to ensure different outputs each time
    const randomSeed = Math.floor(Math.random() * 1000)
    const enhancedPrompt = `${prompt}

GENERATION #${randomSeed} - Create a UNIQUE variation. Use different:
- Opening hooks (avoid "I've reviewed", try "I noticed", "I see you're looking for", "Your project caught my attention")
- Structure and flow
- Specific examples and approaches
- Closing statements

Make this proposal feel distinctly different from previous versions while maintaining quality.`

    const completion = await groq.chat.completions.create({
      messages: [{ role: 'user', content: enhancedPrompt }],
      model: 'llama-3.1-8b-instant', // Updated to supported model
      temperature: 0.9, // Higher temperature for more creativity
      max_tokens: 1500,
      top_p: 0.9,      // Add some randomness
      frequency_penalty: 0.5, // Reduce repetition
      presence_penalty: 0.3    // Encourage new topics
    })

    return completion.choices[0]?.message?.content || 'Failed to generate proposal'
  } catch (error) {
    console.error('Groq API error:', error)
    return generateFallbackProposal(userProfile, jobData, preferences)
  }
}

function normalizeSkill(skill: string): string {
  // Basic normalization - remove punctuation, lowercase, trim
  return skill.toLowerCase()
    .replace(/[\.\_\-\s]+/g, '') // Remove dots, underscores, dashes, spaces
    .replace(/js$/, 'javascript') // Common .js ending
    .replace(/css$/, 'css') // Common .css ending
    .trim()
}

function calculateStringSimilarity(str1: string, str2: string): number {
  // Levenshtein distance algorithm for string similarity
  const matrix = []
  const len1 = str1.length
  const len2 = str2.length

  if (len1 === 0) return len2
  if (len2 === 0) return len1

  // Create matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      )
    }
  }

  // Convert distance to similarity percentage
  const maxLen = Math.max(len1, len2)
  const distance = matrix[len1][len2]
  return Math.round(((maxLen - distance) / maxLen) * 100)
}

function findSkillMatches(userSkill: string, jobSkills: string[]): Array<{skill: string, similarity: number, type: string}> {
  const normalizedUser = normalizeSkill(userSkill)
  const matches = []

  for (const jobSkill of jobSkills) {
    const normalizedJob = normalizeSkill(jobSkill)
    
    // Exact match
    if (normalizedUser === normalizedJob) {
      matches.push({ skill: jobSkill, similarity: 100, type: 'exact' })
      continue
    }
    
    // Contains match
    if (normalizedUser.includes(normalizedJob) || normalizedJob.includes(normalizedUser)) {
      const similarity = Math.max(normalizedUser.length, normalizedJob.length) === Math.min(normalizedUser.length, normalizedJob.length) ? 95 : 85
      matches.push({ skill: jobSkill, similarity, type: 'contains' })
      continue
    }
    
    // String similarity match
    const similarity = calculateStringSimilarity(normalizedUser, normalizedJob)
    if (similarity >= 70) { // 70% similarity threshold
      matches.push({ skill: jobSkill, similarity, type: 'similar' })
    }
  }

  // Return best match per job skill
  return matches.sort((a, b) => b.similarity - a.similarity)
}

function calculateSkillMatch(userSkills: string[], jobSkills: string[]): { 
  matches: string[], 
  missingSkills: string[], 
  percentage: number, 
  details: Array<{jobSkill: string, userSkill?: string, similarity: number, type: string}>
} {
  const matchedJobSkills: string[] = []
  const missingSkills: string[] = []
  const details: Array<{jobSkill: string, userSkill?: string, similarity: number, type: string}> = []
  
  // For each job skill, find the best matching user skill
  for (const jobSkill of jobSkills) {
    let bestMatch: {userSkill: string, similarity: number, type: string} | null = null
    
    // Check all user skills against this job skill
    for (const userSkill of userSkills) {
      const matches = findSkillMatches(userSkill, [jobSkill])
      
      if (matches.length > 0) {
        const match = matches[0] // Best match
        if (!bestMatch || match.similarity > bestMatch.similarity) {
          bestMatch = {
            userSkill: userSkill,
            similarity: match.similarity,
            type: match.type
          }
        }
      }
    }
    
    if (bestMatch && bestMatch.similarity >= 70) {
      // Consider it a match if similarity >= 70%
      matchedJobSkills.push(jobSkill)
      details.push({
        jobSkill: jobSkill,
        userSkill: bestMatch.userSkill,
        similarity: bestMatch.similarity,
        type: bestMatch.type
      })
    } else {
      // No good match found
      missingSkills.push(jobSkill)
      details.push({
        jobSkill: jobSkill,
        similarity: bestMatch?.similarity || 0,
        type: 'missing'
      })
    }
  }
  
  const percentage = jobSkills.length > 0 ? (matchedJobSkills.length / jobSkills.length) * 100 : 0
  
  
  return { 
    matches: matchedJobSkills, 
    missingSkills, 
    percentage,
    details
  }
}

function calculateMatchScore(userProfile: UserProfile, jobData: JobData, addVariation: boolean = false): number {
  let score = 0
  let totalFactors = 0
  const debugInfo = { skills: '', experience: '', portfolio: '', rate: '' }

  // Skills match (50% weight - most important)
  const skillMatch = calculateSkillMatch(userProfile.skills, jobData.skillsRequired)
  const skillsScore = skillMatch.percentage * 0.5 // 50% weight
  score += skillsScore
  totalFactors += 50
  debugInfo.skills = `${skillMatch.matches.length}/${jobData.skillsRequired.length} matched (${Math.round(skillMatch.percentage)}%) | Missing: ${skillMatch.missingSkills.join(', ') || 'None'}`

  // Experience depth (25% weight)
  const experienceText = userProfile.experience.toLowerCase()
  let experienceScore = 0
  
  // Look for years of experience
  const yearMatch = experienceText.match(/(\d+)\+?\s*(year|yr)/i)
  if (yearMatch) {
    const years = parseInt(yearMatch[1])
    if (years >= 5) experienceScore = 25      // 5+ years = full points
    else if (years >= 3) experienceScore = 20 // 3-4 years = 80%
    else if (years >= 1) experienceScore = 15 // 1-2 years = 60%
    else experienceScore = 10                  // <1 year = 40%
  } else {
    // Look for experience keywords
    const experienceKeywords = ['experience', 'project', 'client', 'development', 'work', 'built', 'created']
    const keywordCount = experienceKeywords.filter(keyword => experienceText.includes(keyword)).length
    experienceScore = Math.min(25, keywordCount * 4) // Max 25 points
  }
  
  score += experienceScore
  totalFactors += 25
  debugInfo.experience = `Experience score: ${experienceScore}/25`

  // Portfolio relevance (15% weight)
  const portfolioScore = userProfile.portfolio.length > 3 ? 15 : userProfile.portfolio.length * 4
  score += portfolioScore
  totalFactors += 15
  debugInfo.portfolio = `Portfolio: ${userProfile.portfolio.length} items (${portfolioScore}/15)`

  // Rate competitiveness (10% weight)
  let rateScore = 10 // Default full points
  
  // Extract budget numbers for comparison
  const budgetNumbers = jobData.budget.match(/\d+/g)
  if (budgetNumbers && budgetNumbers.length > 0) {
    const clientMaxBudget = Math.max(...budgetNumbers.map(n => parseInt(n)))
    
    if (jobData.budget.toLowerCase().includes('/hour')) {
      // Hourly rate comparison
      if (userProfile.hourlyRate <= clientMaxBudget) rateScore = 10        // Within budget = full points
      else if (userProfile.hourlyRate <= clientMaxBudget * 1.2) rateScore = 6  // 20% over = reduced points  
      else rateScore = 2                                                   // Too expensive = minimal points
    } else {
      // Fixed/monthly budget - assume reasonable hourly conversion
      const assumedHours = jobData.budget.toLowerCase().includes('month') ? 80 : 20
      const impliedHourlyRate = clientMaxBudget / assumedHours
      
      if (userProfile.hourlyRate <= impliedHourlyRate * 1.5) rateScore = 10
      else rateScore = 5
    }
  }
  
  score += rateScore
  totalFactors += 10
  debugInfo.rate = `Rate competitiveness: ${rateScore}/10 (User: $${userProfile.hourlyRate}/hr)`

  let finalScore = Math.round((score / totalFactors) * 100)
  
  // Add slight variation for regeneration while keeping it realistic
  if (addVariation) {
    const variation = Math.floor(Math.random() * 6) - 3 // -3 to +3
    finalScore = Math.max(65, Math.min(98, finalScore + variation))
  }
  
  // Ensure realistic bounds
  finalScore = Math.max(60, Math.min(97, finalScore))
  
  
  return finalScore
}

function extractBudgetEstimate(jobBudget: string, hourlyRate: number): string {
  const budgetLower = jobBudget.toLowerCase()
  const budgetNumbers = jobBudget.match(/\d+/g)
  
  if (!budgetNumbers || budgetNumbers.length === 0) {
    return jobBudget || 'Budget to be discussed based on scope'
  }
  
  const minBudget = parseInt(budgetNumbers[0])
  const maxBudget = budgetNumbers.length > 1 ? parseInt(budgetNumbers[1]) : null
  
  // Determine budget type
  const isHourly = budgetLower.includes('/hour') || budgetLower.includes('per hour')
  const isMonthly = budgetLower.includes('/month') || budgetLower.includes('monthly')
  const isFixed = !isHourly && !isMonthly
  
  // Business Logic for Competitive Pricing
  if (isHourly) {
    if (maxBudget === null) {
      // Single rate like "$10/hour"
      if (hourlyRate > minBudget) {
        return `$${minBudget}/hour (Client offers $${minBudget}/hour - consider matching their rate)`
      } else if (hourlyRate === minBudget) {
        return `$${minBudget}/hour (Perfect match with client's budget)`
      } else {
        return `$${minBudget}/hour (You can charge up to $${minBudget}/hour)`
      }
    } else {
      // Range like "$25-50/hour"
      if (hourlyRate > maxBudget) {
        return `$${minBudget}-$${maxBudget}/hour (Suggested: $${maxBudget}/hour to be competitive)`
      } else if (hourlyRate >= minBudget && hourlyRate <= maxBudget) {
        return `$${minBudget}-$${maxBudget}/hour (Your rate: $${hourlyRate}/hour fits perfectly)`
      } else {
        const suggestedRate = Math.min(hourlyRate + 5, maxBudget)
        return `$${minBudget}-$${maxBudget}/hour (You can charge up to $${suggestedRate}/hour)`
      }
    }
  }
  
  if (isMonthly) {
    // Estimate monthly hours (typically 160 hours/month for full-time)
    const estimatedMonthlyHours = 80 // Part-time freelance assumption
    const monthlyBudget = maxBudget || minBudget
    const clientHourlyEquivalent = monthlyBudget / estimatedMonthlyHours
    
    if (hourlyRate > clientHourlyEquivalent) {
      // User too expensive - suggest working fewer hours
      const maxHours = Math.floor(monthlyBudget / hourlyRate)
      if (maxBudget) {
        return `$${minBudget}-$${maxBudget}/monthly (You can work ~${maxHours}h/month at $${hourlyRate}/hr)`
      } else {
        return `$${minBudget}/monthly (You can work ~${maxHours}h/month at $${hourlyRate}/hr)`
      }
    } else {
      // User can work full capacity
      const totalEarnings = Math.min(hourlyRate * estimatedMonthlyHours, monthlyBudget)
      const hours = Math.floor(totalEarnings / hourlyRate)
      if (maxBudget) {
        return `$${minBudget}-$${maxBudget}/monthly (~${hours}h at $${hourlyRate}/hr = $${totalEarnings})`
      } else {
        return `$${minBudget}/monthly (~${hours}h at $${hourlyRate}/hr = $${totalEarnings})`
      }
    }
  }
  
  if (isFixed) {
    // Fixed budget - estimate project hours
    const fixedBudget = maxBudget || minBudget
    const avgBudget = maxBudget ? (minBudget + maxBudget) / 2 : minBudget
    
    if (hourlyRate > 0) {
      if (hourlyRate * 10 > fixedBudget) {
        // User too expensive for reasonable hours
        const maxAffordableHours = Math.floor(fixedBudget / hourlyRate)
        const suggestedFixedPrice = Math.min(avgBudget, fixedBudget * 0.9)
        if (maxBudget) {
          return `$${minBudget}-$${maxBudget} fixed (Consider fixed price of $${suggestedFixedPrice} vs ${maxAffordableHours}h at $${hourlyRate}/hr)`
        } else {
          return `$${minBudget} fixed (Consider this fixed price vs ${maxAffordableHours}h at $${hourlyRate}/hr)`
        }
      } else {
        // User rate works for project
        const estimatedHours = Math.round(avgBudget / hourlyRate)
        if (maxBudget) {
          return `$${minBudget}-$${maxBudget} fixed (~${estimatedHours}h at $${hourlyRate}/hr = $${estimatedHours * hourlyRate})`
        } else {
          return `$${minBudget} fixed (~${estimatedHours}h at $${hourlyRate}/hr = $${estimatedHours * hourlyRate})`
        }
      }
    }
    
    if (maxBudget) {
      return `$${minBudget}-$${maxBudget} fixed project`
    } else {
      return `$${minBudget} fixed project`
    }
  }
  
  return jobBudget
}

function extractTimelineEstimate(duration: string): string {
  const durationLower = duration.toLowerCase().trim()
  
  // Extract all numbers from the string
  const numbers = duration.match(/\d+/g)
  const firstNumber = numbers ? parseInt(numbers[0]) : null
  
  // Detect constraint modifiers
  const isLessThan = durationLower.includes('less than') || durationLower.includes('under') || 
                     durationLower.includes('within') || durationLower.includes('maximum') || 
                     durationLower.includes('max') || durationLower.includes('up to')
  const isMoreThan = durationLower.includes('more than') || durationLower.includes('over') || 
                     durationLower.includes('minimum') || durationLower.includes('min') || 
                     durationLower.includes('at least')
  
  // Detect time units and convert to days for consistent calculation
  let estimatedDays = null
  
  if (durationLower.includes('hour')) {
    if (firstNumber) {
      // Convert hours to days (8 hours = 1 work day)
      estimatedDays = Math.ceil(firstNumber / 8)
    } else {
      estimatedDays = 7 // Default for unspecified hours
    }
  } else if (durationLower.includes('day')) {
    estimatedDays = firstNumber || 7
  } else if (durationLower.includes('week')) {
    estimatedDays = (firstNumber || 2) * 7
  } else if (durationLower.includes('month')) {
    estimatedDays = (firstNumber || 1) * 30
  }
  
  // Apply constraint modifiers
  if (estimatedDays !== null) {
    if (isLessThan) {
      // "Less than X" means up to 80% of X
      estimatedDays = Math.floor(estimatedDays * 0.8)
    } else if (isMoreThan) {
      // "More than X" means at least 120% of X
      estimatedDays = Math.ceil(estimatedDays * 1.2)
    }
    
    // Convert days back to human-readable format
    if (estimatedDays <= 1) {
      return '1-2 days'
    } else if (estimatedDays <= 3) {
      return '2-3 days'
    } else if (estimatedDays <= 7) {
      return `${Math.max(1, estimatedDays - 2)}-${estimatedDays + 1} days`
    } else if (estimatedDays <= 14) {
      return estimatedDays <= 10 ? '1-2 weeks' : '2 weeks'
    } else if (estimatedDays <= 30) {
      const weeks = Math.ceil(estimatedDays / 7)
      return weeks <= 3 ? `${weeks} weeks` : `${weeks}-${weeks + 1} weeks`
    } else if (estimatedDays <= 60) {
      return '4-8 weeks'
    } else {
      const months = Math.ceil(estimatedDays / 30)
      return `${months} months`
    }
  }
  
  // Fallback based on common phrases
  if (durationLower.includes('asap') || durationLower.includes('urgent') || durationLower.includes('immediately')) {
    return '1-3 days'
  } else if (durationLower.includes('quick') || durationLower.includes('fast')) {
    return '3-7 days'
  } else if (durationLower.includes('flexible')) {
    return 'Flexible timeline'
  }
  
  return duration || 'Timeline to be discussed'
}

function generateKeyPoints(userProfile: UserProfile, jobData: JobData, addVariation: boolean = false): string[] {
  const points: string[] = []
  
  // Skills alignment
  const matchingSkills = userProfile.skills.filter(skill =>
    jobData.skillsRequired.some(reqSkill =>
      skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.toLowerCase())
    )
  )
  
  if (matchingSkills.length > 0) {
    const skillVariations = [
      `Expert in ${matchingSkills.slice(0, 3).join(', ')}`,
      `Specialized in ${matchingSkills.slice(0, 3).join(', ')}`,
      `Proficient in ${matchingSkills.slice(0, 3).join(', ')}`,
      `Strong background in ${matchingSkills.slice(0, 3).join(', ')}`
    ]
    points.push(addVariation ? skillVariations[Math.floor(Math.random() * skillVariations.length)] : skillVariations[0])
  }
  
  // Experience highlight variations
  if (userProfile.experience) {
    const experienceVariations = [
      'Proven track record with similar projects',
      'Extensive experience in related projects',
      'Successfully completed similar work',
      'Strong portfolio of relevant projects'
    ]
    points.push(addVariation ? experienceVariations[Math.floor(Math.random() * experienceVariations.length)] : experienceVariations[0])
  }
  
  // Portfolio relevance
  if (userProfile.portfolio.length > 0) {
    const portfolioVariations = [
      'Relevant portfolio demonstrating expertise',
      'Portfolio showcasing similar projects',
      'Examples of successful implementations',
      'Demonstrated results in past work'
    ]
    points.push(addVariation ? portfolioVariations[Math.floor(Math.random() * portfolioVariations.length)] : portfolioVariations[0])
  }
  
  // Rate competitiveness
  if (userProfile.hourlyRate > 0) {
    const rateVariations = [
      `Competitive rate at $${userProfile.hourlyRate}/hour`,
      `Fair pricing at $${userProfile.hourlyRate}/hour`,
      `Reasonable rate of $${userProfile.hourlyRate}/hour`,
      `Cost-effective at $${userProfile.hourlyRate}/hour`
    ]
    points.push(addVariation ? rateVariations[Math.floor(Math.random() * rateVariations.length)] : rateVariations[0])
  }
  
  // Availability variations
  const availabilityVariations = [
    'Available to start immediately',
    'Ready to begin right away',
    'Can start working today',
    'Immediate availability for project'
  ]
  points.push(addVariation ? availabilityVariations[Math.floor(Math.random() * availabilityVariations.length)] : availabilityVariations[0])
  
  return points.slice(0, 4)
}

function generateFallbackProposal(userProfile: UserProfile, jobData: JobData, preferences: any): string {
  // Define target word counts
  const targetWords = {
    'short': { min: 150, max: 250 },
    'medium': { min: 250, max: 400 },
    'long': { min: 400, max: 600 }
  }
  
  const target = targetWords[preferences.length as keyof typeof targetWords] || targetWords['medium']
  const matchingSkills = userProfile.skills.filter(skill =>
    jobData.skillsRequired.some(reqSkill =>
      skill.toLowerCase().includes(reqSkill.toLowerCase()) ||
      reqSkill.toLowerCase().includes(skill.toLowerCase())
    )
  ).slice(0, 3)

  // Random variations for openings
  const openings = [
    `I've carefully reviewed your ${jobData.title} requirements and understand exactly what you need.`,
    `Your ${jobData.title} project caught my attention because it aligns perfectly with my expertise.`,
    `I noticed your ${jobData.title} posting and I'm confident I can deliver exactly what you're looking for.`,
    `After reading your ${jobData.title} requirements, I'm excited to help you achieve your goals.`
  ]

  // Extract key problems from job description with variations
  const jobLower = jobData.description.toLowerCase()
  const problemFocusOptions = []
  
  if (jobLower.includes('bug') || jobLower.includes('fix') || jobLower.includes('error')) {
    problemFocusOptions.push(
      'I specialize in debugging and fixing complex issues quickly and efficiently.',
      'I excel at identifying and resolving technical problems with minimal downtime.',
      'My expertise lies in troubleshooting and implementing lasting solutions.'
    )
  } else if (jobLower.includes('build') || jobLower.includes('develop') || jobLower.includes('create')) {
    problemFocusOptions.push(
      'I excel at building robust, scalable solutions from the ground up.',
      'I specialize in creating high-quality applications that meet business objectives.',
      'I focus on developing efficient, maintainable solutions that scale with your needs.'
    )
  } else if (jobLower.includes('improve') || jobLower.includes('optimize') || jobLower.includes('enhance')) {
    problemFocusOptions.push(
      'I focus on optimizing and enhancing existing systems for better performance.',
      'I specialize in improving application performance and user experience.',
      'I excel at refactoring and optimizing code for maximum efficiency.'
    )
  } else {
    problemFocusOptions.push(
      'I deliver high-quality solutions tailored to your specific requirements.',
      'I provide custom solutions that address your unique business challenges.',
      'I focus on creating solutions that drive real business value.'
    )
  }

  // Create job-specific approach with variations
  const approachOptions = []
  if (matchingSkills.length > 0) {
    approachOptions.push(
      `My approach using ${matchingSkills.join(', ')} will ensure:`,
      `Leveraging ${matchingSkills.join(', ')}, I'll deliver:`,
      `Using my expertise in ${matchingSkills.join(', ')}, you can expect:`
    )
  } else {
    approachOptions.push(
      'My development approach will ensure:',
      'My proven methodology delivers:',
      'You can expect:'
    )
  }

  // Random closing variations
  const closings = [
    'Would you like to discuss the specific technical challenges and my proposed solution?',
    'I\'d love to discuss how I can help you achieve your project goals.',
    'Let\'s schedule a call to discuss your requirements in detail.',
    'I\'m ready to start immediately - when can we begin?'
  ]

  const randomOpening = openings[Math.floor(Math.random() * openings.length)]
  const randomProblemFocus = problemFocusOptions[Math.floor(Math.random() * problemFocusOptions.length)]
  const randomApproach = approachOptions[Math.floor(Math.random() * approachOptions.length)]
  const randomClosing = closings[Math.floor(Math.random() * closings.length)]

  // Generate different lengths based on preferences
  if (preferences.length === 'short') {
    // SHORT: 150-250 words
    return `${randomOpening}

${randomProblemFocus}

${randomApproach}
• Clean, maintainable code
• Thorough testing
• Clear documentation
• Delivery within your ${jobData.duration} timeline

I'm available to start immediately at a competitive rate.

${randomClosing}

Best regards,
${userProfile.name}`
  } else if (preferences.length === 'long') {
    // LONG: 400-600 words
    return `${randomOpening}

${randomProblemFocus}

With my extensive background as a ${userProfile.title}, I bring deep expertise in ${matchingSkills.length > 0 ? matchingSkills.join(', ') : userProfile.skills.slice(0, 3).join(', ')}. Over the years, I have successfully completed numerous projects similar to yours, consistently delivering high-quality results that exceed client expectations.

${randomApproach}
• Clean, maintainable code that follows industry best practices
• Comprehensive testing strategy to prevent future issues
• Clear documentation for easy maintenance and scalability  
• Regular progress updates and transparent communication
• Delivery within your specified ${jobData.duration} timeline
• Post-launch support to ensure smooth operation

What sets me apart is my commitment to understanding your specific business needs and translating them into effective technical solutions. My experience includes ${userProfile.experience.split('.')[0]}. I take pride in my attention to detail and my ability to work collaboratively with clients throughout the development process.

My approach involves thorough planning, iterative development, and continuous feedback to ensure the final product aligns perfectly with your vision. I understand the importance of meeting deadlines and staying within budget while never compromising on quality.

I'm available to start immediately at $${userProfile.hourlyRate}/hour and can deliver the quality results you're looking for. I would welcome the opportunity to discuss your project requirements in detail and provide you with a customized solution that meets your specific needs.

${randomClosing}

Looking forward to the opportunity to contribute to your project's success.

Best regards,
${userProfile.name}
${userProfile.title}`
  } else {
    // MEDIUM: 250-400 words (default)
    return `${randomOpening}

${randomProblemFocus}

${randomApproach}
• Clean, maintainable code that follows best practices
• Comprehensive testing to prevent future issues
• Clear documentation and progress updates
• Delivery within your ${jobData.duration} timeline

What sets me apart:
${userProfile.experience.split('.')[0]}. My expertise in ${matchingSkills.length > 0 ? matchingSkills.join(', ') : userProfile.skills.slice(0, 3).join(', ')} enables me to deliver solutions that are both technically sound and business-focused.

I understand the importance of clear communication throughout the development process and will keep you updated on progress every step of the way. My goal is to not just meet your requirements, but to exceed your expectations and deliver a solution that drives real value for your business.

I'm available to start immediately at $${userProfile.hourlyRate}/hour and can deliver the quality results you're looking for.

${randomClosing}

Best regards,
${userProfile.name}
${userProfile.title}`
  }
}