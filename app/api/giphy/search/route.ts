import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const apiKey = process.env.GIPHY_API_KEY;

  if (!apiKey) {
    console.error('[v0] Giphy API key not configured');
    return NextResponse.json(
      { error: 'Giphy API key not configured. Please add GIPHY_API_KEY to environment variables.' },
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
      `https://api.giphy.com/v1/gifs/random?api_key=${apiKey}&tag=${encodeURIComponent(
        query
      )}&rating=g`,
      {
        next: { revalidate: 300 },
      }
    );

    const data = await response.json();

    if (data.meta.status !== 200) {
      console.error('[v0] Giphy API error:', data.meta.msg);
      return NextResponse.json(
        { error: data.meta.msg || 'Failed to fetch GIF' },
        { status: data.meta.status }
      );
    }

    return NextResponse.json({
      url: data.data.images.fixed_height.url,
      title: data.data.title,
    });
  } catch (error: any) {
    console.error('[v0] Giphy API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch GIF. Please try again.' },
      { status: 500 }
    );
  }
}
