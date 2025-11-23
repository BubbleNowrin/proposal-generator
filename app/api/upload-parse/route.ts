import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = await import('pdf-parse')
    const data = await pdfParse.default(buffer)
    console.log('PDF text extracted, length:', data.text.length)
    return data.text || ''
  } catch (error) {
    console.error('PDF parsing error:', error)
    // Fallback: suggest user to convert to text or Word
    throw new Error('Could not extract text from PDF. Please try converting to Word document (.docx) or copy the text to a .txt file for better results.')
  }
}

async function extractTextFromDocx(filePath: string): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ path: filePath })
    return result.value || ''
  } catch (error) {
    console.error('Word document parsing error:', error)
    return ''
  }
}

async function extractTextFromImage(filePath: string): Promise<string> {
  try {
    const { createWorker } = await import('tesseract.js')
    
    // Create worker with multiple languages for better recognition
    const worker = await createWorker(['eng'], 1, {
      logger: m => console.log('OCR:', m.status, m.progress)
    })
    
    // Configure Tesseract for better text recognition
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-+()/$%#:,;!? \n',
      tessedit_pageseg_mode: '1', // Auto page segmentation with OSD
      preserve_interword_spaces: '1'
    })
    
    const { data: { text, confidence } } = await worker.recognize(filePath)
    await worker.terminate()
    
    console.log(`OCR completed with confidence: ${confidence}%`)
    
    if (confidence < 30) {
      console.warn('Low OCR confidence, results may be inaccurate')
    }
    
    // Clean up common OCR errors
    const cleanedText = text
      .replace(/[|]/g, 'I') // Common misrecognition
      .replace(/(?:^|\n)\s*\n/g, '\n') // Remove extra blank lines
      .replace(/(.)\1{4,}/g, '$1') // Remove repeated characters (4+ times)
      .trim()
    
    return cleanedText || ''
  } catch (error) {
    console.error('OCR parsing error:', error)
    throw new Error('Could not extract text from image. Please ensure the image has clear, readable text or try uploading a Word document instead.')
  }
}

async function extractTextFromFile(filePath: string, mimeType: string, buffer?: Buffer): Promise<string> {
  try {
    switch (mimeType) {
      case 'text/plain':
        return fs.readFileSync(filePath, 'utf-8')
      
      case 'application/pdf':
        if (!buffer) {
          buffer = fs.readFileSync(filePath)
        }
        return await extractTextFromPDF(buffer)
      
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        return await extractTextFromDocx(filePath)
      
      case 'application/rtf':
      case 'text/rtf':
        // RTF files can often be read as plain text with some formatting noise
        const rtfContent = fs.readFileSync(filePath, 'utf-8')
        // Basic RTF cleanup - remove RTF control codes
        return rtfContent.replace(/\\[a-z]+\d*\s*/g, ' ').replace(/[{}]/g, '').trim()
      
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
      case 'image/gif':
      case 'image/bmp':
      case 'image/webp':
        return await extractTextFromImage(filePath)
      
      default:
        console.warn('Unsupported file type:', mimeType)
        throw new Error(`File type ${mimeType} is not supported. Please use: PDF, Word docs (.docx), text files (.txt), or images (JPG, PNG, GIF, BMP, WebP)`)
    }
  } catch (error) {
    console.error('Text extraction failed:', error)
    throw error // Re-throw to preserve specific error messages
  }
}

