/**
 * BackgroundSettings Component
 * Background customization settings
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Image, Video, Palette, Settings2 } from 'lucide-react';
import { useBackgroundStore, useBackgroundConfig, useBackgroundBlur } from '@/lib/stores/background.store';
import { cn } from '@/lib/utils';

export function BackgroundSettings() {
    const [config] = useBackgroundConfig();
    const [blur, setBlur] = useBackgroundBlur();
    const openSelector = useBackgroundStore(s => s.openSelector);
    const setGradientBackground = useBackgroundStore(s => s.setGradientBackground);

    const getBgTypeLabel = () => {
        switch (config.type) {
            case 'video': return 'Video Background';
            case 'image': return 'Image Background';
            case 'gradient': return 'Gradient Background';
            default: return 'Background';
        }
    };

    const getBgTypeIcon = () => {
        switch (config.type) {
            case 'video': return Video;
            case 'image': return Image;
            case 'gradient': return Palette;
            default: return Palette;
        }
    };

    const Icon = getBgTypeIcon();

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Background
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Current Background Type */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span className="text-sm">{getBgTypeLabel()}</span>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={openSelector}
                        className="gap-2"
                    >
                        <Settings2 className="h-4 w-4" />
                        Customize
                    </Button>
                </div>

                {/* Quick Presets */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Quick Presets</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            onClick={setGradientBackground}
                            className={cn(
                                'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                                config.type === 'gradient'
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <div className="w-full h-8 rounded bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900" />
                            <span className="text-xs">Gradient</span>
                        </button>
                        <button
                            onClick={openSelector}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                        >
                            <div className="w-full h-8 rounded bg-muted flex items-center justify-center">
                                <Video className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-xs">Video</span>
                        </button>
                        <button
                            onClick={openSelector}
                            className="flex flex-col items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-all"
                        >
                            <div className="w-full h-8 rounded bg-muted flex items-center justify-center">
                                <Image className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="text-xs">Image</span>
                        </button>
                    </div>
                </div>

                {/* Blur Effect */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Blur Effect</Label>
                        <span className="text-xs text-muted-foreground">{blur}px</span>
                    </div>
                    <Slider
                        value={[blur]}
                        onValueChange={([v]) => setBlur(v)}
                        min={0}
                        max={20}
                        step={1}
                        className="w-full"
                    />
                </div>
            </CardContent>
        </Card>
    );
}
