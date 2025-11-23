import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Post from '../../../../models/Post'
import Comment from '../../../../models/Comment'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    const post = await Post.findById(params.id).lean()
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    // Increment view count
    await Post.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    
    // Get comments for this post
    const comments = await Comment.find({ postId: params.id })
      .sort({ createdAt: 1 })
      .lean()
    
    // Calculate vote scores
    const postWithScore = {
      ...post,
      voteScore: (post.votes?.up?.length || 0) - (post.votes?.down?.length || 0)
    }
    
    const commentsWithScores = comments.map(comment => ({
      ...comment,
      voteScore: (comment.votes?.up?.length || 0) - (comment.votes?.down?.length || 0)
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        post: postWithScore,
        comments: commentsWithScores
      }
    })
    
  } catch (error) {
    console.error('Error fetching post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch post' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    const data = await request.json()
    const { action, userId } = data
    
    if (action === 'vote') {
      const { voteType } = data // 'up' or 'down'
      
      const post = await Post.findById(params.id)
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        )
      }
      
      // Remove user from both arrays first
      post.votes.up = post.votes.up.filter((id: string) => id !== userId)
      post.votes.down = post.votes.down.filter((id: string) => id !== userId)
      
      // Add to appropriate array
      if (voteType === 'up') {
        post.votes.up.push(userId)
      } else if (voteType === 'down') {
        post.votes.down.push(userId)
      }
      
      await post.save()
      
      return NextResponse.json({
        success: true,
        data: {
          voteScore: post.votes.up.length - post.votes.down.length
        }
      })
    }
    
    if (action === 'resolve') {
      await Post.findByIdAndUpdate(params.id, { isResolved: true })
      
      return NextResponse.json({
        success: true,
        message: 'Post marked as resolved'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Failed to update post' },
      { status: 500 }
    )
  }
}