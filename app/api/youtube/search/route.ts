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
      )}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`,
      {
        // Add timeout and cache
        next: { revalidate: 3600 },
      }
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

    const items = (data.items || []).map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error('[v0] YouTube API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search videos. Please try again.' },
      { status: 500 }
    );
  }
}
