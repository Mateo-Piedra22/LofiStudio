/**
 * Audio System Constants v2
 * Configuration and definitions for ambient sounds
 */

import type { AmbientSoundDefinition, SoundCategory, AudioPreset, FadeConfig } from '../types/audio.types';

/**
 * Default fade configuration
 */
export const DEFAULT_FADE_CONFIG: FadeConfig = {
    duration: 500,
    easing: 'ease-out',
};

/**
 * Default crossfade configuration
 */
export const DEFAULT_CROSSFADE_CONFIG = {
    fadeOutDuration: 800,
    fadeInDuration: 800,
    overlap: 400,
};

/**
 * Default master volume
 */
export const DEFAULT_MASTER_VOLUME = 80;

/**
 * Category labels for display
 */
export const SOUND_CATEGORY_LABELS: Record<SoundCategory, string> = {
    nature: 'Nature',
    weather: 'Weather',
    urban: 'Urban',
    indoor: 'Indoor',
    abstract: 'Abstract',
};

/**
 * Category icons
 */
export const SOUND_CATEGORY_ICONS: Record<SoundCategory, string> = {
    nature: 'Trees',
    weather: 'Cloud',
    urban: 'Building2',
    indoor: 'Home',
    abstract: 'Sparkles',
};

/**
 * All ambient sound definitions
 */
