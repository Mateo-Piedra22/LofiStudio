'use client';

import { useStudio } from '../StudioProvider';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getBreakpointConfig } from '@/lib/constants/breakpoints';
import { Button } from '@/components/ui/button';
import { Layout, Check, Eye } from 'lucide-react';

export function StudioDock() {
    const {
        isZenMode,
        isTopbarHidden, setIsTopbarHidden,
        showWidgetManager, setShowWidgetManager
    } = useStudio();

    const isEditingLayout = useWidgetGridStore(state => state.isEditMode);
    const setIsEditingLayout = useWidgetGridStore(state => state.setEditMode);
    const currentBreakpoint = useWidgetGridStore(state => state.currentBreakpoint);
    const breakpointConfig = getBreakpointConfig(currentBreakpoint);

    // Only show if editing
    if (!isEditingLayout || isZenMode) return null;

    // Mini toggle if topbar is hidden
    if (isTopbarHidden) {
        return (
            <div className="fixed top-3 left-3 z-50">
                <Button
                    onClick={() => setIsTopbarHidden(false)}
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full glass border"
                >
                    <Eye className="w-5 h-5" />
                </Button>
            </div>
        );
    }

    // Full Dock
    return (
        <div data-ui="edit-dock" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="flex items-center gap-4 glass border px-6 py-3 rounded-full shadow-2xl">
                <span className="font-medium text-sm text-foreground">Editing Layout</span>
                <div className="h-4 w-px bg-border" />

                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground mr-1">Grid</span>
                    <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {breakpointConfig.gridCols}x{breakpointConfig.gridRows}
                    </span>
                </div>

                <div className="h-4 w-px bg-border" />

                <Button
                    onClick={() => setShowWidgetManager(!showWidgetManager)}
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
                >
                    <Layout className="w-4 h-4 mr-2" />
                    {showWidgetManager ? 'Hide Widgets' : 'Add Widgets'}
                </Button>

                <Button
                    onClick={() => setIsTopbarHidden(!isTopbarHidden)}
                    variant="ghost"
                    size="sm"
                    className="text-foreground hover:bg-accent hover:text-accent-foreground h-8"
                >
                    {isTopbarHidden ? 'Show Topbar' : 'Hide Topbar'}
                </Button>

                <Button
                    onClick={() => setIsEditingLayout(false)}
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-full px-4"
                >
                    <Check className="w-4 h-4 mr-2" />
                    Done
                </Button>
            </div>
        </div>
    );
}
