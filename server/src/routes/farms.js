import { Router } from 'express'
import { z } from 'zod'
import Farm from '../models/Farm.js'
import Crop from '../models/Crop.js'
import { validate } from '../middleware/validate.js'

const router = Router()
const farmSchema = z.object({
  name: z.string().trim().min(1).max(100),
  location: z.string().trim().max(160).optional(),
  area: z.coerce.number().min(0),
  areaUnit: z.enum(['acres', 'hectares']).optional(),
  soilType: z.string().trim().max(80).optional(),
  irrigation: z.string().trim().max(80).optional(),
})
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

router.get('/', async (req, res) => {
  const farms = await Farm.find({ owner: req.user.id }).sort({ createdAt: -1 })
  res.json({ farms })
})

router.post('/', validate(farmSchema), async (req, res) => {
  const farm = await Farm.create({ ...req.validatedBody, owner: req.user.id })
  res.status(201).json({ farm })
})

router.get('/:farmId', async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.farmId, owner: req.user.id })
  if (!farm) return res.status(404).json({ error: 'Farm not found.' })
  res.json({ farm })
})

router.patch('/:farmId', validate(farmSchema.partial()), async (req, res) => {
  const farm = await Farm.findOneAndUpdate({ _id: req.params.farmId, owner: req.user.id }, req.validatedBody, { new: true, runValidators: true })
  if (!farm) return res.status(404).json({ error: 'Farm not found.' })
  res.json({ farm })
})

router.delete('/:farmId', async (req, res) => {
  const farm = await Farm.findOneAndDelete({ _id: req.params.farmId, owner: req.user.id })
  if (!farm) return res.status(404).json({ error: 'Farm not found.' })
  await Crop.deleteMany({ farm: farm.id, owner: req.user.id })
  res.status(204).end()
})

router.get('/:farmId/crops', async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.farmId, owner: req.user.id }).select('_id')
  if (!farm) return res.status(404).json({ error: 'Farm not found.' })
  const crops = await Crop.find({ farm: farm.id, owner: req.user.id }).sort({ createdAt: -1 })
  res.json({ crops })
})

router.post('/:farmId/crops', validate(cropSchema), async (req, res) => {
  const farm = await Farm.findOne({ _id: req.params.farmId, owner: req.user.id }).select('_id')
  if (!farm) return res.status(404).json({ error: 'Farm not found.' })
  const crop = await Crop.create({ ...req.validatedBody, farm: farm.id, owner: req.user.id })
  res.status(201).json({ crop })
})

export default router
