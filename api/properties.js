import { readProperties } from '../lib/server/store.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const properties = await readProperties()
    const published = properties.filter(item => item.status === 'published')
    return res.status(200).setHeader('Cache-Control', 'no-store').json({ properties: published })
  } catch (error) {
    console.error('Public properties error:', error)
    return res.status(500).json({ error: 'دریافت آگهی‌ها با خطا مواجه شد.' })
  }
}
