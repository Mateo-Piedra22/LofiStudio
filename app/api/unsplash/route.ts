import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const page = searchParams.get('page') || '1';
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        return NextResponse.json(
            { error: 'Unsplash API key not configured' },
            { status: 500 }
        );
    }

    try {
        let endpoint = '';
        if (query) {
            endpoint = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=20&orientation=landscape`;
        } else {
            endpoint = `https://api.unsplash.com/photos?page=${page}&per_page=20&order_by=popular&orientation=landscape`;
        }

        const response = await fetch(endpoint, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            },
            next: { revalidate: 3600 }
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();

        // Map data to include necessary fields for guidelines
        const headers = new Headers();

        const processImage = (img: any) => ({
            id: img.id,
            urls: img.urls,
            user: {
                name: img.user.name,
                username: img.user.username,
                links: {
                    html: img.user.links.html
                }
            },
            links: {
                download_location: img.links.download_location,
                html: img.links.html
            },
            description: img.description || img.alt_description
        });

        let result;
        if (data.results) {
            result = { ...data, results: data.results.map(processImage) };
        } else if (Array.isArray(data)) {
            result = data.map(processImage);
        } else {
            result = processImage(data);
        }

        return NextResponse.json(result);
    } catch (error) {
        console.error('Unsplash API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}
