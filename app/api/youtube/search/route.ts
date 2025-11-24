import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.error('[v0] YouTube API key not configured');
    return NextResponse.json(
      { error: 'YouTube API key not configured. Please add it in environment variables.' },
      { status: 500 }
    );
  }

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query + ' lofi'
      )}&type=video&order=viewCount&videoCategoryId=10&maxResults=25&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[v0] YouTube API error:', errorData);
      
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to search YouTube' },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 400 }
      );
    }

    type SearchItem = { id: string; title: string; thumbnail: string; channelTitle?: string; publishedAt?: string; viewCount?: number; duration?: string };
    const baseItems: SearchItem[] = (data.items || [])
      .filter((it: any) => !!it?.id?.videoId)
      .map((item: any): SearchItem => ({
        id: item.id.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.medium?.url || `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
        channelTitle: item.snippet?.channelTitle,
        publishedAt: item.snippet?.publishedAt,
      }));

    if (baseItems.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const ids = baseItems.map((x: SearchItem) => x.id).join(',');
    const detailsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${ids}&key=${apiKey}`, { next: { revalidate: 3600 } });
    const detailsJson = await detailsResp.json().catch(() => ({ items: [] }));
    const statsMap = new Map<string, { viewCount: number; duration?: string }>();
    for (const v of detailsJson.items || []) {
      const vc = Number(v?.statistics?.viewCount || 0);
      statsMap.set(v.id, { viewCount: isNaN(vc) ? 0 : vc, duration: v?.contentDetails?.duration || undefined });
    }
    const items: SearchItem[] = baseItems
      .map((x: SearchItem): SearchItem => ({ ...x, viewCount: statsMap.get(x.id)?.viewCount || 0, duration: statsMap.get(x.id)?.duration }))
      .sort((a: SearchItem, b: SearchItem) => (b.viewCount || 0) - (a.viewCount || 0));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('[v0] YouTube API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search videos. Please try again.' },
      { status: 500 }
    );
  }
}
