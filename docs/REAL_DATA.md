# Real Data Integrations

## Overview
LofiStudio relies on live APIs to provide a dynamic experience. No mock data is used in production components.

## API Services

### 1. Weather
- **Provider**: OpenWeatherMap (Primary) / Open-Meteo (Fallback).
- **Route**: `/api/weather`
- **Frontend**: `WeatherWidget.tsx`
- **Features**: Live temperature, condition codes, city search.

### 2. Radio
- **Provider**: Radio Browser API (`de1.api.radio-browser.info`).
- **Use**: `RadioBrowser.tsx`.
- **Features**: Search by tag, country, or name. Plays streaming MP3/AAC links.

### 3. Unsplash (Backgrounds)
- **Provider**: Unsplash API.
- **Route**: `/api/unsplash` & `/api/unsplash/download`
- **Compliance**:
  - Triggers "Download Event" on selection (Hotlinking requirement).
  - Displays Photographer Name + Link (Attribution requirement).
  - Uses `utm_source` params.

### 4. YouTube
- **Provider**: YouTube Data API v3.
- **Route**: `/api/youtube/search`, `/api/youtube/video`.
- **Use**: Main Player for music/video backgrounds.

### 5. Other Utilities
- **Time**: Open-Meteo Geocoding for timezone resolution.
- **Dictionary**: DictionaryAPI.dev for definitions/audio.
- **Quotes**: Quotable.io for daily inspiration.

## Environment Variables
Ensure these are set in `.env.local`:
```
OPENWEATHER_API_KEY=...
UNSPLASH_ACCESS_KEY=...
YOUTUBE_API_KEY=...
```
