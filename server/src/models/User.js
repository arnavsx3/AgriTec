import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
  refreshTokenHash: { type: String, select: false },
  preferredLocale: { type: String, default: 'en' },
}, { timestamps: true })

export default mongoose.model('User', userSchema)
