'use client';

import { SCENES } from '@/lib/data/scenes';
import { useBackgroundStore } from '@/lib/stores/background.store';
import { Check } from 'lucide-react';

export function SceneGrid() {
    const currentSceneId = useBackgroundStore(s => s.currentSceneId);
    const currentVariantId = useBackgroundStore(s => s.currentVariantId);
    const setCurrentScene = useBackgroundStore(s => s.setCurrentScene);
    const setVideoBackground = useBackgroundStore(s => s.setVideoBackground);

    // If no scene selected, default to first one
    const activeSceneId = currentSceneId || SCENES[0]?.id;
    const activeScene = SCENES.find(s => s.id === activeSceneId);

    const handleSceneClick = (sceneId: string) => {
        // Find default variant for this scene (usually first one)
        const scene = SCENES.find(s => s.id === sceneId);
        if (scene && scene.variants.length > 0) {
            const variant = scene.variants[0];
            setVideoBackground(variant.youtubeId);
            setCurrentScene(sceneId, variant.id);
        }
    };

    const handleVariantClick = (variant: typeof SCENES[0]['variants'][0]) => {
        setVideoBackground(variant.youtubeId);
        setCurrentScene(activeSceneId, variant.id);
    };

    return (
        <div className="space-y-6">
            {/* Main Categories / Scenes */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SCENES.map((scene) => (
                    <button
                        key={scene.id}
                        onClick={() => handleSceneClick(scene.id)}
                        className={`
                            relative group overflow-hidden rounded-xl border transition-all aspect-video
                            ${activeSceneId === scene.id ? 'border-primary ring-2 ring-primary/30' : 'border-border opacity-70 hover:opacity-100'}
                        `}
                    >
                        <img
                            src={scene.thumbnail}
                            alt={scene.name}
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-3 left-3 text-left">
                            <div className="font-medium text-white text-sm">{scene.name}</div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Variants for active scene */}
            {activeScene && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">
                        Variations: {activeScene.name}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {activeScene.variants.map((variant) => {
                            const isActive = currentVariantId === variant.id && activeSceneId === currentSceneId;
                            return (
                                <button
                                    key={variant.id}
                                    onClick={() => handleVariantClick(variant)}
                                    className={`
                                        relative group overflow-hidden rounded-lg border transition-all aspect-video
                                        ${isActive ? 'border-primary ring-2 ring-primary/50' : 'border-border/50 hover:border-foreground/50'}
                                    `}
                                >
                                    <img
                                        src={`https://img.youtube.com/vi/${variant.youtubeId}/mqdefault.jpg`}
                                        alt={variant.name}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                    <div className={`
                                        absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity
                                        ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                                    `}>
                                        {isActive && <Check className="w-6 h-6 text-white drop-shadow-md" />}
                                    </div>
                                    <div className="absolute bottom-1 left-2 text-[10px] text-white/90 font-medium drop-shadow-md">
                                        {variant.name}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
