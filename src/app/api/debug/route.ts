import { NextResponse } from 'next/server'

export async function GET() {
  const url = process.env.TURSO_DATABASE_URL || 'NOT SET'
  const token = process.env.TURSO_AUTH_TOKEN || 'NOT SET'
  const httpUrl = url.replace('libsql://', 'https://')

  // Test 1: Does new URL() work?
  let urlTest = 'not tested'
  try {
    const u = new URL(httpUrl)
    urlTest = `OK: protocol=${u.protocol} host=${u.host}`
  } catch (e: any) {
    urlTest = `ERROR: ${e.message}`
  }

  // Test 2: What does encodeBaseUrl produce?
  let encodeTest = 'not tested'
  try {
    const { parseUri, encodeBaseUrl } = await import('@libsql/core/uri')
    const uri = parseUri(httpUrl)
    encodeTest = `parsed: scheme=${uri.scheme} host=${uri.authority?.host} path="${uri.path}"`
    const encoded = encodeBaseUrl(uri.scheme, uri.authority, uri.path)
    encodeTest += ` | encoded: ${encoded.toString()}`
  } catch (e: any) {
    encodeTest += ` | ERROR: ${e.message}`
  }

  // Test 3: Raw fetch
  let rawTest = 'not tested'
  try {
    const res = await fetch(`${httpUrl}/v2/pipeline`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests: [{ type: 'execute', stmt: { sql: 'SELECT 1' } }, { type: 'close' }] }),
    })
    rawTest = `OK (${res.status})`
  } catch (e: any) {
    rawTest = `ERROR: ${e.message}`
  }

  // Test 4: Node version
  const nodeVersion = process.version

  return NextResponse.json({ urlTest, encodeTest, rawTest, nodeVersion })
}
