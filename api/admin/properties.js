import { requireAdmin } from '../../lib/server/auth.js'
import { readProperties, writeProperties, validateProperty } from '../../lib/server/store.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  try {
    if (req.method === 'GET') {
      const properties = await readProperties()
      return res.status(200).json({ properties: properties.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)) })
    }
    if (req.method === 'POST') {
      const checked = validateProperty(req.body || {})
      if (checked.error) return res.status(400).json({ error: checked.error })
      const properties = await readProperties()
      const id = properties.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
      const property = { id, ...checked.property, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      properties.push(property)
      await writeProperties(properties)
      return res.status(201).json({ property })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Properties API error:', error)
    return res.status(500).json({ error: 'ذخیره‌سازی انجام نشد. اتصال Vercel Blob را بررسی کنید.' })
  }
}
