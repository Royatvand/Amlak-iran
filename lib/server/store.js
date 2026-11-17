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

function optionalInt(value, min, max) {
  if (value === '' || value === null || value === undefined) return { value: null }
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) return { error: true }
  return { value: n }
}

export function validateProperty(body) {
  const title = String(body.title || '').trim()
  const neighborhood = String(body.neighborhood || '').trim()
  const deal_type = String(body.deal_type || 'خرید')
  const description = String(body.description || '').trim()
  const region = Number(body.region)
  const area = Number(body.area)
  const rooms = Number(body.rooms || 0)
  const status = body.status === 'published' ? 'published' : 'draft'
  const availability = body.availability === 'closed' ? 'closed' : 'available'
  const suppliedImages = Array.isArray(body.images) ? body.images : []
  const images = suppliedImages.map(value => String(value || '').trim()).filter(Boolean)
  const legacyImage = String(body.image_url || '').trim()
  if (!images.length && legacyImage) images.push(legacyImage)
  if (images.length > 10) return { error: 'برای هر آگهی حداکثر ۱۰ تصویر مجاز است.' }
  if (images.some(url => !/^https?:\/\//i.test(url))) return { error: 'آدرس یکی از تصاویر معتبر نیست.' }
  const image_url = images[0] || ''

  if (!title || !neighborhood || !Number.isInteger(region) || region < 1 || region > 22 || !Number.isInteger(area) || area < 1 || !['خرید', 'اجاره', 'رهن'].includes(deal_type)) {
    return { error: 'عنوان، محله، منطقه معتبر و متراژ را کامل کنید.' }
  }

  // Prices: sale -> price; mortgage -> deposit; rent -> deposit + monthly rent.
  // `price` always holds the main amount so older code and listings keep working.
  let price = String(body.price || '').trim()
  let deposit = ''
  let monthly_rent = ''
  if (deal_type === 'خرید') {
    if (!price) return { error: 'قیمت ملک را وارد کنید.' }
  } else {
    deposit = String(body.deposit || '').trim() || String(body.price || '').trim()
    if (!deposit) return { error: deal_type === 'رهن' ? 'مبلغ رهن را وارد کنید.' : 'مبلغ ودیعه را وارد کنید.' }
    price = deposit
    if (deal_type === 'اجاره') {
      monthly_rent = String(body.monthly_rent || '').trim()
      if (!monthly_rent) return { error: 'مبلغ اجارهٔ ماهانه را وارد کنید.' }
    }
  }

  const floor = optionalInt(body.floor, -5, 100)
  if (floor.error) return { error: 'طبقه باید عددی بین ۵- تا ۱۰۰ باشد (۰ یعنی همکف).' }
  const building_age = optionalInt(body.building_age, 0, 100)
  if (building_age.error) return { error: 'سن بنا باید عددی بین ۰ تا ۱۰۰ سال باشد (۰ یعنی نوساز).' }
  const flag = v => v === true || v === 'true'

  return { property: {
    title, deal_type, region, neighborhood, price, deposit, monthly_rent, area, rooms, description,
    floor: floor.value, building_age: building_age.value,
    parking: flag(body.parking), elevator: flag(body.elevator), storage: flag(body.storage),
    images, image_url, status, availability
  } }
}