function parseProfileFromText(text: string): any {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Enhanced patterns for extracting profile information
  const emailPattern = /[\w.-]+@[\w.-]+\.\w{2,}/g
  const phonePattern = /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}|\+[0-9]{1,3}[-.\s]?[0-9]{4,14}/g
  const urlPattern = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
  const linkedinPattern = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[^\s<>"{}|\\^`[\]]+/gi
  
  const emails = text.match(emailPattern) || []
  const phones = text.match(phonePattern) || []
  const urls = text.match(urlPattern) || []
  const linkedinUrls = text.match(linkedinPattern) || []
  
  // Enhanced name extraction with multiple patterns
  let name = ''
  const namePatterns = [
    /(?:Name|Full Name|Contact)[\s:]+([^\n]+)/i,
    /^([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*$/m, // First Middle Last pattern
    /^([A-Z][a-z]+(?:\s[A-Z]\.?\s*)?[A-Z][a-z]+)\s*$/m   // First M. Last pattern
  ]
  
  for (const pattern of namePatterns) {
    const match = text.match(pattern)
    if (match && match[1].length > 3 && match[1].length < 50) {
      name = match[1].trim()
      break
    }
  }
  
  // If no name found, try first substantial line
  if (!name && lines.length > 0) {
    name = lines.find(line => 
      line.length > 3 && line.length < 50 && 
      !line.includes('@') && !line.includes('http') && 
      !line.includes('$') && !line.toLowerCase().includes('resume')
    )?.trim() || ''
  }
  
  // Enhanced title/role extraction
  const titleKeywords = [
    'developer', 'engineer', 'designer', 'manager', 'consultant', 'specialist', 'analyst',
    'architect', 'lead', 'senior', 'junior', 'principal', 'director', 'coordinator',
    'programmer', 'scientist', 'researcher', 'administrator', 'technician'
  ]
  
  let title = ''
  const titlePatterns = [
    /(?:Title|Position|Role|Job Title)[\s:]+([^\n]+)/i,
    new RegExp(`^.*(?:${titleKeywords.join('|')}).*$`, 'im')
  ]
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      title = match[1].trim()
      break
    } else if (match && match[0]) {
      title = match[0].trim()
      break
    }
  }
  
  // Enhanced skills extraction with better patterns
  let skills: string[] = []
  
  const skillsSectionPatterns = [
    /(?:Technical\s+Skills?|Skills?|Technologies?|Expertise|Programming|Languages?)[\s:]*(.+?)(?:\n\s*(?:[A-Z][a-z]+\s*:|\n)|$)/is,
    /(?:Proficient\s+(?:in|with)|Experienced\s+(?:in|with))[\s:]*(.+?)(?:\n\s*[A-Z]|\n\n|$)/is,
    /(?:Tools?|Frameworks?|Libraries?)[\s:]*(.+?)(?:\n\s*[A-Z]|\n\n|$)/is
  ]
  
  for (const pattern of skillsSectionPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      const skillsText = match[1]
      const extractedSkills = skillsText
        .split(/[,;|\n•–—]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50)
        .map(skill => skill.replace(/^[•\-\*\+]\s*/, ''))
        .map(skill => skill.replace(/\([^)]*\)/g, '').trim()) // Remove parenthetical info
      skills.push(...extractedSkills)
    }
  }
  
  // Comprehensive technology detection
  const technologies = [
    // Frontend
    'HTML', 'HTML5', 'CSS', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Angular', 'Vue.js', 'Svelte',
    'jQuery', 'Bootstrap', 'Tailwind CSS', 'Material UI', 'SASS', 'SCSS', 'LESS',
    // Backend
    'Node.js', 'Express.js', 'Python', 'Django', 'Flask', 'FastAPI', 'Java', 'Spring', 'PHP', 'Laravel',
    'Ruby', 'Ruby on Rails', 'C#', '.NET', 'ASP.NET', 'Go', 'Rust', 'C++', 'C',
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'SQLite', 'Redis', 'Elasticsearch', 'DynamoDB', 'Oracle',
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
    'CI/CD', 'Linux', 'Ubuntu', 'CentOS', 'Nginx', 'Apache',
    // Mobile
    'React Native', 'Flutter', 'iOS', 'Android', 'Swift', 'Kotlin', 'Xamarin',
    // Tools
    'Webpack', 'Vite', 'npm', 'yarn', 'VS Code', 'IntelliJ', 'Eclipse', 'Postman', 'Figma', 'Adobe XD'
  ]
  
  const foundTech = technologies.filter(tech => 
    new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  )
  
  skills.push(...foundTech)
  
  // Remove duplicates and clean up
  skills = [...new Set(skills)]
    .filter(skill => skill.length > 1 && skill.length < 50)
    .map(skill => skill.replace(/^(and|or|with)\s+/i, ''))
    .filter(skill => skill.length > 1)
  
  // Enhanced experience extraction
  const experiencePatterns = [
    /(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)/i,
    /(?:experience|exp)[\s:]*(\d+)\+?\s*years?/i,
    /(\d+)\+?\s*yrs?\s*(?:experience|exp)/i
  ]
  
  let experienceYears = ''
  for (const pattern of experiencePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      experienceYears = match[1]
      break
    }
  }
  
  // Enhanced rate extraction
  const ratePatterns = [
    /\$(\d+(?:,\d{3})*)\s*(?:\/hr|\/hour|per hour|hourly)/i,
    /(?:rate|hourly)[\s:]*\$(\d+(?:,\d{3})*)/i,
    /(\d+(?:,\d{3})*)\s*\$\s*(?:\/hr|\/hour|per hour)/i
  ]
  
  let hourlyRate = 0
  for (const pattern of ratePatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      hourlyRate = parseInt(match[1].replace(/,/g, ''))
      break
    }
  }
  
  // Extract bio/summary
  const bioPatterns = [
    /(?:Summary|About|Bio|Profile|Overview)[\s:]+(.+?)(?:\n\s*[A-Z][a-z]+\s*:|$)/is,
    /(?:^|\n)([^:\n]{100,500})(?:\n|$)/s // Long paragraphs likely to be descriptions
  ]
  
  let bio = ''
  for (const pattern of bioPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 50) {
      bio = match[1].trim()
      break
    }
  }
  
  // Extract specializations
  const specializationPatterns = [
    /(?:Specializ(?:ation|es?)|Focus|Expertise)[\s:]+(.+?)(?:\n\s*[A-Z]|\n\n|$)/is
  ]
  
  let specializations: string[] = []
  for (const pattern of specializationPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      specializations = match[1]
        .split(/[,;|\n]/)
        .map(spec => spec.trim())
        .filter(spec => spec.length > 2)
    }
  }
  
  return {
    name: name.length > 2 ? name : '',
    title: title.length > 2 ? title : '',
    skills,
    experience: experienceYears ? `${experienceYears} years of professional experience` : '',
    portfolio: urls.filter(url => !url.toLowerCase().includes('linkedin') && !url.includes('@')),
    hourlyRate,
    bio: bio.length > 20 ? bio : '',
    specializations,
    contact: {
      email: emails[0] || '',
      phone: phones[0] || '',
      linkedin: linkedinUrls[0] || urls.find(url => url.toLowerCase().includes('linkedin')) || ''
    }
  }
}

