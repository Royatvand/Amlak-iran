import { handleUpload } from '@vercel/blob/client'
import { hasAdminSession } from '../../lib/server/auth.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  if (!hasAdminSession(req)) return res.status(401).json({ error: 'برای آپلود تصویر وارد پنل شوید.' })
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 5 * 1024 * 1024,
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ folder: 'amlak-properties', pathname })
      }),
      onUploadCompleted: async () => {}
    })
    return res.status(200).json(jsonResponse)
  } catch (error) {
    console.error('Image upload error:', error)
    return res.status(400).json({ error: 'آپلود تصویر انجام نشد. تنظیمات Vercel Blob را بررسی کنید.' })
  }
}
