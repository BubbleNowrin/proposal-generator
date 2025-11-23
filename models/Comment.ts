import mongoose, { Schema, Document } from 'mongoose'

export interface IComment extends Document {
  postId: string
  content: string
  images?: string[] // URLs to uploaded images
  authorId?: string // User ID if logged in
  authorName: string // Display name (real name, random name, or "Anonymous")
  authorType: 'logged_in' | 'random' | 'anonymous'
  parentCommentId?: string // For nested replies
  votes: {
    up: string[] // User IDs who upvoted
    down: string[] // User IDs who downvoted
  }
  isAccepted: boolean // For accepted answers
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<IComment>({
  postId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  images: [{
    type: String
  }],
  authorId: {
    type: String,
    default: null
  },
  authorName: {
    type: String,
    required: true,
    maxlength: 100
  },
  authorType: {
    type: String,
    enum: ['logged_in', 'random', 'anonymous'],
    required: true
  },
  parentCommentId: {
    type: String,
    default: null
  },
  votes: {
    up: [{
      type: String
    }],
    down: [{
      type: String
    }]
  },
  isAccepted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

CommentSchema.index({ postId: 1, createdAt: -1 })
CommentSchema.index({ parentCommentId: 1 })

export default mongoose.models.Comment || mongoose.model<IComment>('Comment', CommentSchema)