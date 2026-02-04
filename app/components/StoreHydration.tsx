'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';

/**
 * Component that handles manual hydration of all Zustand stores
 * This is needed because we use skipHydration: true to prevent
 * hydration mismatches between server and client
 */
export function StoreHydration({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Rehydrate all stores after mount
        useSettingsStore.persist.rehydrate();
        useBackgroundStore.persist.rehydrate();
        useWidgetGridStore.persist.rehydrate();
    }, []);

    return <>{children}</>;
}

export default StoreHydration;
