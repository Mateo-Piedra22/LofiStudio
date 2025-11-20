# LofiStudio - Características Detalladas

## Visión General
- Espacio de trabajo productivo con widgets, música lofi y diseño glassmorphism.
- Grid fijo `3x3` con columnas y filas que rellenan el alto completo.
- Persistencia de preferencias y ajustes.

## Widgets
- Reloj: hora en tiempo real, tipografía adaptable.
- Clima: ciudad configurable, geolocalización, temperaturas y métricas; modo compacto automático por altura/breakpoint.
- GIF: categorías temáticas; consumo vía API Giphy con cache.
- Tareas: crear/editar/finalizar; fecha/hora y color; editor inline con lápiz; persistencia local/cloud.
- Notas: texto rápido con guardado automático.
- Citas: categorías motivación/paz/enfoque; proxy local `/api/quote` y fallback; multilenguaje.
- Calendario: vista mensual; dots por color; modal de tareas por día ordenadas por hora; completar/editar.
- Respiración: patrones guiados con animaciones.
- Diccionario: definiciones rápidas.
- Timer Pomodoro: sesiones, notificaciones y estadísticas.

## Integraciones
- Google OAuth (NextAuth v5).
- Scopes dinámicos según toggles (Calendar/Tasks).
- Consentimiento tras login y re‑auth si faltan permisos.
- Aviso en topbar y en modo Zen para completar permisos.

## Layout y Edición
- Drag & drop con límites; intercambio de posiciones.
- Edición de layout con dock glassmorphism; inputs interactivos no-drag.
- Modo libre (premium) visible como inactivo.

## Modo Zen
- Oculta UI (topbar, dock, modales, player), mantiene widgets visibles.
- Salida con `Esc` y botón de ojo en esquina superior derecha.

## Temas y Estilo
- Claro/Oscuro/Auto.
- Glassmorphism tokenizado con `--glass-opacity` y persistencia en Settings.
 - Selector de fondos con imágenes de Unsplash sin API key.

## Backend y Persistencia
- Rutas API para YouTube, Weather, Giphy y Quote (proxy con timeout y revalidate).
- Drizzle ORM + Neon PostgreSQL opcional.
- Auto‑creación de tablas en arranque si existe `DATABASE_URL`.
 - Service Worker con `NetworkFirst` para documentos y `Stale-While-Revalidate` para estáticos e imágenes.

## Páginas
- Error: `app/not-found.tsx`, `app/error.tsx`.
- Información: `app/about/page.tsx`.
- Legales y Privacidad: `app/legal/page.tsx`.
- Términos y Condiciones: `app/terms/page.tsx`.

## Atajos
- `Ctrl + E` editar layout, `Ctrl + ,` settings, `Ctrl + S` stats, `Ctrl + L` logs.
- `Shift + ?` ayuda, `Alt + Z` zen, `Esc` cerrar/salir.
 - `Ctrl + K` Command Palette.

## APIs Externas
- YouTube Data API v3: búsqueda y reproducción.
- OpenWeather: clima por ciudad/geo.
 - Open‑Meteo: fallback con geocoding y mapeo WMO a iconos/descripciones.
- Giphy: GIFs temáticos.
- Free Dictionary: definiciones.
- Quotable: citas vía proxy `/api/quote`.

## Seguridad
- Variables de entorno y secretos nunca se registran.
- Autenticación con NextAuth; adapter Drizzle solo si hay DB.
- Scopes mínimos y solo bajo consentimiento explícito.
 - Banner de cookies con categorías y consentimiento; analíticas condicionadas.

## Footer y Privacidad
- Footer flotante con enlaces a About, Legales, Términos y Cookies.
- Aviso de privacidad resumido en primer login.

## Variables de Entorno
- `NEXTAUTH_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- `DATABASE_URL` para Neon.
- `YOUTUBE_API_KEY`, `WEATHER_API_KEY`, `GIPHY_API_KEY`.