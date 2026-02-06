'use client';

import { useStudio } from '../StudioProvider';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { SwipeableModal } from './SwipeableModal';
import { Settings } from '@/app/components/SettingsV2';
import { StatsOverview } from '@/app/components/StatisticsV2';
import { TaskList } from '@/app/components/TasksV2';
import { WidgetManager } from '@/app/components/WidgetManagerV2';
import KeyboardShortcutsHelp from '@/app/components/KeyboardShortcutsHelp'; // V1 component, keeping for now

export function StudioModals() {
    const {
        showSettings, setShowSettings,
        showStats, setShowStats,
        showLogs, setShowLogs,
        showWidgetManager, setShowWidgetManager,
        showKeyboardHelp, setShowKeyboardHelp,
        isZenMode
    } = useStudio();

    const isEditingLayout = useWidgetGridStore(state => state.isEditMode);

    if (isZenMode) return null;

    return (
        <>
            {/* Settings */}
            <Settings
                open={showSettings}
                onOpenChange={setShowSettings}
            />

            {/* Statistics */}
            <SwipeableModal
                isOpen={showStats}
                onClose={() => setShowStats(false)}
                className="max-w-5xl"
            >
                <StatsOverview />
            </SwipeableModal>

            {/* Activity Log */}
            <SwipeableModal
                isOpen={showLogs}
                onClose={() => setShowLogs(false)}
                title="Activity Log"
                className="max-w-2xl"
            >
                <TaskList />
            </SwipeableModal>

            {/* Keyboard Help */}
            <SwipeableModal
                isOpen={showKeyboardHelp}
                onClose={() => setShowKeyboardHelp(false)}
            >
                <KeyboardShortcutsHelp onClose={() => setShowKeyboardHelp(false)} />
            </SwipeableModal>

            {/* Widget Manager - Special case for Edit Mode vs Normal Mode */}
            {showWidgetManager && (
                <SwipeableModal
                    isOpen={true}
                    onClose={() => setShowWidgetManager(false)}
                    containerClassName={isEditingLayout ? "flex items-start justify-end pt-24" : ""}
                    className={isEditingLayout ? "w-[680px] lg:w-[760px] max-w-[calc(100vw-8px)] max-h-[70vh]" : "max-w-4xl"}
                >
                    <WidgetManager compact={isEditingLayout} />
                </SwipeableModal>
            )}
        </>
    );
}