export const AMBIENT_SOUNDS: AmbientSoundDefinition[] = [
    // Weather
    {
        id: 'light-rain',
        name: 'Light Rain',
        description: 'Gentle rainfall on windows',
        icon: 'CloudRain',
        category: 'weather',
        src: '/sounds/light-rain.mp3',
        defaultVolume: 50,
        tags: ['rain', 'calm', 'relaxing'],
    },
    {
        id: 'heavy-rain',
        name: 'Heavy Rain',
        description: 'Intense rainfall with occasional thunder',
        icon: 'CloudRain',
        category: 'weather',
        src: '/sounds/heavy-rain.mp3',
        defaultVolume: 40,
        tags: ['rain', 'storm', 'intense'],
    },
    {
        id: 'thunder-night',
        name: 'Thunder Storm',
        description: 'Distant thunder with rain',
        icon: 'CloudLightning',
        category: 'weather',
        src: '/sounds/thunder-night.mp3',
        defaultVolume: 35,
        tags: ['thunder', 'storm', 'night'],
    },
    {
        id: 'distant-thunder',
        name: 'Distant Thunder',
        description: 'Far away thunderstorm rumbles',
        icon: 'CloudLightning',
        category: 'weather',
        src: '/sounds/distant-thunder.mp3',
        defaultVolume: 30,
        tags: ['thunder', 'distant', 'ambient'],
    },
    {
        id: 'wind-breeze',
        name: 'Wind Breeze',
        description: 'Soft wind blowing through trees',
        icon: 'Wind',
        category: 'weather',
        src: '/sounds/wind-breeze.mp3',
        defaultVolume: 40,
        tags: ['wind', 'breeze', 'gentle'],
    },
    {
        id: 'snowfall',
        name: 'Snowfall',
        description: 'Quiet winter ambiance with soft wind',
        icon: 'Snowflake',
        category: 'weather',
        src: '/sounds/snowfall.mp3',
        defaultVolume: 35,
        tags: ['snow', 'winter', 'quiet'],
    },

    // Nature
    {
        id: 'forest-day',
        name: 'Forest Day',
        description: 'Birds and rustling leaves in daytime',
        icon: 'Trees',
        category: 'nature',
        src: '/sounds/forest-day.mp3',
        defaultVolume: 45,
        tags: ['forest', 'birds', 'daytime'],
    },
    {
        id: 'forest-night',
        name: 'Forest Night',
        description: 'Crickets and nocturnal sounds',
        icon: 'Moon',
        category: 'nature',
        src: '/sounds/forest-night.mp3',
        defaultVolume: 40,
        tags: ['forest', 'night', 'crickets'],
    },
    {
        id: 'ocean-waves',
        name: 'Ocean Waves',
        description: 'Waves crashing on the shore',
        icon: 'Waves',
        category: 'nature',
        src: '/sounds/ocean-waves.mp3',
        defaultVolume: 50,
        tags: ['ocean', 'waves', 'beach'],
    },
    {
        id: 'beach-waves',
        name: 'Beach Waves',
        description: 'Gentle beach waves',
        icon: 'Waves',
        category: 'nature',
        src: '/sounds/beach-waves.mp3',
        defaultVolume: 45,
        tags: ['beach', 'waves', 'relaxing'],
    },
    {
        id: 'river-stream',
        name: 'River Stream',
        description: 'Babbling brook and flowing water',
        icon: 'Droplets',
        category: 'nature',
        src: '/sounds/river-stream.mp3',
        defaultVolume: 45,
        tags: ['river', 'water', 'stream'],
    },
    {
        id: 'creek',
        name: 'Creek',
        description: 'Small creek with water sounds',
        icon: 'Droplets',
        category: 'nature',
        src: '/sounds/creek.mp3',
        defaultVolume: 40,
        tags: ['creek', 'water', 'nature'],
    },
    {
        id: 'waterfall-close',
        name: 'Waterfall',
        description: 'Close waterfall sounds',
        icon: 'Droplets',
        category: 'nature',
        src: '/sounds/waterfall-close.mp3',
        defaultVolume: 35,
        tags: ['waterfall', 'water', 'powerful'],
    },
    {
        id: 'meadow-birds',
        name: 'Meadow Birds',
        description: 'Birds singing in an open meadow',
        icon: 'Bird',
        category: 'nature',
        src: '/sounds/meadow-birds.mp3',
        defaultVolume: 40,
        tags: ['birds', 'meadow', 'morning'],
    },
    {
        id: 'meadow-night',
        name: 'Meadow Night',
        description: 'Nighttime meadow ambiance',
        icon: 'Moon',
        category: 'nature',
        src: '/sounds/meadow-night.mp3',
        defaultVolume: 35,
        tags: ['meadow', 'night', 'crickets'],
    },
    {
        id: 'leaves-rustling',
        name: 'Rustling Leaves',
        description: 'Leaves rustling in the wind',
        icon: 'Trees',
        category: 'nature',
        src: '/sounds/leaves-rustling.mp3',
        defaultVolume: 35,
        tags: ['leaves', 'wind', 'autumn'],
    },

    // Indoor
    {
        id: 'fireplace',
        name: 'Fireplace',
        description: 'Crackling fire with occasional pops',
        icon: 'Flame',
        category: 'indoor',
        src: '/sounds/fireplace.mp3',
        defaultVolume: 50,
        tags: ['fire', 'cozy', 'warm'],
    },
    {
        id: 'cafe-ambience',
        name: 'Coffee Shop',
        description: 'Busy café with soft chatter',
        icon: 'Coffee',
        category: 'indoor',
        src: '/sounds/cafe-ambience.mp3',
        defaultVolume: 35,
        tags: ['cafe', 'people', 'coffee'],
    },
    {
        id: 'library',
        name: 'Library',
        description: 'Quiet library with page turns',
        icon: 'BookOpen',
        category: 'indoor',
        src: '/sounds/library.mp3',
        defaultVolume: 25,
        tags: ['library', 'quiet', 'study'],
    },
    {
        id: 'office',
        name: 'Office',
        description: 'Office ambiance with typing',
        icon: 'Building2',
        category: 'indoor',
        src: '/sounds/office.mp3',
        defaultVolume: 30,
        tags: ['office', 'work', 'typing'],
    },
    {
        id: 'tent-rain',
        name: 'Rain on Tent',
        description: 'Rain falling on a camping tent',
        icon: 'CloudRain',
        category: 'indoor',
        src: '/sounds/tent-rain.mp3',
        defaultVolume: 45,
        tags: ['tent', 'rain', 'camping'],
    },

    // Urban
    {
        id: 'city-traffic',
        name: 'City Traffic',
        description: 'Urban traffic sounds',
        icon: 'Car',
        category: 'urban',
        src: '/sounds/city-traffic.mp3',
        defaultVolume: 25,
        tags: ['city', 'traffic', 'urban'],
    },
    {
        id: 'night-city',
        name: 'Night City',
        description: 'Nighttime city ambiance',
        icon: 'Building2',
        category: 'urban',
        src: '/sounds/night-city.mp3',
        defaultVolume: 30,
        tags: ['city', 'night', 'urban'],
    },
    {
        id: 'rainy-street',
        name: 'Rainy Street',
        description: 'Rain on city streets',
        icon: 'CloudRain',
        category: 'urban',
        src: '/sounds/rainy-street.mp3',
        defaultVolume: 40,
        tags: ['rain', 'street', 'urban'],
    },
    {
        id: 'city-park',
        name: 'City Park',
        description: 'Urban park with birds',
        icon: 'Trees',
        category: 'urban',
        src: '/sounds/city-park.mp3',
        defaultVolume: 35,
        tags: ['park', 'birds', 'urban'],
    },
    {
        id: 'subway-station',
        name: 'Subway',
        description: 'Underground subway station',
        icon: 'Train',
        category: 'urban',
        src: '/sounds/subway-station.mp3',
        defaultVolume: 25,
        tags: ['subway', 'train', 'underground'],
    },
    {
        id: 'train-interior',
        name: 'Train Journey',
        description: 'Inside a moving train',
        icon: 'Train',
        category: 'urban',
        src: '/sounds/train-interior.mp3',
        defaultVolume: 35,
        tags: ['train', 'travel', 'moving'],
    },

    // Abstract / White Noise
    {
        id: 'white-noise',
        name: 'White Noise',
        description: 'Pure white noise for focus',
        icon: 'Radio',
        category: 'abstract',
        src: '/sounds/white-noise.mp3',
        defaultVolume: 30,
        tags: ['noise', 'focus', 'sleep'],
    },
    {
        id: 'ocean-deep',
        name: 'Deep Ocean',
        description: 'Deep underwater ambiance',
        icon: 'Waves',
        category: 'abstract',
        src: '/sounds/ocean-deep.mp3',
        defaultVolume: 35,
        tags: ['ocean', 'deep', 'underwater'],
    },
];

