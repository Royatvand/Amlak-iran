import { createSession, setSessionCookie } from '../_lib/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return res.status(503).json({ error: 'تنظیمات ورود مدیر در Vercel کامل نشده است.' })
  }
  const password = String(req.body?.password || '')
  if (password.length > 256 || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'رمز عبور اشتباه است.' })
  }
  const session = createSession()
  setSessionCookie(res, session.value, session.maxAge)
  return res.status(200).json({ ok: true })
}
