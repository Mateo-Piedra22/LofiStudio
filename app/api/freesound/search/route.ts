import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const min = Number(searchParams.get('min')) || 60

  if (!q) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing query' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const token = process.env.NEXT_PUBLIC_FREESOUND_TOKEN || process.env.FREESOUND_TOKEN || ''
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing Freesound token' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }

  try {
    const qs = new URLSearchParams({
      query: q,
      fields: 'id,previews,duration,name',
      sort: 'rating_desc',
      filter: `duration:[${min} TO *]`
    }).toString()
    const url = `https://freesound.org/apiv2/search/text/?${qs}`
    const resp = await fetch(url, { headers: { Authorization: `Token ${token}`, 'Accept': 'application/json' } })
    if (!resp.ok) {
      const text = await resp.text()
      return new Response(JSON.stringify({ ok: false, error: `Upstream ${resp.status}`, detail: text }), { status: resp.status, headers: { 'content-type': 'application/json' } })
    }
    const data = await resp.json()
    const results: any[] = data?.results || []
    const pick = results.find(r => r?.previews?.['preview-hq-mp3']) || results.find(r => r?.previews?.['preview-lq-mp3'])
    const src = pick?.previews?.['preview-hq-mp3'] || pick?.previews?.['preview-lq-mp3'] || null
    return new Response(JSON.stringify({ ok: true, src, count: results.length }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
