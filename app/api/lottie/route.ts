import { NextRequest } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

const LOCAL_NAMES = new Set([
  'CloudRain','CloudLightning','Sun','Cloud','Droplets','Wind','MapPin','Volume2','pulse'
])

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const name = (searchParams.get('name') || '').trim()
    const base = path.join(process.cwd(), 'public', 'lottie')
    if (!LOCAL_NAMES.has(name)) {
      return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } })
    }
    const file = path.join(base, `${name}.json`)
    try {
      const buf = await readFile(file)
      return new Response(buf, { status: 200, headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=31536000, immutable' } })
    } catch {
      return new Response('Not found', { status: 404, headers: { 'cache-control': 'public, max-age=60' } })
    }
  } catch (e: any) {
    return new Response('Bad request', { status: 400 })
  }
}
