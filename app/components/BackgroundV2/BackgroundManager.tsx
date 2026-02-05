'use client';

import { useEffect, useState } from 'react';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { VideoRenderer } from './renderers/VideoRenderer';
import { ImageRenderer } from './renderers/ImageRenderer';
import { GradientRenderer } from './renderers/GradientRenderer';
import { BackgroundSelectorV2 } from './ui/BackgroundSelectorV2';

export function BackgroundManager() {
    const config = useBackgroundStore(s => s.config);
    const blur = useBackgroundStore(s => s.blur);
    const opacity = useBackgroundStore(s => s.opacity);
    const openSelector = useBackgroundStore(s => s.openSelector);

    // Global event listener for opening selector (legacy support)
    useEffect(() => {
        const handleOpen = () => openSelector();
        window.addEventListener('open-background-selector', handleOpen);
        return () => window.removeEventListener('open-background-selector', handleOpen);
    }, [openSelector]);

    const renderBackground = () => {
        switch (config.type) {
            case 'video':
                if (config.videoId) {
                    return (
                        <VideoRenderer
                            videoId={config.videoId}
                            blur={blur}
                            opacity={opacity}
                            onError={() => useBackgroundStore.getState().setGradientBackground()}
                        />
                    );
                }
                return <GradientRenderer blur={blur} />;

            case 'image':
                if (config.imageUrl) {
                    return (
                        <ImageRenderer
                            url={config.imageUrl}
                            blur={blur}
                            onError={() => useBackgroundStore.getState().setGradientBackground()}
                        />
                    );
                }
                return <GradientRenderer blur={blur} />;

            case 'gradient':
            default:
                return <GradientRenderer blur={blur} />;
        }
    };

    return (
        <>
            {renderBackground()}
            <BackgroundSelectorV2 />
        </>
    );
}
