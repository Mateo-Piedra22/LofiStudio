'use client';

import { useEffect } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useAudioStore } from '@/lib/stores/audio.store';
import { useCalendarStore } from '@/lib/stores/calendar.store';
import { usePlayerStore } from '@/lib/stores/player.store';
import { useStatisticsStore } from '@/lib/stores/statistics.store';
import { useTaskStore } from '@/lib/stores/task.store';
import { useTimerStore } from '@/lib/stores/timer.store';

/**
 * Component that handles manual hydration of all Zustand stores
 * This is needed because we use skipHydration: true to prevent
 * hydration mismatches between server and client
 */
export function StoreHydration({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Rehydrate all stores after mount
        // Order matters: settings should be first as other stores may depend on it
        useSettingsStore.persist.rehydrate();
        useBackgroundStore.persist.rehydrate();
        useWidgetGridStore.persist.rehydrate();
        useAudioStore.persist.rehydrate();
        useCalendarStore.persist.rehydrate();
        usePlayerStore.persist.rehydrate();
        useStatisticsStore.persist.rehydrate();
        useTaskStore.persist.rehydrate();
        useTimerStore.persist.rehydrate();
    }, []);

    return <>{children}</>;
}

export default StoreHydration;
