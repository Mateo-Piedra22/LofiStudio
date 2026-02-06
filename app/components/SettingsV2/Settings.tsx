/**
 * Settings V2
 * Main settings modal orchestrator
 */

'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Palette, Timer, Link, Database, Image, LogOut } from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { TimerSettingsPanel } from './TimerSettings';
import { IntegrationSettings } from './IntegrationSettings';
import { DataSettings } from './DataSettings';
import { BackgroundSettings } from './BackgroundSettings';
import { cn } from '@/lib/utils';
import { signOut, useSession } from 'next-auth/react';

interface SettingsProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Backwards compatibility for now if needed, though we will update parent
    onClose?: () => void;
}

type SettingsTab = 'general' | 'timer' | 'integrations' | 'data' | 'background';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'General', icon: Palette },
    { id: 'timer', label: 'Timer', icon: Timer },
    { id: 'background', label: 'Background', icon: Image },
    { id: 'integrations', label: 'Integrations', icon: Link },
    { id: 'data', label: 'Data', icon: Database },
];

export function Settings({ open, onOpenChange, onClose }: SettingsProps) {
    const [activeTab, setActiveTab] = useState<SettingsTab>('general');
    const { data: session } = useSession();

    // Handle internal onClose mapping
    const handleOpenChange = (newOpen: boolean) => {
        onOpenChange?.(newOpen);
        if (!newOpen && onClose) onClose();
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return <GeneralSettings />;
            case 'timer': return <TimerSettingsPanel />;
            case 'integrations': return <IntegrationSettings />;
            case 'data': return <DataSettings />;
            case 'background': return <BackgroundSettings />;
            default: return null;
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-[95vw] md:max-w-4xl h-[85vh] md:h-[80vh] p-0 gap-0 overflow-hidden flex flex-col md:flex-row bg-background/95 backdrop-blur-xl border-white/10 shadow-2xl z-[210]">
                {/* Sidebar (Mobile: Top Bar, Desktop: Left Sidebar) */}
                <div className="flex flex-col border-b md:border-b-0 md:border-r border-border md:w-64 bg-muted/30 shrink-0">
                    <DialogHeader className="p-4 md:p-6 pb-2 md:pb-6 text-left">
                        <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                            Settings
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground hidden md:block">
                            Manage your studio preferences
                        </DialogDescription>
                    </DialogHeader>

                    {/* Navigation */}
                    <div className="flex-1 w-full min-h-0 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto custom-scrollbar">
                        <nav className="flex md:flex-col gap-1 p-2 md:p-4">
                            {TABS.map(({ id, label, icon: Icon }) => (
                                <button
                                    key={id}
                                    onClick={() => setActiveTab(id)}
                                    className={cn(
                                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-[100px] md:min-w-0',
                                        activeTab === id
                                            ? 'bg-primary/10 text-primary shadow-sm'
                                            : 'text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground'
                                    )}
                                >
                                    <Icon className={cn("w-4 h-4", activeTab === id ? "text-primary" : "text-muted-foreground")} />
                                    {label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Footer User Profile (Desktop only) */}
                    <div className="hidden md:flex p-4 border-t border-border mt-auto">
                        {session ? (
                            <div className="w-full">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                                        {session.user?.name?.[0] || 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{session.user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full text-xs h-8 text-red-400 hover:text-red-500 hover:bg-red-500/10 border-red-500/20"
                                    onClick={() => signOut()}
                                >
                                    <LogOut className="w-3 h-3 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <div className="p-3 bg-primary/5 rounded-lg border border-primary/10 text-center w-full">
                                <p className="text-xs text-muted-foreground mb-2">Sync your data across devices</p>
                                <Button size="sm" className="w-full h-8 text-xs" onClick={() => window.dispatchEvent(new Event('open-reauth'))}>
                                    Sign In
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0 h-full bg-background/50">
                    <ScrollArea className="flex-1 h-full">
                        <div className="p-4 md:p-8 max-w-2xl mx-auto w-full pb-20">
                            {/* Mobile Title (Breadcrumb style) */}
                            <div className="md:hidden mb-6 pb-2 border-b border-border/50">
                                <h3 className="font-semibold text-lg flex items-center gap-2">
                                    {TABS.find(t => t.id === activeTab)?.label}
                                </h3>
                            </div>

                            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {renderContent()}
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
