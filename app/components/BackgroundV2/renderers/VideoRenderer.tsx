'use client';

import { memo } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface VideoRendererProps {
    videoId: string;
    blur: number;
    opacity: number;
    onReady?: () => void;
    onError?: () => void;
}

export const VideoRenderer = memo(function VideoRenderer({
    videoId,
    blur,
    opacity,
    onReady,
    onError
}: VideoRendererProps) {
    const opts: YouTubeProps['opts'] = {
        height: '100%',
        width: '100%',
        playerVars: {
            autoplay: 1,
            controls: 0,
            rel: 0,
            mute: 1,
            playsinline: 1,
            loop: 1,
            playlist: videoId, // Required for looping
            iv_load_policy: 3,
            disablekb: 1,
            modestbranding: 1,
        },
    };

    return (
        <div className="absolute inset-0 overflow-hidden -z-50 pointer-events-none">
            {/* 
                Scale wrapper to ensure video covers screen (similar to object-fit: cover).
                We use a massive scale to ensure no black bars, centering via flex/grid might be needed 
                if we want strict centering, but for BG, scaling up is usually enough.
            */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    filter: `blur(${blur}px)`,
                    opacity: opacity,
                    transform: 'scale(1.35)', // Zoom in slightly to avoid edge artifacts
                }}
            >
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    className="w-full h-full"
                    iframeClassName="w-full h-full object-cover"
                    onReady={(e: any) => {
                        e.target.mute();
                        e.target.playVideo();
                        onReady?.();
                    }}
                    onError={onError}
                    aria-hidden="true"
                />
            </div>
            {/* Overlay for consistent tint/readability */}
            <div className="absolute inset-0 bg-background/20" />
        </div>
    );
});
