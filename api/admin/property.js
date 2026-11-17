import { readProperties, writeProperties, validateProperty } from '../../lib/server/store.js'

export default async function handler(req, res) {
  const id = Number(req.query?.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'شناسه آگهی معتبر نیست.' })
  try {
    const properties = await readProperties()
    const index = properties.findIndex(item => Number(item.id) === id)
    if (index < 0) return res.status(404).json({ error: 'آگهی پیدا نشد.' })

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const checked = validateProperty(req.body || {})
      if (checked.error) return res.status(400).json({ error: checked.error })
      const updated = { ...properties[index], ...checked.property, updated_at: new Date().toISOString() }
      properties[index] = updated
      await writeProperties(properties)
      return res.status(200).json({ property: updated })
    }
    if (req.method === 'DELETE') {
      properties.splice(index, 1)
      await writeProperties(properties)
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Property API error:', error)
    return res.status(500).json({ error: 'عملیات روی آگهی انجام نشد.' })
  }
}
