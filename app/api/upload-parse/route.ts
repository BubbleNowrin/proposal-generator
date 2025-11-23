import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // For now, skip PDF text extraction due to library issues
    // Return empty to let user know PDFs need manual entry
    console.log('PDF processing skipped - please convert to Word doc or copy text to .txt file')
    return ''
  } catch (error) {
    console.error('PDF parsing error:', error)
    return ''
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
    const worker = await createWorker('eng')
    const { data: { text } } = await worker.recognize(filePath)
    await worker.terminate()
    return text || ''
  } catch (error) {
    console.error('OCR parsing error:', error)
    return ''
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
      
      case 'image/jpeg':
      case 'image/jpg':
      case 'image/png':
        return await extractTextFromImage(filePath)
      
      default:
        console.warn('Unsupported file type:', mimeType)
        return ''
    }
  } catch (error) {
    console.error('Text extraction failed:', error)
    return ''
  }
}

function parseProfileFromText(text: string): any {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Common patterns for extracting profile information
  const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g
  const phonePattern = /[\+]?[\d\s\(\)\-]{10,}/g
  const urlPattern = /https?:\/\/[^\s]+/g
  
  const emails = text.match(emailPattern) || []
  const phones = text.match(phonePattern) || []
  const urls = text.match(urlPattern) || []
  
  // Extract name (usually first line or after "Name:")
  let name = ''
  const nameMatch = text.match(/(?:Name|Full Name)[\s:]+(.+)/i)
  if (nameMatch) {
    name = nameMatch[1].trim()
  } else if (lines.length > 0) {
    // Take first substantial line as name
    name = lines.find(line => line.length > 2 && !line.includes('@') && !line.includes('http'))?.trim() || ''
  }
  
  // Extract title/role
  const titleKeywords = ['developer', 'engineer', 'designer', 'manager', 'consultant', 'specialist', 'analyst']
  const title = lines.find(line => 
    titleKeywords.some(keyword => line.toLowerCase().includes(keyword))
  )?.trim() || ''
  
  // Extract skills (look for technical skills patterns)
  let skills: string[] = []
  
  // Look for skills section with multiple patterns
  const skillsSectionPatterns = [
    /(?:Technical\s+Skills|Skills|Technologies|Expertise)[\s:]*(.+?)(?:\n\s*[A-Z]|\n\n|Interpersonal|Education|Experience|$)/is,
    /(?:Expertise)[\s:]*(.+?)(?:\n\s*Comfortable|\n\n|$)/is,
    /(?:Comfortable)[\s:]*(.+?)(?:\n\s*Tools|\n\n|$)/is
  ]
  
  for (const pattern of skillsSectionPatterns) {
    const match = text.match(pattern)
    if (match) {
      const skillsText = match[1]
      const extractedSkills = skillsText
        .split(/[,;|\n]/)
        .map(skill => skill.trim())
        .filter(skill => skill.length > 1 && !skill.match(/^\s*$/))
        .map(skill => skill.replace(/^[•\-\*]\s*/, '')) // Remove bullet points
      skills.push(...extractedSkills)
    }
  }
  
  // Also look for common web technologies mentioned anywhere in the text
  const webTechnologies = [
    'HTML5', 'CSS3', 'JavaScript', 'React', 'Node.js', 'Express.js', 'MongoDB', 
    'Bootstrap', 'Tailwind CSS', 'ES6', 'Firebase', 'TypeScript', 'Next.js',
    'Vue.js', 'Angular', 'PostgreSQL', 'MySQL', 'AWS', 'Git', 'GitHub'
  ]
  
  const foundTech = webTechnologies.filter(tech => 
    text.toLowerCase().includes(tech.toLowerCase())
  )
  
  skills.push(...foundTech)
  
  // Remove duplicates and clean up
  skills = [...new Set(skills)].filter(skill => skill.length > 1)
  
  // Extract experience (look for years of experience)
  const experienceMatch = text.match(/(\d+)\+?\s*years?\s*(?:of\s*)?experience/i)
  const experienceYears = experienceMatch ? experienceMatch[1] : ''
  
  // Extract hourly rate
  const rateMatch = text.match(/\$(\d+)(?:\/hr|\/hour| per hour)/i)
  const hourlyRate = rateMatch ? parseInt(rateMatch[1]) : 0
  
  return {
    name,
    title,
    skills,
    experience: `${experienceYears ? experienceYears + ' years of ' : ''}professional experience`,
    portfolio: urls.filter(url => !url.includes('linkedin') && !url.includes('email')),
    hourlyRate,
    bio: '', // Will be filled from a longer description if found
    specializations: [],
    contact: {
      email: emails[0] || '',
      phone: phones[0] || '',
      linkedin: urls.find(url => url.includes('linkedin')) || ''
    }
  }
}

function parseJobFromText(text: string): any {
  const lines = text.split('\n').filter(line => line.trim())
  
  // Extract job title (usually first substantial line)
  const title = lines.find(line => line.length > 10 && !line.includes('$') && !line.includes('Posted'))?.trim() || ''
  
  // Extract budget
  const budgetPattern = /\$[\d,]+-?\$?[\d,]*|Budget:?\s*\$?[\d,]+/i
  const budgetMatch = text.match(budgetPattern)
  const budget = budgetMatch ? budgetMatch[0] : ''
  
  // Extract skills
  const skillsPattern = /(?:Skills?|Technologies?|Requirements?)[\s:]+(.+?)(?:\n\n|\n[A-Z]|$)/is
  let skills: string[] = []
  const skillsMatch = text.match(skillsPattern)
  if (skillsMatch) {
    skills = skillsMatch[1]
      .split(/[,;|\n]/)
      .map(skill => skill.trim())
      .filter(skill => skill.length > 1)
  }
  
  // Extract duration/deadline
  const durationPattern = /(?:Duration|Timeline|Deadline)[\s:]+(.+?)(?:\n|\.|$)/i
  const durationMatch = text.match(durationPattern)
  const duration = durationMatch ? durationMatch[1].trim() : ''
  
  // Extract proposals count
  const proposalsPattern = /(\d+)\s*proposals?/i
  const proposalsMatch = text.match(proposalsPattern)
  const proposalsCount = proposalsMatch ? proposalsMatch[1] : ''
  
  // Extract client rating
  const ratingPattern = /(\d\.?\d?)\s*(?:stars?|\/5)/i
  const ratingMatch = text.match(ratingPattern)
  const clientRating = ratingMatch ? ratingMatch[1] : ''
  
  return {
    title,
    description: text,
    budget,
    duration,
    skillsRequired: skills,
    clientInfo: {
      rating: clientRating || 'N/A',
      totalSpent: 'N/A',
      location: 'N/A'
    },
    postedTime: 'Recently',
    proposalsCount: proposalsCount || 'Unknown',
    url: 'uploaded-document'
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