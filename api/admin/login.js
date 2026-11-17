import { createAdminSession, verifyAdminCredentials } from '../../lib/server/auth.js'

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store')
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { identifier, password } = req.body || {}
  if (!verifyAdminCredentials(identifier, password)) {
    return res.status(401).json({ error: 'نام کاربری یا رمز عبور اشتباه است.' })
  }
  createAdminSession(res)
  return res.status(200).json({ ok: true })
}
