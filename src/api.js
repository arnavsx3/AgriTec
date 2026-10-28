const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1'
let accessToken = null

async function rawRequest(path, { method = 'GET', body, authenticated = true } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...(authenticated && accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  if (response.status === 204) return null
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status}).`)
  return data
}

export async function refreshSession() {
  const session = await rawRequest('/auth/refresh', { method: 'POST', authenticated: false })
  accessToken = session.accessToken
  return session
}

async function request(path, options = {}, retry = true) {
  try {
    return await rawRequest(path, options)
  } catch (error) {
    if (error.message === 'Please sign in again.' && retry && options.authenticated !== false) {
      try {
        await refreshSession()
        return request(path, options, false)
      } catch { accessToken = null }
    }
    throw error
  }
}

export async function checkApi() {
  const response = await fetch(`${API_BASE}/health`)
  if (!response.ok) throw new Error('API is unavailable.')
  return response.json()
}

export async function signIn(email, password) {
  const session = await request('/auth/login', { method: 'POST', body: { email, password }, authenticated: false })
  accessToken = session.accessToken
  return session.user
}

export async function signUp(name, email, password) {
  const session = await request('/auth/register', { method: 'POST', body: { name, email, password }, authenticated: false })
  accessToken = session.accessToken
  return session.user
}

export async function getCurrentUser() {
  return (await request('/auth/me')).user
}

export async function signOut() {
  try { await request('/auth/logout', { method: 'POST', authenticated: false }) } finally { accessToken = null }
}

export async function getFarms() {
  return (await request('/farms')).farms
}

export async function getCrops(farmId) {
  return (await request(`/farms/${farmId}/crops`)).crops
}

export function clearAccessToken() { accessToken = null }

export async function createFarm(farm) {
  return (await request('/farms', { method: 'POST', body: farm })).farm
}

export async function createCrop(farmId, crop) {
  return (await request(`/farms/${farmId}/crops`, { method: 'POST', body: crop })).crop
}
