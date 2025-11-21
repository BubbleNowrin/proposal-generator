import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Profile from '../../../../models/Profile'
import { verifyToken } from '../../../../lib/auth'

// Update a profile
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const updateData = await request.json()

    // Find profile and verify ownership
    const profile = await Profile.findOne({ _id: profileId, userId: payload.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update profile
    Object.assign(profile, updateData)
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
    console.error('Update profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Delete a profile
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Find and delete profile
    const profile = await Profile.findOneAndDelete({ _id: profileId, userId: payload.userId })
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Delete profile error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}