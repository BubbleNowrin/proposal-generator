import { NextRequest, NextResponse } from 'next/server'
import connectDB from '../../../../lib/mongodb'
import Comment from '../../../../models/Comment'

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()
    
    const data = await request.json()
    const { action, userId } = data
    
    if (action === 'vote') {
      const { voteType } = data // 'up' or 'down'
      
      const comment = await Comment.findById(params.id)
      if (!comment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        )
      }
      
      // Remove user from both arrays first
      comment.votes.up = comment.votes.up.filter(id => id !== userId)
      comment.votes.down = comment.votes.down.filter(id => id !== userId)
      
      // Add to appropriate array
      if (voteType === 'up') {
        comment.votes.up.push(userId)
      } else if (voteType === 'down') {
        comment.votes.down.push(userId)
      }
      
      await comment.save()
      
      return NextResponse.json({
        success: true,
        data: {
          voteScore: comment.votes.up.length - comment.votes.down.length
        }
      })
    }
    
    if (action === 'accept') {
      // Mark comment as accepted answer
      await Comment.findByIdAndUpdate(params.id, { isAccepted: true })
      
      return NextResponse.json({
        success: true,
        message: 'Comment marked as accepted answer'
      })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Error updating comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}