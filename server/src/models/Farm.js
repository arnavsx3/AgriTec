import mongoose from 'mongoose'

const farmSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  location: { type: String, trim: true, maxlength: 160, default: '' },
  area: { type: Number, required: true, min: 0 },
  areaUnit: { type: String, enum: ['acres', 'hectares'], default: 'acres' },
  soilType: { type: String, trim: true, maxlength: 80, default: '' },
  irrigation: { type: String, trim: true, maxlength: 80, default: '' },
}, { timestamps: true })

farmSchema.index({ owner: 1, createdAt: -1 })
export default mongoose.model('Farm', farmSchema)
