'use client';

import { useTheme } from '@/lib/stores/settings.store';
import { useCloudSync } from '@/lib/hooks/useCloudSync';
import { StudioProvider } from './StudioProvider';
import { StudioLayout } from './StudioLayout';
import { StudioModals } from './ui/StudioModals';
import { StudioDock } from './ui/StudioDock';
import { StudioOverlays } from './ui/StudioOverlays';

export default function StudioClientV2() {
    // Theme Hook (Must be at root level essentially)
    useTheme();

    // Cloud Sync Hook
    useCloudSync();

    return (
        <StudioProvider>
            <StudioLayout />
            <StudioDock />
            <StudioModals />
            <StudioOverlays />
        </StudioProvider>
    );
}
