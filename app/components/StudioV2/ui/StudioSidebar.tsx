'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
    X, Home, Settings, Info, Sparkles, Scale, FileText, Cookie,
    LogOut, User as UserIcon, Palette, Image as ImageIcon,
    Maximize2, Minimize2, Eye, EyeOff, Monitor, Sun, Moon,
    Waves, Layout, BarChart3, Keyboard
} from 'lucide-react';
import { useTheme } from '@/lib/stores/settings.store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudio } from '../StudioProvider';
import { useAudioStore } from '@/lib/stores/audio.store';

interface StudioSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StudioSidebar({ isOpen, onClose }: StudioSidebarProps) {
    const { data: session } = useSession();
    const [theme, setTheme] = useTheme();
    const { setMixerOpen } = useAudioStore();
    const {
        isZenMode,
        toggleZenMode,
        setIsTopbarHidden,
        setShowWidgetManager
    } = useStudio(); // Assuming these exist in useStudio or we dispatch events

    // Helper for dispatching custom events (legacy support)
    const dispatch = (event: string) => {
        try { window.dispatchEvent(new Event(event)); } catch { }
    };

    // Close on escape
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Animation variants
    const sidebarVariants: Variants = {
        closed: { x: '-100%', opacity: 0 },
        open: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 300,
                damping: 30
            }
        }
    };

    const overlayVariants = {
        closed: { opacity: 0 },
        open: { opacity: 1 }
    };

    // Quick Actions Handling
    const handleAction = (action: () => void) => {
        action();
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={overlayVariants}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className="fixed top-0 left-0 bottom-0 w-[85vw] md:w-[320px] bg-background/80 backdrop-blur-xl border-r border-white/10 z-[60] shadow-2xl flex flex-col"
                    >
                        {/* Header / User Profile */}
                        <div className="p-6 pb-4 border-b border-white/5">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
                                    LofiStudio
                                </h2>
                                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>

                            {session ? (
                                <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <Avatar className="h-10 w-10 border border-white/10">
                                        <AvatarImage src={session.user?.image || ''} />
                                        <AvatarFallback>{session.user?.name?.[0] || 'U'}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{session.user?.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => dispatch('open-reauth')}
                                    className="w-full justify-start gap-2"
                                    variant="outline"
                                >
                                    <UserIcon className="w-4 h-4" />
                                    Sign In / Register
                                </Button>
                            )}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">

                            {/* Studio Controls */}
                            <section>
                                <p className="text-xs font-medium text-muted-foreground mb-3 px-2 uppercase tracking-wider">
                                    Studio Controls
                                </p>
                                <div className="space-y-1">
                                    <SidebarButton
                                        icon={Waves}
                                        label="Ambient Mixer"
                                        onClick={() => handleAction(() => setMixerOpen(true))}
                                    />
                                    <SidebarButton
                                        icon={ImageIcon}
                                        label="Change Background"
                                        onClick={() => handleAction(() => dispatch('open-background-selector'))}
                                    />
                                    <SidebarButton
                                        icon={Layout}
                                        label="Add Widgets"
                                        onClick={() => handleAction(() => dispatch('open-widget-manager'))}
                                    />
                                    <SidebarButton
                                        icon={EyeOff}
                                        label={isZenMode ? "Exit Zen Mode" : "Zen Mode"}
                                        onClick={() => handleAction(toggleZenMode)}
                                        active={isZenMode}
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-white/5 mx-2" />

                            {/* Appearance */}
                            <section>
                                <p className="text-xs font-medium text-muted-foreground mb-3 px-2 uppercase tracking-wider">
                                    Appearance
                                </p>
                                <div className="grid grid-cols-3 gap-2 px-2 mb-2">
                                    <ThemeButton mode="light" current={theme} set={setTheme} icon={Sun} label="Light" />
                                    <ThemeButton mode="dark" current={theme} set={setTheme} icon={Moon} label="Dark" />
                                    <ThemeButton mode="auto" current={theme} set={setTheme} icon={Monitor} label="Auto" />
                                </div>
                                <SidebarButton
                                    icon={Palette}
                                    label="Theme Settings"
                                    onClick={() => handleAction(() => dispatch('open-settings'))}
                                />
                            </section>

                            <div className="h-px bg-white/5 mx-2" />

                            {/* Tools & Stats */}
                            <section>
                                <p className="text-xs font-medium text-muted-foreground mb-3 px-2 uppercase tracking-wider">
                                    Tools
                                </p>
                                <div className="space-y-1">
                                    <SidebarButton
                                        icon={BarChart3}
                                        label="Statistics"
                                        onClick={() => handleAction(() => dispatch('open-stats'))}
                                    />
                                    <SidebarButton
                                        icon={Keyboard}
                                        label="Activity Log"
                                        onClick={() => handleAction(() => dispatch('open-logs'))}
                                    />
                                    <SidebarButton
                                        icon={Maximize2}
                                        label="Fullscreen"
                                        onClick={() => {
                                            if (document.fullscreenElement) document.exitFullscreen();
                                            else document.documentElement.requestFullscreen();
                                            onClose();
                                        }}
                                    />
                                </div>
                            </section>

                            <div className="h-px bg-white/5 mx-2" />

                            {/* Navigation */}
                            <section>
                                <p className="text-xs font-medium text-muted-foreground mb-3 px-2 uppercase tracking-wider">
                                    Navigation
                                </p>
                                <div className="space-y-1">
                                    <SidebarLink href="/" icon={Home} label="Home" />
                                    <SidebarLink href="/changelog" icon={Sparkles} label="Changelog" />
                                    <SidebarLink href="/about" icon={Info} label="About Us" />
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-4 text-center">
                                <Link href="/legal" className="hover:text-foreground">Legal</Link>
                                <Link href="/terms" className="hover:text-foreground">Terms</Link>
                                <Link href="/cookies" className="hover:text-foreground">Cookies</Link>
                            </div>

                            {session && (
                                <Button
                                    onClick={() => signOut()}
                                    variant="ghost"
                                    className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            )}
                            <div className="flex justify-center mt-2">
                                <span className="text-[10px] text-muted-foreground/50">v1.5.0 • LofiStudio V2</span>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

// Subcomponents for cleaner code
function SidebarButton({ icon: Icon, label, onClick, active }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${active
                ? 'bg-primary/15 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );
}

function SidebarLink({ href, icon: Icon, label }: any) {
    return (
        <Link
            href={href}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
        >
            <Icon className="w-4 h-4" />
            {label}
        </Link>
    );
}

function ThemeButton({ mode, current, set, icon: Icon, label }: any) {
    const isActive = current === mode;
    return (
        <button
            onClick={() => set(mode)}
            className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${isActive
                ? 'bg-primary/10 border-primary text-primary'
                : 'bg-transparent border-transparent hover:bg-white/5 text-muted-foreground'
                }`}
        >
            <Icon className="w-4 h-4 mb-1" />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
