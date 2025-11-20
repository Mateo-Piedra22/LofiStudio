'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, RefreshCw } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const AVATAR_STYLES = [
    'adventurer',
    'adventurer-neutral',
    'avataaars',
    'big-ears',
    'big-ears-neutral',
    'big-smile',
    'bottts',
    'croodles',
    'croodles-neutral',
    'fun-emoji',
    'icons',
    'identicon',
    'initials',
    'lorelei',
    'lorelei-neutral',
    'micah',
    'miniavs',
    'notionists',
    'notionists-neutral',
    'open-peeps',
    'personas',
    'pixel-art',
    'pixel-art-neutral',
    'shapes',
    'thumbs',
];

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
    const { data: session, update } = useSession();
    const [selectedStyle, setSelectedStyle] = useState('notionists');
    const [seed, setSeed] = useState(session?.user?.name || 'lofi');
    const [customUrl, setCustomUrl] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const router = useRouter();

    const currentAvatarUrl = customUrl || `https://api.dicebear.com/9.x/${selectedStyle}/svg?seed=${seed}`;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: currentAvatarUrl }),
            });

            if (res.ok) {
                await update({ image: currentAvatarUrl });
                router.refresh();
                onClose();
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const randomize = () => {
        setSeed(Math.random().toString(36).substring(7));
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] glass border-border text-foreground">
                <DialogHeader>
                    <DialogTitle>Customize Profile</DialogTitle>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <Avatar className="h-32 w-32 border-4 border-border shadow-xl">
                            <AvatarImage src={currentAvatarUrl} />
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>

                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={randomize}>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Randomize
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Avatar Style</label>
                            <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {AVATAR_STYLES.map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => {
                                            setSelectedStyle(style);
                                            setCustomUrl('');
                                        }}
                                        className={`text-xs p-2 rounded border ${selectedStyle === style && !customUrl
                                                ? 'bg-primary/20 border-primary text-primary'
                                                : 'border-border hover:bg-accent/10'
                                            }`}
                                    >
                                        {style}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium mb-2 block">Or Custom URL</label>
                            <Input
                                value={customUrl}
                                onChange={(e) => setCustomUrl(e.target.value)}
                                placeholder="https://..."
                                className="bg-background/50 border-border"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
