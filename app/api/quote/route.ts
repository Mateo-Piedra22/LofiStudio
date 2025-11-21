import { NextRequest, NextResponse } from 'next/server'
import tagMapJson from '@/lib/config/quote-tags.json'

const FALLBACK: Record<string, { text: string; author: string }[]> = {
  motivation: [
    { text: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney' },
    { text: "Don't let yesterday take up too much of today.", author: 'Will Rogers' },
    { text: 'You learn more from failure than from success.', author: 'Unknown' },
  ],
  peace: [
    { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha' },
    { text: 'Quiet the mind and the soul will speak.', author: 'Ma Jaya Sati Bhagavati' },
    { text: 'In the midst of movement and chaos, keep stillness inside of you.', author: 'Deepak Chopra' },
  ],
  focus: [
    { text: 'Focus is the key to success.', author: 'Bill Gates' },
    { text: 'Where focus goes, energy flows.', author: 'Tony Robbins' },
    { text: 'Starve your distractions, feed your focus.', author: 'Unknown' },
  ],
}

const categoryToApiParam: Record<string, string> = (tagMapJson as any).tags

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const category = (params.get('category') || 'motivation').toLowerCase()
  const apiKey = process.env.API_NINJAS_KEY
  const categoriesParam = categoryToApiParam[category] || 'wisdom'

  try {
    if (!apiKey) throw new Error('Missing API key')
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 3500)
    const resp = await fetch(`https://api.api-ninjas.com/v2/quotes?categories=${encodeURIComponent(categoriesParam)}`, {
      headers: { 'X-Api-Key': apiKey },
      signal: controller.signal,
      next: { revalidate: 3600 },
    })
    clearTimeout(id)
    if (!resp.ok) throw new Error(`API error ${resp.status}`)
    const data = await resp.json().catch(() => null)
    const item = Array.isArray(data) ? data[0] : null
    if (item && item.quote && item.author) {
      return NextResponse.json({ text: item.quote, author: item.author, source: 'api' })
    }
    const fb = FALLBACK[category] || FALLBACK.motivation
    return NextResponse.json({ ...fb[0], source: 'local' })
  } catch (e: any) {
    const fb = FALLBACK[category] || FALLBACK.motivation
    return NextResponse.json({ ...fb[0], source: 'local' })
  }
}
