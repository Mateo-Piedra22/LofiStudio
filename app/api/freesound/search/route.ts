import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') || ''
  const min = Number(searchParams.get('min')) || 60

  if (!q) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing query' }), { status: 400, headers: { 'content-type': 'application/json' } })
  }

  const token = process.env.FREESOUND_TOKEN || ''
  if (!token) {
    return new Response(JSON.stringify({ ok: false, error: 'Missing Freesound token' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }

  try {
    const qs = new URLSearchParams({
      query: q,
      fields: 'id,previews,duration,name',
      sort: 'rating_desc',
      filter: `duration:[${min} TO *]`,
      page_size: '40'
    }).toString()
    const url = `https://freesound.org/apiv2/search/text/?${qs}`
    const resp = await fetch(url, { headers: { Authorization: `Token ${token}`, 'Accept': 'application/json' } })
    if (!resp.ok) {
      const text = await resp.text()
      return new Response(JSON.stringify({ ok: false, error: `Upstream ${resp.status}`, detail: text }), { status: resp.status, headers: { 'content-type': 'application/json' } })
    }
    const data = await resp.json()
    const results: any[] = data?.results || []
    const pick = results.find(r => r?.previews?.['preview-hq-mp3'] || r?.previews?.['preview-lq-mp3'] || r?.previews?.['preview-hq-ogg'] || r?.previews?.['preview-lq-ogg']) || results[0]
    const src = pick?.previews?.['preview-hq-mp3'] || pick?.previews?.['preview-lq-mp3'] || pick?.previews?.['preview-hq-ogg'] || pick?.previews?.['preview-lq-ogg'] || null
    if (src) {
      return new Response(JSON.stringify({ ok: true, src, count: results.length }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } })
    }
    const qs2 = new URLSearchParams({
      query: `${q} loop ambience`,
      fields: 'id,previews,duration,name',
      sort: 'downloads_desc',
      filter: `duration:[${min} TO *]`,
      page_size: '50'
    }).toString()
    const url2 = `https://freesound.org/apiv2/search/text/?${qs2}`
    const resp2 = await fetch(url2, { headers: { Authorization: `Token ${token}`, 'Accept': 'application/json' } })
    if (!resp2.ok) {
      const text2 = await resp2.text()
      return new Response(JSON.stringify({ ok: false, error: `Upstream ${resp2.status}`, detail: text2 }), { status: resp2.status, headers: { 'content-type': 'application/json' } })
    }
    const data2 = await resp2.json()
    const results2: any[] = data2?.results || []
    const pick2 = results2.find(r => r?.previews?.['preview-hq-mp3'] || r?.previews?.['preview-lq-mp3'] || r?.previews?.['preview-hq-ogg'] || r?.previews?.['preview-lq-ogg']) || results2[0]
    const src2 = pick2?.previews?.['preview-hq-mp3'] || pick2?.previews?.['preview-lq-mp3'] || pick2?.previews?.['preview-hq-ogg'] || pick2?.previews?.['preview-lq-ogg'] || null
    return new Response(JSON.stringify({ ok: !!src2, src: src2, count: results.length + results2.length }), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=300' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'Unknown error' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}
