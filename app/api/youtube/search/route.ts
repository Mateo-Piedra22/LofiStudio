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
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=video,playlist&order=viewCount&videoCategoryId=10&maxResults=25&key=${apiKey}`,
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

    type SearchItem = {
      id: string;
      kind: 'video' | 'playlist';
      title: string;
      thumbnail: string;
      channelTitle?: string;
      publishedAt?: string;
      viewCount?: number;
      duration?: string;
      itemCount?: number;
      isOfficial?: boolean;
    };
    const baseItems: SearchItem[] = (data.items || [])
      .filter((it: any) => !!(it?.id?.videoId || it?.id?.playlistId))
      .map((item: any): SearchItem => {
        const isVideo = !!item.id?.videoId;
        const id = isVideo ? item.id.videoId : item.id.playlistId;
        const thumb = item.snippet?.thumbnails?.medium?.url || (isVideo ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : '/placeholder.svg');
        return {
          id,
          kind: isVideo ? 'video' : 'playlist',
          title: item.snippet?.title,
          thumbnail: thumb,
          channelTitle: item.snippet?.channelTitle,
          publishedAt: item.snippet?.publishedAt,
        };
      });

    if (baseItems.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const videoIds = baseItems.filter((x) => x.kind === 'video').map((x) => x.id).join(',');
    const playlistIds = baseItems.filter((x) => x.kind === 'playlist').map((x) => x.id).join(',');
    const statsMap = new Map<string, { viewCount: number; duration?: string }>();
    const itemsCountMap = new Map<string, number>();
    if (videoIds) {
      const detailsResp = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails,snippet&id=${videoIds}&key=${apiKey}`, { next: { revalidate: 3600 } });
      const detailsJson = await detailsResp.json().catch(() => ({ items: [] }));
      for (const v of detailsJson.items || []) {
        const vc = Number(v?.statistics?.viewCount || 0);
        statsMap.set(v.id, { viewCount: isNaN(vc) ? 0 : vc, duration: v?.contentDetails?.duration || undefined });
      }
    }
    if (playlistIds) {
      const plResp = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=contentDetails,snippet&id=${playlistIds}&key=${apiKey}`, { next: { revalidate: 3600 } });
      const plJson = await plResp.json().catch(() => ({ items: [] }));
      for (const p of plJson.items || []) {
        const cnt = Number(p?.contentDetails?.itemCount || 0);
        itemsCountMap.set(p.id, isNaN(cnt) ? 0 : cnt);
      }
    }
    const qlc = String(query || '').toLowerCase();
    const items: SearchItem[] = baseItems
      .map((x: SearchItem): SearchItem => {
        const vc = statsMap.get(x.id)?.viewCount || 0;
        const dur = statsMap.get(x.id)?.duration;
        const cnt = itemsCountMap.get(x.id) || 0;
        const t = String(x.title || '').toLowerCase();
        const ch = String(x.channelTitle || '').toLowerCase();
        const isOfficial = /official/.test(t) || /official/.test(ch) || /vevo/.test(ch) || (!!qlc && ch.includes(qlc));
        return { ...x, viewCount: vc, duration: dur, itemCount: cnt, isOfficial };
      })
      .sort((a: SearchItem, b: SearchItem) => {
        const oa = a.isOfficial ? 1 : 0;
        const ob = b.isOfficial ? 1 : 0;
        if (ob !== oa) return ob - oa;
        const ma = a.kind === 'video' ? (a.viewCount || 0) : (a.itemCount || 0);
        const mb = b.kind === 'video' ? (b.viewCount || 0) : (b.itemCount || 0);
        return mb - ma;
      });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('[v0] YouTube API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search videos. Please try again.' },
      { status: 500 }
    );
  }
}
