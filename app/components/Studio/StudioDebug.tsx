'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSession } from 'next-auth/react';
import dynamic from 'next/dynamic';

// Dynamic imports for UI components to test isolation
const Background = dynamic(() => import('@/app/components/Background'), { ssr: false });
const Player = dynamic(() => import('@/app/components/PlayerV2').then(m => m.Player), { ssr: false });
const WidgetGridWrapper = dynamic(() => import('@/app/components/WidgetGrid').then(m => {
    // Basic wrapper to mock props
    return function MockGrid() {
        return <div className="p-4 border border-white">Widget Grid Placeholder</div>;
    }
}), { ssr: false });
// Actual WidgetGrid for real test
const RealWidgetGrid = dynamic(() => import('@/app/components/WidgetGrid').then(m => m.WidgetGrid), { ssr: false });

export default function StudioDebug() {
    const [step, setStep] = useState(0);
    const [renderComponent, setRenderComponent] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Start sequence
        setStep(1);
    }, []);

    const nextStep = (next: number, componentName: string | null = null) => {
        console.log(`[DEBUG] Step ${next}: Testing ${componentName || 'logic'}`);
        setStep(next);
        if (componentName) setRenderComponent(componentName);
    };

    useEffect(() => {
        const runTest = async () => {
            try {
                if (step === 1) {
                    // Test 1: Background Component
                    await new Promise(r => setTimeout(r, 1000));
                    nextStep(2, 'Background');
                } else if (step === 2) {
                    // Wait for Background to mount/fail
                    await new Promise(r => setTimeout(r, 3000));
                    // Test 2: Player Component (independent)
                    nextStep(3, 'Player');
                } else if (step === 3) {
                    await new Promise(r => setTimeout(r, 3000));
                    // Test 3: Both Background and Player
                    nextStep(4, 'Background+Player');
                } else if (step === 4) {
                    await new Promise(r => setTimeout(r, 3000));
                    // Test 4: All Components mock
                    nextStep(5, 'Full Simulation (Mock)');

                    // NEW STEP: Test REAL WidgetGrid
                    await new Promise(r => setTimeout(r, 3000));
                    nextStep(6, 'REAL WidgetGrid');
                }
            } catch (e: any) {
                console.error('[DEBUG] CRASH CAUGHT:', e);
                setError(e.message);
            }
        };
        runTest();
    }, [step]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-red-900 text-white p-8">
                <div className="max-w-md">
                    <h1 className="text-3xl font-bold mb-4">CRASH DETECTED</h1>
                    <p className="font-mono bg-black p-4 rounded mb-4">{error}</p>
                    <p>Failed at step: {step}</p>
                    <p>Component: {renderComponent}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative bg-gray-900 text-white">
            {/* Control Panel */}
            <div className="fixed top-0 left-0 z-50 p-4 bg-black/80 w-full flex justify-between items-center">
                <div>
                    <h1 className="font-bold">Studio Debugger</h1>
                    <p className="text-sm text-gray-400">Step: {step} | Component: {renderComponent}</p>
                </div>
            </div>

            {/* Test Area */}
            <div className="pt-20 h-full w-full relative">

                {/* 1. Background Test */}
                {(step >= 2) && (
                    <div className="absolute inset-0 z-0">
                        <Background />
                    </div>
                )}

                {/* 2. Player Test */}
                {(step >= 3) && (
                    <div className="absolute z-10 bottom-4 right-4">
                        <Player />
                    </div>
                )}

                {/* 3. REAL WidgetGrid Test */}
                {step === 6 && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center">
                        <RealWidgetGrid renderWidget={(id, type) => (
                            <div className="bg-black/50 p-2 text-xs text-white border border-white/20 w-full h-full">
                                Widget: {type} ({id})
                            </div>
                        )} />
                    </div>
                )}

                {/* Mock Grid Message */}
                {step === 5 && (
                    <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
                        <div className="bg-white/10 p-8 rounded backdrop-blur">
                            <h2 className="text-xl font-bold mb-4">Mock Grid (Stable)</h2>
                            <p>Loading REAL grid in 3 seconds...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
