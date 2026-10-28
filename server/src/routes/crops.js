import { Router } from 'express'
import { z } from 'zod'
import Crop from '../models/Crop.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const cropSchema = z.object({
  name: z.string().trim().min(1).max(80),
  variety: z.string().trim().max(100).optional(),
  growthStage: z.enum(['planning', 'seedling', 'vegetative', 'flowering', 'fruiting', 'maturity', 'harvested']).optional(),
  plantingDate: z.coerce.date().optional(),
  expectedHarvestDate: z.coerce.date().optional(),
  progress: z.coerce.number().min(0).max(100).optional(),
  area: z.coerce.number().min(0).optional(),
  notes: z.string().max(1000).optional(),
})

router.patch('/:cropId', validate(cropSchema.partial()), async (req, res) => {
  const crop = await Crop.findOneAndUpdate({ _id: req.params.cropId, owner: req.user.id }, req.validatedBody, { new: true, runValidators: true })
  if (!crop) return res.status(404).json({ error: 'Crop not found.' })
  res.json({ crop })
})

router.delete('/:cropId', async (req, res) => {
  const crop = await Crop.findOneAndDelete({ _id: req.params.cropId, owner: req.user.id })
  if (!crop) return res.status(404).json({ error: 'Crop not found.' })
  res.status(204).end()
})

export default router
