'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import Link from 'next/link';
import {
    X, Home, Settings, Info, Sparkles, Scale, FileText, Cookie,
    LogOut, User as UserIcon, Palette, Image as ImageIcon,
    Maximize2, Minimize2, Eye, EyeOff, Monitor, Sun, Moon,
    Waves, Layout, BarChart3, Keyboard, Heart, Share2, Volume2, Move, PanelTop
} from 'lucide-react';
import { useTheme, useSettingsStore, useGlassOpacity } from '@/lib/stores/settings.store';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStudio } from '../StudioProvider';
import { useAudioStore } from '@/lib/stores/audio.store';
import { useWidgetGridStore } from '@/lib/stores/widget-grid.store';
import { cn } from '@/lib/utils';

interface StudioSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export function StudioSidebar({ isOpen, onClose }: StudioSidebarProps) {
    const { data: session } = useSession();
    const [theme, setTheme] = useTheme();
    const { setMixerOpen } = useAudioStore();
    const isEditMode = useWidgetGridStore(s => s.isEditMode);
    const toggleEditMode = useWidgetGridStore(s => s.toggleEditMode);
    const showHeaders = useWidgetGridStore(s => s.showHeaders);
    const setShowHeaders = useWidgetGridStore(s => s.setShowHeaders);
    const [glass, setGlass] = useGlassOpacity();

    const {
        isZenMode,
        toggleZenMode,
        setIsTopbarHidden,
        setShowWidgetManager
    } = useStudio();

    // Helper for dispatching custom events
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
                stiffness: 350,
                damping: 35,
                mass: 1
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
        onClose(); // Auto close on action ? Maybe user wants to keep it open. Let's close for mobile feels.
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
                    />

