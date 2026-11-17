import { requireAdmin } from '../../lib/server/auth.js'
import { ensurePropertiesTable } from '../../lib/server/db.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  const id = Number(req.query?.id)
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: 'شناسه آگهی معتبر نیست.' })
  try {
    const sql = await ensurePropertiesTable()
    if (req.method === 'PUT' || req.method === 'PATCH') {
      const body = req.body || {}
      const title = String(body.title || '').trim()
      const neighborhood = String(body.neighborhood || '').trim()
      const dealType = String(body.deal_type || 'خرید')
      const price = String(body.price || '').trim()
      const description = String(body.description || '').trim()
      const imageUrl = String(body.image_url || '').trim()
      const region = Number(body.region)
      const area = Number(body.area)
      const rooms = Number(body.rooms || 0)
      const status = body.status === 'published' ? 'published' : 'draft'
      if (!title || !neighborhood || !price || !Number.isInteger(region) || region < 1 || region > 22 || !Number.isInteger(area) || area < 1 || !['خرید', 'اجاره', 'رهن'].includes(dealType)) {
        return res.status(400).json({ error: 'اطلاعات آگهی کامل یا معتبر نیست.' })
      }
      const rows = await sql`
        UPDATE properties SET title=${title}, deal_type=${dealType}, region=${region}, neighborhood=${neighborhood},
        price=${price}, area=${area}, rooms=${rooms}, description=${description}, image_url=${imageUrl},
        status=${status}, updated_at=NOW() WHERE id=${id} RETURNING *
      `
      if (!rows.length) return res.status(404).json({ error: 'آگهی پیدا نشد.' })
      return res.status(200).json({ property: rows[0] })
    }
    if (req.method === 'DELETE') {
      const rows = await sql`DELETE FROM properties WHERE id=${id} RETURNING id`
      if (!rows.length) return res.status(404).json({ error: 'آگهی پیدا نشد.' })
      return res.status(200).json({ ok: true })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin property error:', error)
    return res.status(500).json({ error: 'عملیات روی آگهی انجام نشد.' })
  }
}
