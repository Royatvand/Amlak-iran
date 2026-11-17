const BLOB_HOST = 'alzajvtomhgncwxb.public.blob.vercel-storage.com'

export function getPropertyImageSrc(value) {
  const source = String(value || '').trim()
  if (!source) return ''

  try {
    const imageUrl = new URL(source)
    const isSupportedBlob =
      imageUrl.protocol === 'https:' &&
      imageUrl.hostname === BLOB_HOST &&
      imageUrl.pathname.startsWith('/properties/')

    return isSupportedBlob
      ? '/api/property-image?url=' + encodeURIComponent(imageUrl.toString())
      : source
  } catch {
    return source
  }
}
