import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'

const accessSecret = process.env.JWT_ACCESS_SECRET || 'local-development-access-secret-change-me-32'
const refreshSecret = process.env.JWT_REFRESH_SECRET || 'local-development-refresh-secret-change-me-32'
if (process.env.NODE_ENV === 'production' && (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET || accessSecret.length < 32 || refreshSecret.length < 32 || accessSecret === refreshSecret)) {
  throw new Error('Production requires two different JWT secrets of at least 32 characters.')
}

export function createAccessToken(user) {
  return jwt.sign({ sub: user.id, role: user.role }, accessSecret, { expiresIn: '15m' })
}

export function createRefreshToken(user) {
  return jwt.sign({ sub: user.id, type: 'refresh' }, refreshSecret, { expiresIn: '7d' })
}

export function verifyAccessToken(token) {
  return jwt.verify(token, accessSecret)
}

export function verifyRefreshToken(token) {
  return jwt.verify(token, refreshSecret)
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  path: '/api/v1/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}
