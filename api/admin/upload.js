import { requireAdmin } from '../../lib/server/auth.js'
import { handleUpload } from '@vercel/blob/client'

export default async function handler(req, res) {
  if (!requireAdmin(req, res)) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 5 * 1024 * 1024,
        addRandomSuffix: true
      }),
      onUploadCompleted: async () => {}
    })
    return res.status(200).json(jsonResponse)
  } catch (error) {
    console.error('Image upload error:', error)
    return res.status(400).json({ error: 'آپلود تصویر انجام نشد. اتصال Vercel Blob را بررسی کنید.' })
  }
}
