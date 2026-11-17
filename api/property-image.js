const ALLOWED_BLOB_HOST = 'alzajvtomhgncwxb.public.blob.vercel-storage.com'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end('Method not allowed')

  try {
    const rawUrl = Array.isArray(req.query?.url) ? req.query.url[0] : req.query?.url
    if (!rawUrl) return res.status(400).end('Missing image URL')

    const imageUrl = new URL(rawUrl)
    if (
      imageUrl.protocol !== 'https:' ||
      imageUrl.hostname !== ALLOWED_BLOB_HOST ||
      !imageUrl.pathname.startsWith('/properties/')
    ) {
      return res.status(400).end('Invalid image URL')
    }

    const response = await fetch(imageUrl.toString(), { redirect: 'error' })
    if (!response.ok) {
      console.error('Property image source failed:', response.status, imageUrl.pathname)
      return res.status(response.status === 404 ? 404 : 502).end('Image unavailable')
    }

    const contentType = response.headers.get('content-type') || ''
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType.split(';')[0])) {
      return res.status(415).end('Unsupported image type')
    }

    const image = Buffer.from(await response.arrayBuffer())
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', String(image.length))
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400')
    return res.status(200).send(image)
  } catch (error) {
    console.error('Property image proxy error:', error)
    return res.status(502).end('Could not load property image')
  }
}
