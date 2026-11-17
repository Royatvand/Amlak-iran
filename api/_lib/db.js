import { neon } from '@neondatabase/serverless'

let sqlClient

export function getSql() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL تنظیم نشده است.')
  if (!sqlClient) sqlClient = neon(process.env.DATABASE_URL)
  return sqlClient
}

export async function ensurePropertiesTable() {
  const sql = getSql()
  await sql`
    CREATE TABLE IF NOT EXISTS properties (
      id BIGSERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      deal_type TEXT NOT NULL DEFAULT 'خرید',
      region INTEGER NOT NULL CHECK (region BETWEEN 1 AND 22),
      neighborhood TEXT NOT NULL,
      price TEXT NOT NULL,
      area INTEGER NOT NULL,
      rooms INTEGER NOT NULL DEFAULT 0,
      description TEXT NOT NULL DEFAULT '',
      image_url TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  return sql
}
