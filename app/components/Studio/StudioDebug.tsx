'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, CheckCircle, XCircle, Play, Pause, RotateCcw } from 'lucide-react';

// -----------------------------------------------------------------------------
// Component Registry (Dynamic)
// -----------------------------------------------------------------------------
const WIDGETS = {
    'QuoteWidget': dynamic(() => import('@/app/components/WidgetsV2/QuoteWidget').then(m => m.QuoteWidget)),
    'TasksWidget': dynamic(() => import('@/app/components/WidgetsV2/TasksWidget').then(m => m.TasksWidget)),
    'CalendarWidget': dynamic(() => import('@/app/components/WidgetsV2/CalendarWidget').then(m => m.CalendarWidget)),
    'ClockWidget': dynamic(() => import('@/app/components/WidgetsV2/ClockWidget').then(m => m.ClockWidget)),
    'WeatherWidget': dynamic(() => import('@/app/components/WidgetsV2/WeatherWidget').then(m => m.WeatherWidget)),
    'BreathingWidget': dynamic(() => import('@/app/components/WidgetsV2/BreathingWidget').then(m => m.BreathingWidget)),
    'CalculatorWidget': dynamic(() => import('@/app/components/WidgetsV2/CalculatorWidget').then(m => m.CalculatorWidget)),
    'DailyFocusWidget': dynamic(() => import('@/app/components/WidgetsV2/DailyFocusWidget').then(m => m.DailyFocusWidget)),
    'DictionaryWidget': dynamic(() => import('@/app/components/WidgetsV2/DictionaryWidget').then(m => m.DictionaryWidget)),
    'EmbedWidget': dynamic(() => import('@/app/components/WidgetsV2/EmbedWidget').then(m => m.EmbedWidget)),
    'FlashcardWidget': dynamic(() => import('@/app/components/WidgetsV2/FlashcardWidget').then(m => m.FlashcardWidget)),
    'GifWidget': dynamic(() => import('@/app/components/WidgetsV2/GifWidget').then(m => m.GifWidget)),
    'HabitTrackerWidget': dynamic(() => import('@/app/components/WidgetsV2/HabitTrackerWidget').then(m => m.HabitTrackerWidget)),
    'NotesWidget': dynamic(() => import('@/app/components/WidgetsV2/NotesWidget').then(m => m.NotesWidget)),
    'QuickLinksWidget': dynamic(() => import('@/app/components/WidgetsV2/QuickLinksWidget').then(m => m.QuickLinksWidget)),
    'TimerWidget': dynamic(() => import('@/app/components/WidgetsV2/TimerWidget').then(m => m.TimerWidget)),
    'WorldTimeWidget': dynamic(() => import('@/app/components/WidgetsV2/WorldTimeWidget').then(m => m.WorldTimeWidget)),
};

// -----------------------------------------------------------------------------
// Error Boundary
// -----------------------------------------------------------------------------
class ErrorBoundary extends React.Component<{ children: React.ReactNode, onError: (error: any) => void }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        this.props.onError(error);
    }

    render() {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }
}

