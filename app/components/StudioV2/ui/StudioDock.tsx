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

    // Full Dock (Vertical Left)
    return (
        <div data-ui="edit-dock" className="fixed left-4 top-1/2 -translate-y-1/2 z-[100] animate-in slide-in-from-left-4 fade-in duration-300">
            <div className="flex flex-col items-center gap-4 glass border p-3 rounded-2xl shadow-2xl">
                <span className="font-medium text-xs text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-1 rounded-full whitespace-nowrap writing-vertical-lr" style={{ writingMode: 'vertical-rl' }}>
                    Editing
                </span>

                <div className="w-8 h-px bg-border" />

                <div className="flex flex-col items-center gap-1" title="Grid Size">
                    <span className="text-[10px] text-muted-foreground">Grid</span>
                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded border border-white/10">
                        {breakpointConfig.gridCols}×{breakpointConfig.gridRows}
                    </span>
                </div>

                <div className="w-8 h-px bg-border" />

                <Button
                    onClick={() => setShowWidgetManager(!showWidgetManager)}
                    variant={showWidgetManager ? "secondary" : "ghost"}
                    size="icon"
                    className="h-10 w-10 rounded-xl"
                    title={showWidgetManager ? 'Hide Widgets' : 'Add Widgets'}
                >
                    <Layout className="w-5 h-5" />
                </Button>

                <Button
                    onClick={() => setIsTopbarHidden(!isTopbarHidden)}
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
                    title={isTopbarHidden ? 'Show Interface' : 'Hide Interface'}
                >
                    <Eye className="w-5 h-5" />
                </Button>

                <div className="w-8 h-px bg-border" />

                <Button
                    onClick={() => setIsEditingLayout(false)}
                    size="icon"
                    className="h-12 w-12 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25"
                    title="Done Editing"
                >
                    <Check className="w-6 h-6" />
                </Button>
            </div>
        </div>
    );
}
