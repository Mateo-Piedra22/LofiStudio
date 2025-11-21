import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id')
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'YouTube API key not configured.' }, { status: 500 })
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
  try {
    const resp = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${encodeURIComponent(id)}&key=${apiKey}`, { next: { revalidate: 3600 } })
    const json = await resp.json()
    const items = (json.items || []).map((it: any) => ({
      id: it.snippet?.resourceId?.videoId || '',
      title: it.snippet?.title || 'YouTube Video',
      thumbnail: it.snippet?.thumbnails?.medium?.url || (it.snippet?.resourceId?.videoId ? `https://img.youtube.com/vi/${it.snippet.resourceId.videoId}/mqdefault.jpg` : ''),
    })).filter((x: any) => x.id)
    return NextResponse.json({ items })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to fetch playlist' }, { status: 500 })
  }
}
