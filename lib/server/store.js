import { list, put } from '@vercel/blob'

const DATA_PATH = 'data/properties.json'

export async function readProperties() {
  const result = await list({ prefix: DATA_PATH, limit: 1 })
  const blob = result.blobs.find(item => item.pathname === DATA_PATH)
  if (!blob) return []
  const response = await fetch(blob.url, { cache: 'no-store' })
  if (!response.ok) throw new Error('خواندن فایل آگهی‌ها از Vercel Blob ناموفق بود.')
  const data = await response.json()
  return Array.isArray(data) ? data : []
}

export async function writeProperties(properties) {
  await put(DATA_PATH, JSON.stringify(properties), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    cacheControlMaxAge: 60
  })
}

export function validateProperty(body) {
  const title = String(body.title || '').trim()
  const neighborhood = String(body.neighborhood || '').trim()
  const deal_type = String(body.deal_type || 'خرید')
  const price = String(body.price || '').trim()
  const description = String(body.description || '').trim()
  const image_url = String(body.image_url || '').trim()
  const region = Number(body.region)
  const area = Number(body.area)
  const rooms = Number(body.rooms || 0)
  const status = body.status === 'published' ? 'published' : 'draft'

  if (!title || !neighborhood || !price || !Number.isInteger(region) || region < 1 || region > 22 || !Number.isInteger(area) || area < 1 || !['خرید', 'اجاره', 'رهن'].includes(deal_type)) {
    return { error: 'عنوان، محله، قیمت، منطقه معتبر و متراژ را کامل کنید.' }
  }

  return { property: { title, deal_type, region, neighborhood, price, area, rooms, description, image_url, status } }
}
