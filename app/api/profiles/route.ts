import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Profile from '../../../models/Profile'
import { verifyToken } from '../../../lib/auth'

// Get all profiles for the authenticated user
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const profiles = await Profile.find({ userId: payload.userId }).sort({ updatedAt: -1 })

    // If no profile is active and profiles exist, make the first one active
    if (profiles.length > 0 && !profiles.some(p => p.isActive)) {
      profiles[0].isActive = true
      await profiles[0].save()
    }

    // Format profiles to have consistent id field
    const formattedProfiles = profiles.map(profile => ({
      id: profile._id.toString(),
      name: profile.name,
      title: profile.title,
      skills: profile.skills,
      experience: profile.experience,
      portfolio: profile.portfolio,
      hourlyRate: profile.hourlyRate,
      bio: profile.bio,
      specializations: profile.specializations,
      isActive: profile.isActive
    }))

    return NextResponse.json({ profiles: formattedProfiles })

  } catch (error) {
    console.error('Get profiles error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Create a new profile
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const token = request.cookies.get('auth-token')?.value
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const {
      name,
      title,
      skills,
      experience,
      portfolio,
      hourlyRate,
      bio,
      specializations,
      isActive
    } = await request.json()

    // Validation
    if (!name || !title || !experience || hourlyRate < 0) {
      return NextResponse.json(
        { error: 'Name, title, experience, and hourly rate are required' },
        { status: 400 }
      )
    }

    const profile = new Profile({
      userId: payload.userId,
      name,
      title,
      skills: skills || [],
      experience,
      portfolio: portfolio || [],
      hourlyRate,
      bio: bio || '',
      specializations: specializations || [],
      isActive: isActive || false
    })

    await profile.save()

    return NextResponse.json({ 
      success: true, 
      profile: {
        id: profile._id,
        name: profile.name,
        title: profile.title,
        skills: profile.skills,
        experience: profile.experience,
        portfolio: profile.portfolio,
        hourlyRate: profile.hourlyRate,
        bio: profile.bio,
        specializations: profile.specializations,
        isActive: profile.isActive
      }
    })

  } catch (error) {
    console.error('Create profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}