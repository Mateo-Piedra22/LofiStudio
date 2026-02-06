import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const apiKey = process.env.GIPHY_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: 'Giphy API key not configured' },
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
            `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=25&rating=g`,
            { next: { revalidate: 3600 } }
        );

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Giphy API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GIFs' },
            { status: 500 }
        );
    }
}
