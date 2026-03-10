import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || 'NOT SET'
  const token = process.env.TURSO_AUTH_TOKEN || 'NOT SET'
  const httpUrl = url.replace('libsql://', 'https://')

  // Test 1: Raw fetch to Turso HTTP API
  let rawTest = 'not tested'
  try {
    const res = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          { type: 'execute', stmt: { sql: 'SELECT COUNT(*) as cnt FROM Card' } },
          { type: 'close' },
        ],
      }),
    })
    const data = await res.json()
    rawTest = `OK (${res.status}): ${JSON.stringify(data).substring(0, 200)}`
  } catch (e: any) {
    rawTest = `ERROR: ${e.message}`
  }

  // Test 2: libsql web client
  let libsqlTest = 'not tested'
  try {
    const { createClient } = await import('@libsql/client/web')
    const client = createClient({ url: httpUrl, authToken: token })
    const result = await client.execute('SELECT COUNT(*) as cnt FROM Card')
    libsqlTest = `OK: ${JSON.stringify(result.rows)}`
  } catch (e: any) {
    libsqlTest = `ERROR: ${e.message} | ${e.stack?.substring(0, 200)}`
  }

  return NextResponse.json({
    tursoUrl: url.substring(0, 40),
    httpUrl: httpUrl.substring(0, 40),
    rawTest,
    libsqlTest,
    nodeEnv: process.env.NODE_ENV,
  })
}
