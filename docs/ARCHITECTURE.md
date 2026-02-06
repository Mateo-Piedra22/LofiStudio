# LofiStudio Architecture Documentation

## Overview
LofiStudio is a Next.js 14 application built for focus and relaxation. It features a customizable 3D/glassmorphic interface, real-time widgets, and a robust audio mixing engine.

## Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion (Animations)
- **State Management**: Zustand (with persistence)
- **Database**: Postgres (Neon via Drizzle ORM)
- **Auth**: NextAuth.js (Google, GitHub)
- **UI Components**: Radix UI (Primitives) + Custom "V2" Desgin System

## Directory Structure
```
/app
  /api              # Next.js API Routes (Server-side proxies)
  /components       # UI Components
    /BackgroundV2   # Dynamic Background System
    /StudioV2       # Main Application Core
    /WidgetsV2      # Individual Widgets (Weather, Timer, etc.)
    /WidgetGrid     # Drag-and-drop Grid System
  /studio           # Main application route
/lib
  /audio            # Web Audio API Engine
  /stores           # Zustand Stores (audio, player, settings, etc.)
  /types            # TypeScript Definitions
/public
  /sounds           # Local high-quality audio assets
```

## Core Systems

### 1. Studio V2 Architecture
The application has been refactored into a "Studio V2" modular architecture.
- **Entry**: `app/studio/page.tsx` -> `StudioClient.tsx` -> `StudioClientV2.tsx`
- **Providers**: `StudioProvider` handles global studio state (Zen mode, UI visibility).
- **Layout**: `StudioLayout` coordinates the layers:
  1. Background (`BackgroundV2`)
  2. Widget Grid (`WidgetGrid`)
  3. Overlays (`Player`, `AmbientMixer`)

### 2. Audio Engine
- **AudioManager**: Singleton class wrapper around Web Audio API.
- **Features**: Low-latency looping, gain control, crossfading, error recovery.
- **Optimization**: Uses `metadata` preload and `crossOrigin` support for CDNs.

### 3. Widget System
- **Grid**: Uses `dnd-kit` for drag-and-drop functionality.
- **Persistence**: Layouts are saved to localStorage and synced to DB (optional).
- **Extensibility**: New widgets are added to `WidgetRenderer` and `WidgetManager`.

## Data Flow
- **Client-Side**: Zustand stores handle immediate UI state (volume, active widgets).
- **Server-Side**: API Routes (`app/api/*`) act as secure proxies for third-party keys (Unsplash, Weather).