                    {/* Sidebar */}
                    <motion.aside
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className="fixed top-0 left-0 bottom-0 w-[85vw] md:w-[360px] bg-[#09090b] border-r border-white/5 z-[100] shadow-[10px_0_50px_-10px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className="absolute top-[-10%] left-[-20%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

                        {/* Header */}
                        <div className="relative px-6 pt-6 pb-4 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                                    <Waves className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                                    LofiStudio
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={onClose}
                                className="h-9 w-9 rounded-full bg-white/5 hover:bg-white/10 hover:text-white transition-all hover:rotate-90"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* User Profile Card */}
                        <div className="px-6 mb-6 z-10">
                            {session ? (
                                <div className="group relative overflow-hidden rounded-2xl bg-white/[0.03] border border-white/5 p-4 transition-all hover:bg-white/[0.05]">
                                    <div className="flex items-center gap-4">
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 border-2 border-white/10 shadow-md">
                                                <AvatarImage src={session.user?.image || ''} />
                                                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                                    {session.user?.name?.[0] || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#18181b]" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-white truncate w-full">
                                                {session.user?.name || "User"}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate w-full">
                                                {session.user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    {/* Subtle Premium Badge */}
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-200/20 to-yellow-400/20 border border-yellow-500/30 text-[10px] font-bold text-yellow-200 uppercase tracking-wide">
                                            Free Plan
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <Button
                                    onClick={() => dispatch('open-reauth')}
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white shadow-lg shadow-purple-900/20"
                                >
                                    <UserIcon className="w-4 h-4 mr-2" />
                                    Sign In / Join
                                </Button>
                            )}
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-6 custom-scrollbar relative z-10">

                            {/* Studio Controls */}
                            <section>
                                <SectionHeader label="Studio Controls" />
                                <div className="grid gap-1">
                                    <SidebarButton
                                        icon={Volume2}
                                        label="Ambient Mixer"
                                        onClick={() => setMixerOpen(true)}
                                        description="Adjust soundscapes"
                                    />
                                    <SidebarButton
                                        icon={ImageIcon}
                                        label="Change Background"
                                        onClick={() => dispatch('open-background-selector')}
                                        description="Themes & Videos"
                                    />
                                    <SidebarButton
                                        icon={Layout}
                                        label="Widget Manager"
                                        onClick={() => dispatch('open-widget-manager')}
                                        description="Add or remove widgets"
                                    />
                                </div>
                            </section>

                            <Separator />

                            {/* Interface & Layout */}
                            <section>
                                <SectionHeader label="Interface & Layout" />
                                <div className="grid gap-1 mb-4">
                                    <SidebarButton
                                        icon={Move}
                                        label={isEditMode ? "Done Editing" : "Edit Layout"}
                                        onClick={toggleEditMode}
                                        active={isEditMode}
                                        description="Move & Resize widgets"
                                    />
                                    <SidebarButton
                                        icon={PanelTop}
                                        label={showHeaders ? "Hide Headers" : "Show Headers"}
                                        onClick={() => setShowHeaders(!showHeaders)}
                                        active={showHeaders}
                                        description="Toggle widget titles"
                                    />
                                    <SidebarButton
                                        icon={isZenMode ? Eye : EyeOff}
                                        label={isZenMode ? "Exit Zen Mode" : "Zen Mode"}
                                        onClick={toggleZenMode}
                                        active={isZenMode}
                                        description="Hide UI for focus"
                                    />
                                </div>

                                {/* Glass Opacity Slider */}
                                <div className="px-3 py-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-medium text-gray-400">Glass Opacity</span>
                                        <span className="text-xs font-mono text-primary">{glass}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={glass}
                                        onChange={(e) => setGlass(Number(e.target.value))}
                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </section>

                            <Separator />

                            {/* Appearance */}
                            <section>
                                <SectionHeader label="Theme & Display" />
                                <div className="bg-white/[0.02] rounded-xl p-1 border border-white/5 flex mb-2">
                                    <ThemeOption mode="light" current={theme} set={setTheme} icon={Sun} />
                                    <ThemeOption mode="dark" current={theme} set={setTheme} icon={Moon} />
                                    <ThemeOption mode="auto" current={theme} set={setTheme} icon={Monitor} />
                                </div>
                                <SidebarButton
                                    icon={Palette}
                                    label="Theme Settings"
                                    onClick={() => dispatch('open-settings')}
                                />
                            </section>

                            <Separator />

                            {/* Tools */}
                            <section>
                                <SectionHeader label="Productivity" />
                                <div className="grid gap-1">
                                    <SidebarButton
                                        icon={BarChart3}
                                        label="Statistics"
                                        onClick={() => dispatch('open-stats')}
                                    />
                                    <SidebarButton
                                        icon={Keyboard}
                                        label="Activity Log"
                                        onClick={() => dispatch('open-logs')}
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

                            <Separator />

                            {/* Links */}
                            <section>
                                <SectionHeader label="Resources" />
                                <div className="grid gap-1">
                                    <SidebarLink href="/" icon={Home} label="Home Page" />
                                    <SidebarLink href="/changelog" icon={Sparkles} label="What's New" />
                                    <SidebarLink href="/about" icon={Info} label="About LofiStudio" />
                                </div>
                            </section>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-white/5 bg-black/40 relative z-10">
                            {session && (
                                <button
                                    onClick={() => signOut()}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mb-4"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Sign Out
                                </button>
                            )}

                            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground/60">
                                <Link href="/legal" className="hover:text-white transition-colors">Legal</Link>
                                <span>•</span>
                                <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
                                <span>•</span>
                                <Link href="/cookies" className="hover:text-white transition-colors">Privacy</Link>
                            </div>

                            <div className="mt-4 text-center">
                                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-[10px] font-medium text-muted-foreground">v1.5.0 Stable</span>
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

// ==========================================
// Subcomponents
// ==========================================

function SectionHeader({ label }: { label: string }) {
    return (
        <h3 className="text-[11px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 mb-2 select-none">
            {label}
        </h3>
    );
}

function Separator() {
    return <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent my-1" />;
}

interface SidebarButtonProps {
    icon: any;
    label: string;
    onClick: () => void;
    active?: boolean;
    description?: string;
}

function SidebarButton({ icon: Icon, label, onClick, active, description }: SidebarButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200",
                active
                    ? "bg-primary/10 text-primary"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
            )}
        >
            <Icon className={cn("w-5 h-5", active ? "text-primary" : "text-gray-500 group-hover:text-white transition-colors")} />
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-none">{label}</div>
                {description && (
                    <div className="text-[10px] text-muted-foreground/50 mt-1 truncate group-hover:text-muted-foreground transition-colors">
                        {description}
                    </div>
                )}
            </div>
            {active && <div className="w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_10px_var(--primary)]" />}
        </button>
    );
}

function SidebarLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
    return (
        <Link
            href={href}
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
        >
            <Icon className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            <span className="text-sm font-medium">{label}</span>
        </Link>
    );
}

function ThemeOption({ mode, current, set, icon: Icon }: { mode: string; current: string; set: (m: any) => void; icon: any }) {
    const isActive = current === mode;
    return (
        <button
            onClick={() => set(mode)}
            className={cn(
                "flex-1 flex items-center justify-center py-1.5 rounded-lg transition-all",
                isActive
                    ? "bg-primary/20 text-primary shadow-sm"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
            )}
            title={`${mode.charAt(0).toUpperCase() + mode.slice(1)} Mode`}
        >
            <Icon className="w-4 h-4" />
        </button>
    );
}
