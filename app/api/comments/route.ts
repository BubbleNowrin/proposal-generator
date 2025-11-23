import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../lib/mongodb'
import Comment from '../../../models/Comment'
import Post from '../../../models/Post'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const data = await request.json()
    const { postId, content, images, authorName, authorType, authorId, parentCommentId } = data
    
    // Validate required fields
    if (!postId || !content || !authorName || !authorType) {
      return NextResponse.json(
        { error: 'Post ID, content, author name, and author type are required' },
        { status: 400 }
      )
    }
    
    // Check if post exists
    const post = await Post.findById(postId)
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }
    
    const newComment = new Comment({
      postId,
      content,
      images: images || [],
      authorId,
      authorName,
      authorType,
      parentCommentId,
      votes: { up: [], down: [] },
      isAccepted: false
    })
    
    await newComment.save()
    
    // Update comment count on post
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } })
    
    // Save user activity if user is logged in
    if (authorId) {
      try {
        const UserActivity = require('../../../models/UserActivity').default
        await new UserActivity({
          userId: authorId,
          activityType: 'comment_created',
          targetType: 'comment',
          targetId: newComment._id.toString(),
          metadata: {
            commentContent: content.substring(0, 100) + '...',
            postTitle: post.title
          }
        }).save()
      } catch (activityError) {
        console.error('Error saving user activity:', activityError)
        // Don't fail the comment creation if activity logging fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: newComment
    })
    
  } catch (error) {
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}