/**
 * Get sounds by category
 */
export function getSoundsByCategory(category: SoundCategory): AmbientSoundDefinition[] {
    return AMBIENT_SOUNDS.filter(s => s.category === category);
}

/**
 * Get sound by ID
 */
export function getSoundById(id: string): AmbientSoundDefinition | undefined {
    return AMBIENT_SOUNDS.find(s => s.id === id);
}

/**
 * Get all categories with their sounds
 */
export function getSoundsGroupedByCategory(): Record<SoundCategory, AmbientSoundDefinition[]> {
    return AMBIENT_SOUNDS.reduce((acc, sound) => {
        if (!acc[sound.category]) {
            acc[sound.category] = [];
        }
        acc[sound.category].push(sound);
        return acc;
    }, {} as Record<SoundCategory, AmbientSoundDefinition[]>);
}

/**
 * Audio presets for quick setup
 */
export const AUDIO_PRESETS: AudioPreset[] = [
    {
        id: 'rainy-cafe',
        name: 'Rainy Café',
        description: 'Cozy coffee shop on a rainy day',
        icon: 'Coffee',
        sounds: [
            { id: 'light-rain', volume: 40 },
            { id: 'cafe-ambience', volume: 35 },
        ],
    },
    {
        id: 'forest-retreat',
        name: 'Forest Retreat',
        description: 'Peaceful forest with birds',
        icon: 'Trees',
        sounds: [
            { id: 'forest-day', volume: 50 },
            { id: 'river-stream', volume: 30 },
        ],
    },
    {
        id: 'cozy-night',
        name: 'Cozy Night',
        description: 'Fireplace and light rain',
        icon: 'Flame',
        sounds: [
            { id: 'fireplace', volume: 55 },
            { id: 'light-rain', volume: 25 },
        ],
    },
    {
        id: 'deep-focus',
        name: 'Deep Focus',
        description: 'Minimal distractions for work',
        icon: 'Target',
        sounds: [
            { id: 'white-noise', volume: 25 },
            { id: 'library', volume: 15 },
        ],
    },
    {
        id: 'ocean-breeze',
        name: 'Ocean Breeze',
        description: 'Beach waves with gentle wind',
        icon: 'Waves',
        sounds: [
            { id: 'ocean-waves', volume: 50 },
            { id: 'wind-breeze', volume: 25 },
        ],
    },
    {
        id: 'thunderstorm',
        name: 'Thunderstorm',
        description: 'Dramatic storm ambiance',
        icon: 'CloudLightning',
        sounds: [
            { id: 'heavy-rain', volume: 45 },
            { id: 'thunder-night', volume: 40 },
        ],
    },
];

/**
 * Get audio preset by ID
 */
export function getAudioPreset(id: string): AudioPreset | undefined {
    return AUDIO_PRESETS.find(p => p.id === id);
}
