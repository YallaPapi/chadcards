import { NextResponse } from 'next/server'
import { createClient } from '@libsql/client'

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || 'NOT SET'
  const token = process.env.TURSO_AUTH_TOKEN || 'NOT SET'

  // Test raw libsql connection
  let dbTest = 'not tested'
  try {
    const client = createClient({ url, authToken: token })
    const result = await client.execute('SELECT COUNT(*) as cnt FROM Card')
    dbTest = `OK: ${JSON.stringify(result.rows)}`
  } catch (e: any) {
    dbTest = `ERROR: ${e.message}`
  }

  return NextResponse.json({
    tursoUrl: url.substring(0, 40),
    tursoUrlLen: url.length,
    tursoUrlBytes: Array.from(Buffer.from(url.substring(0, 10))),
    tursoToken: token.substring(0, 20) + '...',
    dbTest,
    nodeEnv: process.env.NODE_ENV,
  })
}
