import mongoose from 'mongoose'

const cropSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 80 },
  variety: { type: String, trim: true, maxlength: 100, default: '' },
  growthStage: { type: String, enum: ['planning', 'seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested'], default: 'planning' },
  plantingDate: { type: Date },
  expectedHarvestDate: { type: Date },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  area: { type: Number, min: 0, default: 0 },
  notes: { type: String, maxlength: 1000, default: '' },
}, { timestamps: true })

cropSchema.index({ owner: 1, farm: 1, createdAt: -1 })
export default mongoose.model('Crop', cropSchema)
