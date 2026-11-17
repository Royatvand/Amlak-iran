import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'amlak_admin_session'
const SESSION_SECONDS = 60 * 60 * 12

function signature(payload) {
  return createHmac('sha256', process.env.ADMIN_SESSION_SECRET || '')
    .update(payload)
    .digest('hex')
}

export function createSession() {
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS
  const payload = String(expires)
  return { value: payload + '.' + signature(payload), maxAge: SESSION_SECONDS }
}

export function hasAdminSession(req) {
  const raw = req.headers.cookie || ''
  const cookie = raw.split(';').map((part) => part.trim()).find((part) => part.startsWith(COOKIE_NAME + '='))
  if (!cookie || !process.env.ADMIN_SESSION_SECRET) return false
  const value = decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1))
  const [expires, supplied] = value.split('.')
  if (!expires || !supplied || Number(expires) < Math.floor(Date.now() / 1000)) return false
  const expected = signature(expires)
  const a = Buffer.from(supplied)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function setSessionCookie(res, value, maxAge) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE_NAME + '=' + encodeURIComponent(value) + '; HttpOnly; Path=/; SameSite=Strict; Max-Age=' + maxAge + secure)
}

export function clearSessionCookie(res) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', COOKIE_NAME + '=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0' + secure)
}

export function requireAdmin(req, res) {
  if (!hasAdminSession(req)) {
    res.status(401).json({ error: 'برای ادامه وارد پنل مدیریت شوید.' })
    return false
  }
  return true
}
