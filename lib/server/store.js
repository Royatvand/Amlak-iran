import { get, put, BlobPreconditionFailedError } from '@vercel/blob'

const DATA_PATH = 'data/properties.json'
const MAX_ATTEMPTS = 8

// Real storage adapter. Reads bypass the CDN cache so a fresh write is visible
// immediately, and writes are conditional on the ETag that was read.
const blobStorage = {
  async read() {
    const result = await get(DATA_PATH, { access: 'public', useCache: false })
    if (!result || result.statusCode !== 200) return { properties: [], etag: null }
    const data = await new Response(result.stream).json()
    return { properties: Array.isArray(data) ? data : [], etag: result.blob.etag }
  },
  async write(properties, etag) {
    await put(DATA_PATH, JSON.stringify(properties), {
      access: 'public',
      addRandomSuffix: false,
      // First ever write must create the file; later writes must match the ETag we read.
      allowOverwrite: Boolean(etag),
      ifMatch: etag || undefined,
      contentType: 'application/json',
      cacheControlMaxAge: 60
    })
  }
}

function isConflict(error) {
  return error instanceof BlobPreconditionFailedError || /precondition|already exists/i.test(String(error?.message || ''))
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

export async function readProperties(storage = blobStorage) {
  return (await storage.read()).properties
}

/**
 * Safe read-modify-write. `mutator(properties)` returns `{ properties, result }` to save
 * a new list, or `{ result }` to change nothing. If someone else saved in between, the
 * conditional write fails and the whole read-modify-write is retried on fresh data.
 */
export async function mutateProperties(mutator, storage = blobStorage) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const { properties, etag } = await storage.read()
    const outcome = await mutator(properties)
    if (!outcome.properties) return outcome.result
    try {
      await storage.write(outcome.properties, etag)
      return outcome.result
    } catch (error) {
      if (!isConflict(error)) throw error
      if (attempt === MAX_ATTEMPTS) throw Object.assign(new Error('Too many concurrent writes'), { code: 'CONFLICT' })
      await sleep(30 * attempt + Math.random() * 70)
    }
  }
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
