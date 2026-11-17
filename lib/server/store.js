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
  const region = Number(body.region)
  const area = Number(body.area)
  const rooms = Number(body.rooms || 0)
  const status = body.status === 'published' ? 'published' : 'draft'
  const suppliedImages = Array.isArray(body.images) ? body.images : []
  const images = suppliedImages.map(value => String(value || '').trim()).filter(Boolean)
  const legacyImage = String(body.image_url || '').trim()
  if (!images.length && legacyImage) images.push(legacyImage)
  if (images.length > 10) return { error: 'برای هر آگهی حداکثر ۱۰ تصویر مجاز است.' }
  if (images.some(url => !/^https?:\/\//i.test(url))) return { error: 'آدرس یکی از تصاویر معتبر نیست.' }
  const image_url = images[0] || ''

  if (!title || !neighborhood || !price || !Number.isInteger(region) || region < 1 || region > 22 || !Number.isInteger(area) || area < 1 || !['خرید', 'اجاره', 'رهن'].includes(deal_type)) {
    return { error: 'عنوان، محله، قیمت، منطقه معتبر و متراژ را کامل کنید.' }
  }

  return { property: { title, deal_type, region, neighborhood, price, area, rooms, description, images, image_url, status } }
}
