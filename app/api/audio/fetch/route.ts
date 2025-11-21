import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) return new Response('Missing url', { status: 400 })
    const upstream = await fetch(url, { headers: { 'User-Agent': 'LofiStudio/1.0 (+https://lofi-studio-ma.vercel.app)' } })
    if (!upstream.ok) {
      return new Response('Upstream error', { status: upstream.status })
    }
    const ct = upstream.headers.get('content-type') || 'audio/mpeg'
    const body = upstream.body!
    return new Response(body, {
      status: 200,
      headers: {
        'content-type': ct,
        'cache-control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e: any) {
    return new Response(e?.message || 'Proxy error', { status: 500 })
  }
}
