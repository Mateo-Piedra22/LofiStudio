'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Video, Image as ImageIcon, Palette } from 'lucide-react';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SceneGrid } from './SceneGrid';
import { UnsplashPicker } from './UnsplashPicker';

export function BackgroundSelectorV2() {
    const isOpen = useBackgroundStore(s => s.showSelector);
    const close = useBackgroundStore(s => s.closeSelector);
    const setGradient = useBackgroundStore(s => s.setGradientBackground);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) close();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, close]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={close}
            />

            <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden glass-panel rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 border border-white/10 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border/50">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-foreground">Atmosphere</h2>
                        <p className="text-sm text-muted-foreground">Select your visual environment</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={close} className="rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <Tabs defaultValue="scenes" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
                            <TabsTrigger value="scenes" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Video className="w-4 h-4 mr-2" />
                                Scenes
                            </TabsTrigger>
                            <TabsTrigger value="custom" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Image className="w-4 h-4 mr-2" />
                                Custom Image
                            </TabsTrigger>
                            <TabsTrigger value="minimal" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                <Palette className="w-4 h-4 mr-2" />
                                Minimal
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="scenes" className="outline-none">
                            <SceneGrid />
                        </TabsContent>

                        <TabsContent value="custom" className="outline-none">
                            <UnsplashPicker />
                        </TabsContent>

                        <TabsContent value="minimal" className="outline-none">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setGradient()}
                                    className="p-6 rounded-xl border border-border bg-gradient-to-br from-indigo-900 to-purple-900 hover:scale-[1.02] transition-transform text-left group"
                                >
                                    <h3 className="font-bold text-white mb-1">Deep Gradient</h3>
                                    <p className="text-sm text-white/70">Dynamic, calming color shifts</p>
                                </button>
                                {/* More minimal options could be added here */}
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>,
        document.body
    );
}

// Icon helper
function Image({ className }: { className?: string }) {
    return <ImageIcon className={className} />;
}
