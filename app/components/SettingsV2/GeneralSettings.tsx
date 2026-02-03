/**
 * GeneralSettings Component
 * Theme, appearance, and display settings
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Sun, Moon, Monitor, Eye, EyeOff, Minimize2 } from 'lucide-react';
import { useSettingsStore, useTheme, useGlassOpacity } from '@/lib/stores/settings.store';
import { cn } from '@/lib/utils';
import type { ThemeMode } from '@/lib/types/settings.types';

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: React.ElementType }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'auto', label: 'System', icon: Monitor },
];

export function GeneralSettings() {
    const [theme, setTheme] = useTheme();
    const [glassOpacity, setGlassOpacity] = useGlassOpacity();
    const showHeaders = useSettingsStore(s => s.settings.appearance.showHeaders);
    const compactMode = useSettingsStore(s => s.settings.appearance.compactMode);
    const setShowHeaders = useSettingsStore(s => s.setShowHeaders);
    const setCompactMode = useSettingsStore(s => s.setCompactMode);

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Theme Selection */}
                <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Theme</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-3 rounded-lg border transition-all',
                                    theme === value
                                        ? 'border-primary bg-primary/10 text-primary'
                                        : 'border-border hover:border-primary/50'
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-medium">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Glass Opacity */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Glass Effect</Label>
                        <span className="text-xs text-muted-foreground">{glassOpacity}%</span>
                    </div>
                    <Slider
                        value={[glassOpacity]}
                        onValueChange={([v]) => setGlassOpacity(v)}
                        min={0}
                        max={100}
                        step={5}
                        className="w-full"
                    />
                </div>

                {/* Show Headers */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {showHeaders ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                        <Label htmlFor="show-headers" className="text-sm">
                            Show Widget Headers
                        </Label>
                    </div>
                    <Switch
                        id="show-headers"
                        checked={showHeaders}
                        onCheckedChange={setShowHeaders}
                    />
                </div>

                {/* Compact Mode */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Minimize2 className="h-4 w-4" />
                        <Label htmlFor="compact-mode" className="text-sm">
                            Compact Mode
                        </Label>
                    </div>
                    <Switch
                        id="compact-mode"
                        checked={compactMode}
                        onCheckedChange={setCompactMode}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
