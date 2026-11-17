import { ensurePropertiesTable } from '../lib/server/db.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const sql = await ensurePropertiesTable()
    const rows = await sql`SELECT id, title, deal_type, region, neighborhood, price, area, rooms, description, image_url, created_at FROM properties WHERE status='published' ORDER BY created_at DESC`
    return res.status(200).setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60').json({ properties: rows })
  } catch (error) {
    console.error('Public properties error:', error)
    return res.status(500).json({ error: 'دریافت آگهی‌ها با خطا مواجه شد.' })
  }
}
