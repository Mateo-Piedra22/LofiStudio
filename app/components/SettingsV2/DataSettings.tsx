/**
 * DataSettings Component
 * Export, import, and data management
 */

'use client';

import { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Download, Upload, Trash2, Cloud, Save, AlertTriangle } from 'lucide-react';
import { useSettingsStore } from '@/lib/stores/settings.store';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function DataSettings() {
    const store = useSettingsStore();
    const data = store.settings.data;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const handleExport = () => {
        try {
            // Collect all localStorage data
            const exportData: Record<string, unknown> = {};

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('lofistudio')) {
                    try {
                        exportData[key] = JSON.parse(localStorage.getItem(key) || '');
                    } catch {
                        exportData[key] = localStorage.getItem(key);
                    }
                }
            }

            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `lofistudio-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
            a.click();
            URL.revokeObjectURL(url);

            store.markExported();
            toast({
                title: 'Export successful',
                description: 'Your data has been exported successfully.',
            });
        } catch (err) {
            toast({
                title: 'Export failed',
                description: 'Failed to export data. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importData = JSON.parse(event.target?.result as string);

                Object.entries(importData).forEach(([key, value]) => {
                    if (key.startsWith('lofistudio')) {
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    }
                });

                store.markImported();
                toast({
                    title: 'Import successful',
                    description: 'Your data has been imported. Refreshing...',
                });

                // Reload to apply imported settings
                setTimeout(() => window.location.reload(), 1500);
            } catch (err) {
                toast({
                    title: 'Import failed',
                    description: 'Invalid backup file format.',
                    variant: 'destructive',
                });
            }
        };
        reader.readAsText(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClearAllData = () => {
        if (!confirm('Are you sure you want to clear ALL data? This action cannot be undone.')) {
            return;
        }

        // Clear all lofistudio keys
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('lofistudio')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        toast({
            title: 'Data cleared',
            description: 'All data has been cleared. Refreshing...',
        });

        setTimeout(() => window.location.reload(), 1500);
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Data Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Auto-save */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Save className="h-4 w-4" />
                        <Label className="text-sm">Auto-save changes</Label>
                    </div>
                    <Switch
                        checked={data.autoSaveEnabled}
                        onCheckedChange={store.setAutoSave}
                    />
                </div>

                {/* Cloud Sync (placeholder) */}
                <div className="flex items-center justify-between opacity-50">
                    <div className="flex items-center gap-2">
                        <Cloud className="h-4 w-4" />
                        <div>
                            <Label className="text-sm">Cloud Sync</Label>
                            <p className="text-xs text-muted-foreground">Coming soon</p>
                        </div>
                    </div>
                    <Switch
                        disabled
                        checked={data.cloudSyncEnabled}
                        onCheckedChange={store.setCloudSync}
                    />
                </div>

                {/* Export/Import */}
                <div className="space-y-3 pt-2 border-t border-border/50">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={handleExport}
                        >
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>
                        <Button
                            variant="outline"
                            className="flex-1 gap-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="h-4 w-4" />
                            Import Data
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            className="hidden"
                        />
                    </div>

                    {data.lastExportDate && (
                        <p className="text-xs text-muted-foreground">
                            Last export: {format(data.lastExportDate, 'MMM d, yyyy HH:mm')}
                        </p>
                    )}
                </div>

                {/* Clear Data */}
                <div className="pt-2 border-t border-border/50">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="w-full gap-2">
                                <Trash2 className="h-4 w-4" />
                                Clear All Data
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="z-[200]">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all your local settings, widgets, and preferences.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleClearAllData} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                    Yes, delete everything
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        This action cannot be undone
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
