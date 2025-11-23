import mongoose, { Schema, Document } from 'mongoose'

export interface IUserActivity extends Document {
  userId: string
  activityType: 'post_created' | 'comment_created' | 'vote_cast' | 'answer_accepted'
  targetType: 'post' | 'comment'
  targetId: string
  targetTitle?: string // For posts
  metadata?: {
    voteType?: 'up' | 'down'
    postTitle?: string
    commentContent?: string
  }
  createdAt: Date
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  activityType: {
    type: String,
    enum: ['post_created', 'comment_created', 'vote_cast', 'answer_accepted'],
    required: true
  },
  targetType: {
    type: String,
    enum: ['post', 'comment'],
    required: true
  },
  targetId: {
    type: String,
    required: true
  },
  targetTitle: {
    type: String
  },
  metadata: {
    voteType: String,
    postTitle: String,
    commentContent: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

UserActivitySchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.UserActivity || mongoose.model<IUserActivity>('UserActivity', UserActivitySchema)