import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const url = searchParams.get('url')
    if (!url) return new Response('Missing url', { status: 400 })
    const u = new URL(url)
    const headers: Record<string,string> = { 'User-Agent': 'LofiStudio/1.0 (+https://lofi-studio-ma.vercel.app)' }
    if (u.hostname.includes('pixabay.com')) headers['Referer'] = 'https://pixabay.com/'
    if (u.hostname.includes('freesound.org')) {
      const token = process.env.FREESOUND_TOKEN || ''
      if (token) headers['Authorization'] = `Token ${token}`
    }
    const upstream = await fetch(url, { headers })
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
