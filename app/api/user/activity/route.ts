import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import UserActivity from '../../../../models/UserActivity'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '20')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const activities = await UserActivity.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()

    return NextResponse.json({
      success: true,
      data: {
        activities,
        totalActivities: activities.length
      }
    })

  } catch (error) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user activity' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const activityData = await request.json()
    
    const newActivity = new UserActivity(activityData)
    await newActivity.save()

    return NextResponse.json({
      success: true,
      data: newActivity
    })

  } catch (error) {
    console.error('Error saving user activity:', error)
    return NextResponse.json(
      { error: 'Failed to save user activity' },
      { status: 500 }
    )
  }
}