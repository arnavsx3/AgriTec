import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { validate } from '../middleware/validate.js'
import { createAccessToken, createRefreshToken, hashToken, refreshCookieOptions, verifyRefreshToken } from '../lib/tokens.js'

const router = Router()
const registerSchema = z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(10).max(72) })
const loginSchema = z.object({ email: z.string().trim().email().max(254), password: z.string().min(1).max(72) })

function safeUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, preferredLocale: user.preferredLocale }
}

async function issueSession(user, res) {
  const refreshToken = createRefreshToken(user)
  user.refreshTokenHash = hashToken(refreshToken)
  await user.save()
  res.cookie('agritec_refresh', refreshToken, refreshCookieOptions)
  return { user: safeUser(user), accessToken: createAccessToken(user) }
}

router.post('/register', validate(registerSchema), async (req, res) => {
  const { name, email, password } = req.validatedBody
  const passwordHash = await bcrypt.hash(password, 12)
  const user = await User.create({ name, email: email.toLowerCase(), passwordHash })
  res.status(201).json(await issueSession(user, res))
})

router.post('/login', validate(loginSchema), async (req, res) => {
  const user = await User.findOne({ email: req.validatedBody.email.toLowerCase() }).select('+passwordHash')
  const matches = user && await bcrypt.compare(req.validatedBody.password, user.passwordHash)
  if (!matches) return res.status(401).json({ error: 'Email or password is incorrect.' })
  res.json(await issueSession(user, res))
})

router.post('/refresh', async (req, res) => {
  const token = req.cookies.agritec_refresh
  if (!token) return res.status(401).json({ error: 'Please sign in again.' })
  try {
    const payload = verifyRefreshToken(token)
    const user = await User.findById(payload.sub).select('+refreshTokenHash')
    if (!user || !user.refreshTokenHash || user.refreshTokenHash !== hashToken(token)) {
      if (user) { user.refreshTokenHash = undefined; await user.save() }
      return res.status(401).json({ error: 'Please sign in again.' })
    }
    res.json(await issueSession(user, res))
  } catch {
    res.clearCookie('agritec_refresh', refreshCookieOptions)
    res.status(401).json({ error: 'Please sign in again.' })
  }
})

router.post('/logout', async (req, res) => {
  const token = req.cookies.agritec_refresh
  if (token) {
    try {
      const payload = verifyRefreshToken(token)
      await User.findByIdAndUpdate(payload.sub, { $unset: { refreshTokenHash: 1 } })
    } catch { /* An expired token is already unusable. */ }
  }
  res.clearCookie('agritec_refresh', refreshCookieOptions)
  res.status(204).end()
})

router.get('/me', requireAuth, (req, res) => res.json({ user: safeUser(req.user) }))
export default router
