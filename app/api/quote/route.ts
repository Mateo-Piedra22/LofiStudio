import { NextRequest, NextResponse } from 'next/server'

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

const tagMap: Record<string, string> = {
  motivation: 'motivational',
  peace: 'wisdom',
  focus: 'business',
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const category = (params.get('category') || 'motivation').toLowerCase()
  const tag = tagMap[category] || 'motivational'

  try {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), 3500)
    const resp = await fetch(`https://api.quotable.io/random?tags=${encodeURIComponent(tag)}&maxLength=120`, { signal: controller.signal, next: { revalidate: 3600 } })
    clearTimeout(id)
    const data = await resp.json().catch(() => null)
    if (data && data.content && data.author) {
      return NextResponse.json({ text: data.content, author: data.author })
    }
    const fb = FALLBACK[category] || FALLBACK.motivation
    return NextResponse.json(fb[0])
  } catch (e: any) {
    const fb = FALLBACK[category] || FALLBACK.motivation
    return NextResponse.json(fb[0])
  }
}