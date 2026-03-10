import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client/web'

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || 'NOT SET'
  const token = process.env.TURSO_AUTH_TOKEN || 'NOT SET'

  // Test raw libsql web connection
  let dbTest = 'not tested'
  try {
    // Web client needs https:// not libsql://
    const httpUrl = url.replace('libsql://', 'https://')
    const client = createClient({ url: httpUrl, authToken: token })
    const result = await client.execute('SELECT COUNT(*) as cnt FROM Card')
    dbTest = `OK: ${JSON.stringify(result.rows)}`
  } catch (e: any) {
    dbTest = `ERROR: ${e.message}`
  }

  return NextResponse.json({
    tursoUrl: url.substring(0, 40),
    tursoUrlLen: url.length,
    dbTest,
    nodeEnv: process.env.NODE_ENV,
  })
}
