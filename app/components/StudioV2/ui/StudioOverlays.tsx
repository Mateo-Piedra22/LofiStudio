'use client';

import { useStudio } from '../StudioProvider';
import { useToast, ToastContainer } from '@/app/components/Toast';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Eye } from 'lucide-react';

export function StudioOverlays() {
    const {
        isZenMode, toggleZenMode,
        privacyNoticeAccepted, acceptPrivacyNotice,
        showSettings, setShowSettings,
        needsReauth, handleReauth
    } = useStudio();

    const toast = useToast();

    return (
        <>
            <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />

            {/* Zen Mode Exit Button */}
            {isZenMode && (
                <div className="fixed top-4 right-4 z-[100]">
                    <Button
                        onClick={toggleZenMode}
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full glass border"
                    >
                        <Eye className="w-5 h-5" />
                    </Button>
                    {needsReauth && (
                        <Button
                            onClick={handleReauth}
                            variant="secondary"
                            size="sm"
                            className="mt-2 glass border h-8 block"
                        >
                            Complete permissions
                        </Button>
                    )}
                </div>
            )}

            {/* Mobile Settings Trigger (Bottom Right) */}
            {!isZenMode && !showSettings && (
                <div className="md:hidden fixed bottom-20 right-4 z-[30]">
                    <Button
                        onClick={() => setShowSettings(true)}
                        variant="secondary"
                        size="icon"
                        className="h-10 w-10 rounded-full shadow-lg"
                    >
                        <SettingsIcon className="w-5 h-5" />
                    </Button>
                </div>
            )}

            {/* Privacy Notice */}
            {!isZenMode && !privacyNoticeAccepted && (
                <div className="fixed top-20 right-4 z-[50] animate-in slide-in-from-right-4 fade-in duration-500">
                    <div className="glass-panel rounded-2xl border px-4 py-3 w-[340px] shadow-xl">
                        <p className="text-sm font-medium text-foreground">Privacy</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            We store the minimum necessary: session and preferences.
                            You can review Legal and Cookies in the footer.
                        </p>
                        <div className="mt-3 flex items-center justify-end gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={acceptPrivacyNotice}
                            >
                                Close
                            </Button>
                            <Button
                                size="sm"
                                onClick={acceptPrivacyNotice}
                            >
                                Accept
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
