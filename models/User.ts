import mongoose, { Document, Model } from 'mongoose'

export interface IUser extends Document {
  email: string
  password: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
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
userSchema.pre('save', function(next) {
  this.updatedAt = new Date()
  next()
})

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema)

export default User