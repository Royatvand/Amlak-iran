import { createHmac, createHash, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'amlak_admin_session'
const SESSION_SECONDS = 60 * 60 * 8

function digest(value) {
  return createHash('sha256').update(String(value)).digest()
}

function safeEqual(a, b) {
  return timingSafeEqual(digest(a), digest(b))
}

function signature(expiresAt) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '')
    .update(String(expiresAt))
    .digest('hex')
}

function readCookie(req) {
  const raw = req.headers.cookie || ''
  const entry = raw.split(';').map(part => part.trim()).find(part => part.startsWith(COOKIE_NAME + '='))
  return entry ? entry.slice(COOKIE_NAME.length + 1) : ''
}

export function createAdminSession(res) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const token = expiresAt + '.' + signature(expiresAt)
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE_NAME + '=' + token + '; Path=/; HttpOnly; SameSite=Strict; Max-Age=' + SESSION_SECONDS + secure)
}

export function clearAdminSession(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE_NAME + '=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0' + secure)
}

export function isAdminAuthenticated(req) {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (!secret || secret.length < 32) return false
  const token = readCookie(req)
  const [expiresAt, providedSignature] = token.split('.')
  if (!expiresAt || !providedSignature || !/^\d+$/.test(expiresAt)) return false
  if (Number(expiresAt) <= Math.floor(Date.now() / 1000)) return false
  return safeEqual(providedSignature, signature(expiresAt))
}

export function requireAdmin(req, res) {
  if (isAdminAuthenticated(req)) return true
  res.setHeader('Cache-Control', 'no-store')
  res.status(401).json({ error: 'برای انجام این عملیات ابتدا وارد پنل مدیریت شوید.' })
  return false
}

export function verifyAdminCredentials(identifier, password) {
  const username = process.env.ADMIN_USERNAME || ''
  const email = (process.env.ADMIN_EMAIL || '').toLowerCase()
  const expectedPassword = process.env.ADMIN_PASSWORD || ''
  const normalizedIdentifier = String(identifier || '').trim().toLowerCase()
  if (!username || !email || !expectedPassword || !process.env.ADMIN_SESSION_SECRET) return false
  const validIdentifier = safeEqual(normalizedIdentifier, username.toLowerCase()) || safeEqual(normalizedIdentifier, email)
  const validPassword = safeEqual(String(password || ''), expectedPassword)
  return validIdentifier && validPassword
}
