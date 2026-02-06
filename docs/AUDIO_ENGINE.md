# Audio Engine Documentation (V2)

## Overview
The audio engine is the heart of LofiStudio, designed for gapless, high-quality ambient mixing.

## Core Components

### 1. AudioManager (`lib/audio/AudioManager.ts`)
A singleton class that manages the `AudioContext`.
- **Preloading**: Uses `metadata` strategy to minimize bandwidth.
- **Error Handling**: Listens for `error` events on `Audio` elements and auto-recovers global state.
- **Fading**: Implements linear and exponential ramps for smooth volume transitions.
- **Mixer**: Supports multi-channel mixing (Rain + Jazz + Fireplace).

### 2. Audio Store (`lib/stores/audio.store.ts`)
Zustand store that persists user preferences.
- **State**: Master volume, active sounds list, mute state.
- **Actions**: `toggleSound`, `setVolume`, `stopAll`.

### 3. Sources
- **Local Assets**: stored in `public/sounds/`.
- **Format**: MP3 (Optimized 128kbps/192kbps).
- **Mapping**: Defined in `lib/constants/audio.ts`.

## Configuration
New sounds must be registered in `lib/constants/audio.ts`.

```typescript
{
    id: 'my-sound',
    name: 'My Sound',
    category: 'nature',
    src: '/sounds/my-sound.mp3',
    defaultVolume: 40
}
```

## Resilience
- **Network Failures**: The engine will emit an error event but continue playing other tracks.
- **Concurrency**: Manages max active `MediaElementSource` nodes to avoid browser limits.
