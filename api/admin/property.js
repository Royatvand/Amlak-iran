import { requireAdmin } from '../../lib/server/auth.js'
import { mutateProperties, validateProperty } from '../../lib/server/store.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  const id = Number(req.query?.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'شناسه آگهی معتبر نیست.' })
  try {
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const checked = validateProperty(req.body || {})
      if (checked.error) return res.status(400).json({ error: checked.error })
      const updated = await mutateProperties(properties => {
        const index = properties.findIndex(item => Number(item.id) === id)
        if (index < 0) return { result: null }
        const next = { ...properties[index], ...checked.property, updated_at: new Date().toISOString() }
        const list = [...properties]
        list[index] = next
        return { properties: list, result: next }
      })
      if (!updated) return res.status(404).json({ error: 'آگهی پیدا نشد.' })
      return res.status(200).json({ property: updated })
    }
    if (req.method === 'DELETE') {
      const found = await mutateProperties(properties => {
        if (!properties.some(item => Number(item.id) === id)) return { result: false }
        return { properties: properties.filter(item => Number(item.id) !== id), result: true }
      })
      if (!found) return res.status(404).json({ error: 'آگهی پیدا نشد.' })
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    if (error?.code === 'CONFLICT') return res.status(409).json({ error: 'همزمان با ذخیره‌ای دیگر بود؛ لطفاً دوباره تلاش کنید.' })
    console.error('Property API error:', error)
    return res.status(500).json({ error: 'عملیات روی آگهی انجام نشد.' })
  }
}
