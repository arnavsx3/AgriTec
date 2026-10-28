import { verifyAccessToken } from '../lib/tokens.js'
import User from '../models/User.js'

export async function requireAuth(req, res, next) {
  try {
    const token = req.get('authorization')?.replace(/^Bearer\s+/i, '')
    if (!token) return res.status(401).json({ error: 'Sign in to continue.' })
    const payload = verifyAccessToken(token)
    const user = await User.findById(payload.sub).select('name email role preferredLocale')
    if (!user) return res.status(401).json({ error: 'Your session is no longer valid.' })
    req.user = user
    next()
  } catch {
    res.status(401).json({ error: 'Your session has expired. Please sign in again.' })
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access is required.' })
  next()
}
