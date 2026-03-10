import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ART_HOSTS = new Set(['imgen.x.ai'])

export async function GET(request: NextRequest) {
  const src = request.nextUrl.searchParams.get('src')
  if (!src) {
    return NextResponse.json({ error: 'Missing src parameter' }, { status: 400 })
  }

  let remoteUrl: URL
  try {
    remoteUrl = new URL(src)
  } catch {
    return NextResponse.json({ error: 'Invalid art URL' }, { status: 400 })
  }

  if (!ALLOWED_ART_HOSTS.has(remoteUrl.hostname)) {
    return NextResponse.json({ error: 'Art host not allowed' }, { status: 403 })
  }

  const response = await fetch(remoteUrl.toString(), {
    headers: {
      Accept: 'image/*',
    },
    cache: 'force-cache',
  })

  if (!response.ok) {
    return NextResponse.json({ error: 'Failed to fetch remote art' }, { status: 502 })
  }

  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  const buffer = await response.arrayBuffer()

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
