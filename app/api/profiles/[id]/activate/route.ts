import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../../lib/mongodb'
import Profile from '../../../../../models/Profile'
import { verifyToken } from '../../../../../lib/auth'

// Activate a profile (deactivates others)
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const profileId = params.id

    // Find profile and verify ownership
    const profile = await Profile.findOne({ _id: profileId, userId: payload.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Deactivate all other profiles for this user
    await Profile.updateMany(
      { userId: payload.userId, _id: { $ne: profileId } },
      { isActive: false }
    )

    // Activate this profile
    profile.isActive = true
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
    console.error('Activate profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}