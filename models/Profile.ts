import mongoose, { Document, Model } from 'mongoose'

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId
  name: string
  title: string
  skills: string[]
  experience: string
  portfolio: string[]
  hourlyRate: number
  bio: string
  specializations: string[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const profileSchema = new mongoose.Schema<IProfile>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: true
  },
  portfolio: [{
    type: String,
    trim: true
  }],
  hourlyRate: {
    type: Number,
    required: true,
    min: 0
  },
  bio: {
    type: String,
    default: ''
  },
  specializations: [{
    type: String,
    trim: true
  }],
  isActive: {
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

// Update the updatedAt field before saving
profileSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

// Ensure only one profile is active per user at a time
profileSchema.pre('save', async function(next) {
  if (this.isActive && this.isModified('isActive')) {
    await mongoose.model('Profile').updateMany(
      { userId: this.userId, _id: { $ne: this._id } },
      { isActive: false }
    )
  }
  next()
})

const Profile: Model<IProfile> = mongoose.models.Profile || mongoose.model<IProfile>('Profile', profileSchema)

export default Profile