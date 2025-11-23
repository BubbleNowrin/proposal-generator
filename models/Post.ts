import mongoose, { Schema, Document } from 'mongoose'

export interface IPost extends Document {
  title: string
  content: string
  images?: string[] // URLs to uploaded images
  authorId?: string // User ID if logged in
  authorName: string // Display name (real name, random name, or "Anonymous")
  authorType: 'logged_in' | 'random' | 'anonymous'
  tags: string[]
  views: number
  votes: {
    up: string[] // User IDs who upvoted
    down: string[] // User IDs who downvoted
  }
  commentCount: number
  isResolved: boolean
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<IPost>({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
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
  tags: [{
    type: String,
    maxlength: 50
  }],
  views: {
    type: Number,
    default: 0
  },
  votes: {
    up: [{
      type: String
    }],
    down: [{
      type: String
    }]
  },
  commentCount: {
    type: Number,
    default: 0
  },
  isResolved: {
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

PostSchema.index({ createdAt: -1 })
PostSchema.index({ views: -1 })
PostSchema.index({ tags: 1 })

export default mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema)