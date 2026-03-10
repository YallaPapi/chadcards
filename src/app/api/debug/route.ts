import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    tursoUrl: process.env.TURSO_DATABASE_URL ? `${process.env.TURSO_DATABASE_URL.substring(0, 20)}...` : 'NOT SET',
    tursoToken: process.env.TURSO_AUTH_TOKEN ? `${process.env.TURSO_AUTH_TOKEN.substring(0, 20)}...` : 'NOT SET',
    grokKey: process.env.GROK_API_KEY ? 'SET' : 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
  })
}
