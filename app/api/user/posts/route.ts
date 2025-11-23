import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Post from '../../../../models/Post'

export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const posts = await Post.find({ authorId: userId })
      .sort({ createdAt: -1 })
      .lean()

    // Add vote scores
    const postsWithScores = posts.map(post => ({
      ...post,
      voteScore: (post.votes?.up?.length || 0) - (post.votes?.down?.length || 0)
    }))

    return NextResponse.json({
      success: true,
      data: {
        posts: postsWithScores,
        totalPosts: posts.length
      }
    })

  } catch (error) {
    console.error('Error fetching user posts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user posts' },
      { status: 500 }
    )
  }
}