// -----------------------------------------------------------------------------
// Debugger Component
// -----------------------------------------------------------------------------
export default function StudioDebug() {
    const widgetNames = Object.keys(WIDGETS);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [log, setLog] = useState<{ name: string, status: 'pending' | 'success' | 'error', msg?: string }[]>(
        widgetNames.map(name => ({ name, status: 'pending' }))
    );
    const [crashReport, setCrashReport] = useState<{ name: string, error: any } | null>(null);

    useEffect(() => {
        let timeout: NodeJS.Timeout;
        if (isPlaying && !crashReport && currentIdx < widgetNames.length) {
            timeout = setTimeout(() => {
                // Mark previous as success if we moved on (conceptually)
                // Actually, logic is: mount, wait 2s, if no crash, mark success and move next.

                setLog(prev => prev.map((l, i) => i === currentIdx ? { ...l, status: 'success' } : l));

                if (currentIdx + 1 < widgetNames.length) {
                    setCurrentIdx(c => c + 1);
                } else {
                    setIsPlaying(false); // Done
                }
            }, 3000); // 3 seconds per widget test
        }
        return () => clearTimeout(timeout);
    }, [isPlaying, currentIdx, crashReport, widgetNames.length]);

    const handleCrash = (error: any) => {
        const currentWidget = widgetNames[currentIdx];
        console.error(`[DEBUGGER] CRASH DETECTED ON ${currentWidget}`, error);
        setCrashReport({ name: currentWidget, error: error.message || error.toString() });
        setLog(prev => prev.map((l, i) => i === currentIdx ? { ...l, status: 'error', msg: error.message } : l));
        setIsPlaying(false);
    };

    const ActiveWidget = WIDGETS[widgetNames[currentIdx] as keyof typeof WIDGETS];

    return (
        <div className="min-h-screen bg-neutral-950 text-white font-mono p-8 flex gap-8">
            {/* Sidebar Control */}
            <div className="w-1/3 flex flex-col gap-4 border-r border-white/10 pr-8 overflow-y-auto max-h-screen custom-scrollbar">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <span className="bg-blue-600 px-2 py-1 rounded text-sm">DEV</span>
                    Studio Debugger
                </h1>
                <p className="text-sm text-neutral-400">
                    Automated crash testing for V2 Widgets. Steps through each widget to identify render failures.
                </p>

                <div className="flex gap-2">
                    {!isPlaying && !crashReport && currentIdx < widgetNames.length && (
                        <button onClick={() => setIsPlaying(true)} className="flex-1 bg-green-600 hover:bg-green-500 py-2 rounded flex items-center justify-center gap-2 font-bold transition-colors">
                            <Play size={16} /> Start Test
                        </button>
                    )}
                    {isPlaying && (
                        <button onClick={() => setIsPlaying(false)} className="flex-1 bg-yellow-600 hover:bg-yellow-500 py-2 rounded flex items-center justify-center gap-2 font-bold transition-colors">
                            <Pause size={16} /> Pause
                        </button>
                    )}
                    <button onClick={() => { setIsPlaying(false); setCurrentIdx(0); setCrashReport(null); setLog(widgetNames.map(n => ({ name: n, status: 'pending' }))); }} className="px-4 bg-neutral-800 hover:bg-neutral-700 rounded sticky flex items-center justify-center transition-colors">
                        <RotateCcw size={16} />
                    </button>
                </div>

                {crashReport && (
                    <div className="bg-red-900/50 border border-red-500 p-4 rounded text-red-200 animate-pulse">
                        <h3 className="font-bold flex items-center gap-2 text-red-500">
                            <XCircle /> CRASH DETECTED
                        </h3>
                        <p className="mt-2 text-lg font-bold">{crashReport.name}</p>
                        <div className="mt-2 p-2 bg-black/50 text-xs font-mono overflow-x-auto rounded border border-red-500/30">
                            {crashReport.error.toString()}
                        </div>
                        <p className="text-xs mt-2 opacity-75">Check console for full stack trace.</p>
                    </div>
                )}

                <div className="space-y-1 mt-4">
                    {log.map((entry, i) => (
                        <div key={entry.name} className={`
                    p-2 rounded text-sm flex justify-between items-center transition-colors
                    ${i === currentIdx && isPlaying ? 'bg-blue-900/30 border border-blue-500' : ''}
                    ${entry.status === 'success' ? 'text-green-400' : ''}
                    ${entry.status === 'error' ? 'text-red-400 bg-red-900/10' : ''}
                    ${entry.status === 'pending' && i !== currentIdx ? 'text-neutral-600' : ''}
                    ${entry.status === 'pending' && i === currentIdx ? 'text-blue-300' : ''}
                `}>
                            <span className="flex items-center gap-2">
                                <span className="opacity-50 w-6 text-right">{i + 1}.</span> {entry.name}
                            </span>
                            {entry.status === 'pending' && i === currentIdx && <Loader2 size={14} className="animate-spin" />}
                            {entry.status === 'success' && <CheckCircle size={14} />}
                            {entry.status === 'error' && <XCircle size={14} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Render Area */}
            <div className="flex-1 flex flex-col">
                <div className="bg-black/50 border border-white/10 rounded-lg flex-1 relative overflow-hidden flex items-center justify-center p-8">
                    <div className="text-center absolute top-4 left-0 w-full pointer-events-none opacity-50 text-xs tracking-widest uppercase">
                        Render Sandbox
                    </div>

                    {crashReport ? (
                        <div className="text-red-500 font-mono flex flex-col items-center gap-4">
                            <XCircle size={48} />
                            <span className="text-xl">Widget Render Failed</span>
                        </div>
                    ) : (
                        <div className="w-[400px] h-[400px] bg-neutral-900/80 rounded-xl border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
                            {/* Widget Header Mock */}
                            <div className="h-8 border-b border-white/10 flex items-center px-4 gap-2 bg-white/5">
                                <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                            </div>
                            <div className="flex-1 relative overflow-hidden">
                                <ErrorBoundary key={widgetNames[currentIdx]} onError={handleCrash}>
                                    <Suspense fallback={<div className="flex items-center justify-center h-full gap-2 text-neutral-500"><Loader2 className="animate-spin" /> Loading...</div>}>
                                        {isPlaying || currentIdx > 0 ? (
                                            <div className="p-4 h-full">
                                                <ActiveWidget id="debug-widget" />
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-neutral-500 text-center p-8 gap-4">
                                                <Play size={32} className="opacity-20" />
                                                <p>Ready to verify widgets.</p>
                                            </div>
                                        )}
                                    </Suspense>
                                </ErrorBoundary>
                            </div>
                        </div>
                    )}

                    {isPlaying && (
                        <div className="absolute bottom-4 left-0 w-full text-center">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900/20 text-blue-400 rounded-full text-xs animate-pulse">
                                <Loader2 size={10} className="animate-spin" />
                                Testing {widgetNames[currentIdx]}...
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
