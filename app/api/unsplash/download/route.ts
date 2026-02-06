import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
        return NextResponse.json({ error: 'Unsplash API key not configured' }, { status: 500 });
    }

    try {
        const { downloadLocation } = await request.json();

        if (!downloadLocation) {
            return NextResponse.json({ error: 'Download location is required' }, { status: 400 });
        }

        // Unsplash requires sending the Client-ID to the download endpoint
        const response = await fetch(downloadLocation, {
            headers: {
                'Authorization': `Client-ID ${accessKey}`
            }
        });

        if (!response.ok) {
            // We don't fail the user interaction if tracking fails, but we log it
            console.error('Failed to trigger Unsplash download', response.status);
            return NextResponse.json({ success: false }, { status: response.status });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Unsplash download trigger error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
