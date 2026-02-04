/**
 * Settings V2
 * Main settings modal orchestrator
 */

'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Palette, Timer, Link, Database, Image } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { TimerSettingsPanel } from './TimerSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { DataSettings } from './DataSettings';
import { BackgroundSettings } from './BackgroundSettings';
import { cn } from '@/lib/utils';

interface SettingsProps {
    onClose: () => void;
}

type SettingsTab = 'general' | 'timer' | 'integrations' | 'data' | 'background';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'data', label: 'Data', icon: Database },
];

export function Settings({ onClose }: SettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const [mounted, setMounted] = useState(false);

    // Wait for client-side mount to use createPortal
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const renderContent = () => {
        switch (activeTab) {
            case 'general':
                return <GeneralSettings />;
            case 'timer':
                return <TimerSettingsPanel />;
            case 'integrations':
                return <IntegrationSettings />;
            case 'data':
                return <DataSettings />;
            case 'background':
                return <BackgroundSettings />;
            default:
                return null;
        }
    };

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-3xl max-h-[85vh] bg-background border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">Settings</h2>
                    <Button
                        onClick={onClose}
                        size="icon"
                        variant="ghost"
                        className="hover:bg-accent hover:text-accent-foreground rounded-full"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Content */}
                <div className="flex flex-1 min-h-0">
                    {/* Sidebar */}
                    <div className="w-48 border-r border-border py-4">
                        <nav className="space-y-1 px-3">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                                        activeTab === id
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <ScrollArea className="flex-1">
                        <div className="p-6">
                            {renderContent()}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>,
        document.body
    );
}