function parseJobFromText(text: string): any {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Enhanced job title extraction
  let title = ''
  const titlePatterns = [
    /(?:Job Title|Position|Role)[\s:]+([^\n]+)/i,
    /^([^$\n]{10,80})$/m, // Lines without $ that could be titles
    /(?:Looking for|Need|Seeking|Hiring)[\s:]+([^\n]+)/i
  ]
  
  for (const pattern of titlePatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 5 && match[1].trim().length < 100) {
      title = match[1].trim()
      break
    }
  }
  
  // If no title found with patterns, use first substantial line
  if (!title) {
    title = lines.find(line => 
      line.length > 10 && line.length < 100 && 
      !line.includes('$') && !line.toLowerCase().includes('posted') &&
      !line.toLowerCase().includes('proposals') && !line.toLowerCase().includes('budget')
    )?.trim() || ''
  }
  
  // Enhanced budget extraction
  const budgetPatterns = [
    /Budget[\s:]*\$?([\d,]+-?(?:\$?[\d,]+)?)/i,
    /\$?([\d,]+)-?\$?([\d,]+)?(?:\s*(?:per|\/)\s*(?:hour|hr|project))?/i,
    /(?:Rate|Pay|Compensation)[\s:]*\$?([\d,]+(?:-[\d,]+)?)/i,
    /(\d+)-?(\d+)?\s*(?:USD|dollars?)/i
  ]
  
  let budget = ''
  for (const pattern of budgetPatterns) {
    const match = text.match(pattern)
    if (match) {
      if (match[2]) {
        budget = `$${match[1]}-$${match[2]}`
      } else {
        budget = `$${match[1]}`
      }
      break
    }
  }
  
  // Enhanced skills extraction
  const skillsSectionPatterns = [
    /(?:Skills?|Technologies?|Requirements?|Must\s+have|Looking\s+for)[\s:]+(.+?)(?:\n\s*(?:[A-Z][a-z]+\s*:|\n)|$)/is,
    /(?:Experience\s+(?:in|with)|Proficient\s+(?:in|with))[\s:]+(.+?)(?:\n\s*[A-Z]|\n\n|$)/is,
    /(?:Need|Want|Require)[\s:]+someone\s+(?:with|who\s+knows?)[\s:]*(.+?)(?:\n\s*[A-Z]|\n\n|$)/is
  ]
  
  let skills: string[] = []
  for (const pattern of skillsSectionPatterns) {
    const skillsMatch = text.match(pattern)
    if (skillsMatch && skillsMatch[1]) {
      const extractedSkills = skillsMatch[1]
        .split(/[,;|\n•–—]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && skill.length < 50)
        .map(skill => skill.replace(/^[•\-\*\+]\s*/, ''))
        .map(skill => skill.replace(/\([^)]*\)/g, '').trim())
      skills.push(...extractedSkills)
    }
  }
  
  // Also detect common technologies mentioned in the description
  const commonTechs = [
    'HTML', 'CSS', 'JavaScript', 'React', 'Angular', 'Vue.js', 'Node.js', 'Python', 'PHP', 'Java',
    'WordPress', 'Shopify', 'Magento', 'Laravel', 'Django', 'MySQL', 'MongoDB', 'AWS', 'Docker',
    'TypeScript', 'Next.js', 'Express.js', 'Bootstrap', 'Tailwind', 'Firebase', 'PostgreSQL'
  ]
  
  const foundTechs = commonTechs.filter(tech => 
    new RegExp(`\\b${tech.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)
  )
  
  skills.push(...foundTechs)
  skills = [...new Set(skills)].filter(skill => skill.length > 1)
  
  // Enhanced duration/timeline extraction
  const durationPatterns = [
    /(?:Duration|Timeline|Deadline|Complete\s+by|Timeframe)[\s:]+(.+?)(?:\n|\.|$)/i,
    /(?:Need\s+it|Want\s+it|Complete)[\s:]+(?:by|in|within)[\s:]+(.+?)(?:\n|\.|$)/i,
    /(\d+\s*(?:days?|weeks?|months?|hours?))(?:\s+(?:to\s+complete|deadline|timeframe))?/i
  ]
  
  let duration = ''
  for (const pattern of durationPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 2 && match[1].trim().length < 50) {
      duration = match[1].trim()
      break
    }
  }
  
  // Extract project description/details
  const descriptionPatterns = [
    /(?:Description|Details?|About\s+(?:this\s+)?(?:project|job))[\s:]+(.+?)(?:\n\s*(?:[A-Z][a-z]+\s*:|\n)|$)/is,
    /(?:I\s+need|We\s+need|Looking\s+for|Project\s+involves?)[\s:]*(.+?)(?:\n\s*(?:Budget|Timeline|Skills?)|\n\n|$)/is
  ]
  
  let projectDescription = text.substring(0, 500) // Default to first 500 chars
  for (const pattern of descriptionPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 50) {
      projectDescription = match[1].trim()
      break
    }
  }
  
  // Extract additional details
  const proposalsPattern = /(\d+)\s*(?:proposals?|applicants?|responses?)/i
  const proposalsMatch = text.match(proposalsPattern)
  const proposalsCount = proposalsMatch ? proposalsMatch[1] : 'Unknown'
  
  const ratingPatterns = [
    /(\d\.?\d?)\s*(?:stars?|\/5|\*)/i,
    /(?:rating|rated)[\s:]*(\d\.?\d?)/i
  ]
  
  let clientRating = 'N/A'
  for (const pattern of ratingPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      clientRating = match[1]
      break
    }
  }
  
  // Extract client spending info
  const spentPatterns = [
    /\$?([\d,k]+)\+?\s*(?:spent|total\s+spent)/i,
    /(?:spent|total)[\s:]*\$?([\d,k]+)/i
  ]
  
  let totalSpent = 'N/A'
  for (const pattern of spentPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      totalSpent = `$${match[1]}`
      break
    }
  }
  
  // Extract location
  const locationPatterns = [
    /(?:Location|Country|Region)[\s:]+([^\n]+)/i,
    /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)*(?:,\s*[A-Z]{2,3})?)\b/g // City, State pattern
  ]
  
  let location = 'N/A'
  for (const pattern of locationPatterns) {
    const match = text.match(pattern)
    if (match && match[1] && match[1].trim().length > 2 && match[1].trim().length < 30) {
      location = match[1].trim()
      break
    }
  }
  
  // Extract posted time
  const postedPatterns = [
    /(?:Posted|Published)[\s:]*(.+?)(?:ago|\n|$)/i,
    /(\d+\s*(?:minutes?|hours?|days?|weeks?)\s*ago)/i
  ]
  
  let postedTime = 'Recently'
  for (const pattern of postedPatterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      postedTime = match[1].trim()
      break
    }
  }
  
  return {
    title: title || 'Untitled Project',
    description: projectDescription,
    budget: budget || 'Budget not specified',
    duration: duration || 'Timeline not specified',
    skillsRequired: skills,
    clientInfo: {
      rating: clientRating,
      totalSpent: totalSpent,
      location: location
    },
    postedTime,
    proposalsCount,
    url: 'uploaded-document',
    extractedText: text.length > 1000 ? text.substring(0, 1000) + '...' : text
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string || 'profile'
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Create temporary file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create temp directory if it doesn't exist
    const tempDir = path.join(process.cwd(), 'tmp')
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }
    
    const tempFilePath = path.join(tempDir, `upload_${Date.now()}_${file.name}`)
    console.log('Writing file to:', tempFilePath)
    await writeFile(tempFilePath, buffer)
    
    // Verify file was written
    if (!fs.existsSync(tempFilePath)) {
      console.error('Failed to write temp file to:', tempFilePath)
      throw new Error('Failed to create temporary file')
    }
    
    console.log('File written successfully, size:', fs.statSync(tempFilePath).size)
    
    // Extract text from file
    const extractedText = await extractTextFromFile(tempFilePath, file.type, buffer)
    
    // Clean up temporary file
    fs.unlinkSync(tempFilePath)
    
    // Check if we got any text
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({
        error: 'Could not extract text from the file. Please try a different file or enter the information manually.',
        success: false
      }, { status: 400 })
    }
    
    // Parse the extracted text based on type
    let parsedData
    if (uploadType === 'profile') {
      parsedData = parseProfileFromText(extractedText)
    } else {
      parsedData = parseJobFromText(extractedText)
    }
    
    return NextResponse.json({
      success: true,
      extractedText: extractedText.length > 500 ? extractedText.substring(0, 500) + '...' : extractedText,
      parsedData,
      type: uploadType
    })
    
  } catch (error) {
    console.error('Upload processing error:', error)
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    )
  }
}