import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YouTube API key not configured.' }, { status: 500 })
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${encodeURIComponent(id)}&key=${apiKey}`, { next: { revalidate: 3600 } })
    const json = await resp.json()
    const item = (json.items || [])[0]
    if (!item) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    const data = {
      id: item.id,
      title: item.snippet?.title || 'YouTube Video',
      thumbnail: item.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id}/mqdefault.jpg`,
      duration: item.contentDetails?.duration || null,
    }
    return NextResponse.json({ item: data })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch video' }, { status: 500 })
  }
}
