'use client';

import { memo, useState, useEffect } from 'react';

interface ImageRendererProps {
    url: string;
    blur: number;
    onError?: () => void;
}

export const ImageRenderer = memo(function ImageRenderer({ url, blur, onError }: ImageRendererProps) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = url;
        img.onload = () => setLoaded(true);
        img.onerror = () => onError?.();
    }, [url, onError]);

    return (
        <div className="fixed inset-0 -z-50 w-full h-full bg-black">
            <div
                className={`w-full h-full transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                    backgroundImage: `url(${url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: `blur(${blur}px)`,
                }}
            />
            {!loaded && (
                <div className="absolute inset-0 bg-background animate-pulse" />
            )}
        </div>
    );
});
