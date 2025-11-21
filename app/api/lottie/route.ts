import { NextRequest } from 'next/server'

const MAP: Record<string, string> = {
  CloudRain: 'https://assets1.lottiefiles.com/packages/lf20_rain.json',
  CloudLightning: 'https://assets6.lottiefiles.com/packages/lf20_thunder.json',
  Sun: 'https://assets8.lottiefiles.com/packages/lf20_sun.json',
  Cloud: 'https://assets5.lottiefiles.com/packages/lf20_cloud.json',
  MapPin: 'https://assets1.lottiefiles.com/packages/lf20_mappin.json',
  Book: 'https://assets5.lottiefiles.com/packages/lf20_book.json',
  Search: 'https://assets2.lottiefiles.com/packages/lf20_search.json',
  Quote: 'https://assets8.lottiefiles.com/packages/lf20_quote.json',
  RefreshCw: 'https://assets8.lottiefiles.com/packages/lf20_loader.json',
  Volume2: 'https://assets4.lottiefiles.com/private_files/lf30_volume.json',
}

const FALLBACK_PULSE = {
  v: '5.6.4', fr: 30, ip: 0, op: 60, w: 64, h: 64, nm: 'pulse', ddd: 0, assets: [],
  layers: [
    { ddd: 0, ind: 1, ty: 4, nm: 'circle', sr: 1, ks: { o: { a: 0, k: 100 }, r: { a: 0, k: 0 }, p: { a: 0, k: [32, 32, 0] }, a: { a: 0, k: [0, 0, 0] }, s: { a: 1, k: [{ i: { x: [0.2, 0.2, 0.2], y: [1, 1, 1] }, o: { x: [0.2, 0.2, 0.2], y: [0, 0, 0] }, t: 0, s: [80, 80, 100] }, { t: 60, s: [100, 100, 100] }] } }, shapes: [ { ty: 'el', p: { a: 0, k: [0, 0] }, s: { a: 0, k: [48, 48] }, nm: 'Ellipse', hd: false }, { ty: 'fl', c: { a: 0, k: [0.2, 0.6, 1, 1] }, o: { a: 0, k: 100 }, nm: 'Fill', hd: false } ] }
  ]
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = searchParams.get('name') || ''
    const url = MAP[name]
    if (!url) return new Response(JSON.stringify(FALLBACK_PULSE), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=31536000, immutable' } })
    const r = await fetch(url, { headers: { 'User-Agent': 'LofiStudio/1.0 (+https://lofi-studio-ma.vercel.app)' } })
    if (!r.ok) {
      return new Response(JSON.stringify(FALLBACK_PULSE), { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=31536000, immutable' } })
    }
    const txt = await r.text()
    return new Response(txt, { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=86400' } })
  } catch (e: any) {
    return new Response(JSON.stringify(FALLBACK_PULSE), { status: 200, headers: { 'content-type': 'application/json' } })
  }
}
