import { requireAdmin } from '../_lib/auth.js'
import { ensurePropertiesTable } from '../_lib/db.js'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  try {
    const sql = await ensurePropertiesTable()
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM properties ORDER BY created_at DESC`
      return res.status(200).json({ properties: rows })
    }
    if (req.method === 'POST') {
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
        return res.status(400).json({ error: 'عنوان، محله، قیمت، منطقه معتبر و متراژ را کامل کنید.' })
      }
      const rows = await sql`
        INSERT INTO properties (title, deal_type, region, neighborhood, price, area, rooms, description, image_url, status)
        VALUES (${title}, ${dealType}, ${region}, ${neighborhood}, ${price}, ${area}, ${rooms}, ${description}, ${imageUrl}, ${status})
        RETURNING *
      `
      return res.status(201).json({ property: rows[0] })
    }
    return res.status(405).json({ error: 'Method not allowed' })
  } catch (error) {
    console.error('Admin properties error:', error)
    return res.status(500).json({ error: 'خطا در ارتباط با پایگاه داده. تنظیم DATABASE_URL را بررسی کنید.' })
  }
}
