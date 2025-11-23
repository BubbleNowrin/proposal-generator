import mongoose, { Schema, Document } from 'mongoose'

export interface IProposalHistory extends Document {
  userId: string
  jobTitle: string
  jobDescription: string
  generatedProposal: string
  estimatedBudget: string
  timeline: string
  keyPoints: string[]
  matchScore: number
  missingSkills?: string[]
  profileUsed: string
  createdAt: Date
  expiresAt: Date
}

const ProposalHistorySchema = new Schema<IProposalHistory>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  jobTitle: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  generatedProposal: {
    type: String,
    required: true
  },
  estimatedBudget: {
    type: String,
    required: true
  },
  timeline: {
    type: String,
    required: true
  },
  keyPoints: [{
    type: String
  }],
  matchScore: {
    type: Number,
    required: true
  },
  missingSkills: [{
    type: String
  }],
  profileUsed: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    index: { expireAfterSeconds: 0 } // MongoDB TTL index
  }
})

export default mongoose.models.ProposalHistory || mongoose.model<IProposalHistory>('ProposalHistory', ProposalHistorySchema)