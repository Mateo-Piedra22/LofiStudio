'use client';

import { useStudio } from './StudioProvider';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { WidgetGrid } from '@/app/components/WidgetGrid';
import { renderWidgetByType } from './WidgetRenderer';
import { useCallback } from 'react';
import { Player } from '@/app/components/PlayerV2';
import TopNavbar from '@/app/components/TopNavbar';
import CommandPalette from '@/app/components/CommandPalette';
import BackgroundV2 from '@/app/components/BackgroundV2';
import { AmbientMixer } from '@/app/components/AmbientMixerV2';

export function StudioLayout() {
    const { isZenMode, hideBackground } = useStudio();
    const isEditingLayout = useWidgetGridStore(state => state.isEditMode);
    const widgets = useWidgetGridStore(state => state.widgets);

    const renderWidget = useCallback((widgetId: string, type: string) => {
        const widget = widgets.find(w => w.id === widgetId);
        return renderWidgetByType(widgetId, type, widget?.settings);
    }, [widgets]);

    return (
        <main className="h-screen w-full flex flex-col overflow-hidden font-sans selection:bg-primary/30">
            {/* Top UI */}
            <TopNavbar />
            <CommandPalette />

            {/* Background Layer */}
            <div className="absolute inset-0 z-0">
                {!hideBackground && <BackgroundV2 />}
            </div>

            {/* Main Grid Canvas */}
            <div className="relative z-10 flex-1 w-full overflow-hidden" data-ui="main-grid">
                <WidgetGrid renderWidget={renderWidget} />
            </div>

            {/* Floating Player (Hover to reveal) */}
            {!isEditingLayout && !isZenMode && (
                <div className="group fixed bottom-0 left-0 right-0 z-40 hover:h-auto transition-all duration-300 isolate">
                    {/* Invisible Trigger Area */}
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-transparent z-[60] cursor-pointer flex justify-center items-end pb-1">
                        <div className="w-24 h-1 bg-foreground/20 rounded-t-full shadow-sm backdrop-blur-sm transition-opacity duration-300 opacity-50 group-hover:opacity-0" />
                    </div>

                    {/* Player Card */}
                    <div className="translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out">
                        <Player
                            showMini={true}
                            className="relative !bottom-auto !left-auto !right-auto border-t bg-background/95 backdrop-blur-xl shadow-[0_-4px_20px_rgba(0,0,0,0.2)]"
                        />
                    </div>
                </div>
            )}

            <AmbientMixer
                className="fixed bottom-24 right-4 z-40 max-h-[60vh] w-80 shadow-2xl rounded-2xl border"
            />
        </main>
    );
}
