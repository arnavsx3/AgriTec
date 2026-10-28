import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import authRoutes from './routes/auth.js'
import farmRoutes from './routes/farms.js'
import cropRoutes from './routes/crops.js'
import { requireAuth } from './middleware/auth.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
const port = Number(process.env.API_PORT || 4000)
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({ origin: clientOrigin, credentials: true }))
app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false })
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }))
app.use('/api/v1/auth', authLimiter, authRoutes)
app.use('/api/v1/farms', requireAuth, farmRoutes)
app.use('/api/v1/crops', requireAuth, cropRoutes)
app.use(notFound)
app.use(errorHandler)

async function start() {
  const mongoUri = process.env.MONGODB_URI
  if (!mongoUri) throw new Error('Set MONGODB_URI before starting the API.')
  await mongoose.connect(mongoUri)
  app.listen(port, () => console.log(`AgriTec API listening on http://localhost:${port}`))
}

start().catch(error => {
  console.error('Could not start AgriTec API:', error.message)
  process.exitCode = 1
})
