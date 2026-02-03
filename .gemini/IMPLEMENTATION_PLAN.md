# 🎵 LofiStudio v2 - Plan de Reconstrucción Completa

> **Fecha de inicio:** 2026-02-01
> **Estado:** 🚧 En Progreso
> **Approach:** Radical - Reescritura completa de sistemas core

---

## 📋 Resumen Ejecutivo

Este documento detalla la reconstrucción completa de los sistemas críticos de LofiStudio:
- Sistema de Widget Grid
- Todos los Widgets (reescritura)
- Sistema de Audio Ambiental
- Sistema de Temas
- Responsividad Multi-dispositivo

**Principios de diseño:**
1. **Single Source of Truth** - Un solo lugar para cada tipo de estado
2. **Type Safety** - TypeScript estricto en todo el código
3. **Mobile First** - Diseñado primero para móvil, expandido a desktop
4. **Performance** - Mínimos re-renders, lazy loading donde sea posible
5. **Accessibility** - ARIA labels, keyboard navigation, focus management

---

## 🏗️ FASE 0: Preparación y Limpieza
> **Estado:** ✅ Completada

### 0.1 Estructura de Archivos Nueva
- [x] Crear estructura de carpetas para el nuevo sistema
- [x] Configurar paths en tsconfig si es necesario

### 0.2 Tipos Base
- [x] Crear `lib/types/widget.types.ts` - Tipos del sistema de widgets
- [x] Crear `lib/types/audio.types.ts` - Tipos del sistema de audio
- [x] Crear `lib/types/layout.types.ts` - Tipos del sistema de layout
- [x] Actualizar `lib/types/index.ts` con exports

### 0.3 Constantes y Configuración
- [x] Crear `lib/constants/breakpoints.ts` - Breakpoints del sistema
- [x] Crear `lib/constants/widgets.ts` - Definiciones de widgets
- [x] Crear `lib/constants/audio.ts` - Configuración de audio

---

## 🧩 FASE 1: Sistema de Widget Grid v2
> **Estado:** ✅ Completada

### 1.1 Core del Grid System
- [x] Crear `lib/stores/widget-grid.store.ts` - Store con Zustand para estado global
- [x] Crear `lib/hooks/useWidgetGrid.ts` - Hook principal del grid
- [x] Crear `lib/utils/grid-packing.ts` - Algoritmo de bin-packing 2D
- [x] Crear `lib/utils/grid-validation.ts` - Validación de constraints

### 1.2 Componentes del Grid
- [x] Crear `app/components/WidgetGrid/WidgetGrid.tsx` - Contenedor principal
- [x] Crear `app/components/WidgetGrid/WidgetSlot.tsx` - Slot para cada widget
- [x] Crear `app/components/WidgetGrid/WidgetDragOverlay.tsx` - Overlay durante drag
- [x] Crear `app/components/WidgetGrid/GridBackground.tsx` - Fondo del grid con guías

### 1.3 Sistema de Drag & Drop
- [x] Configurar DnD-Kit con sensors táctiles optimizados
- [x] Implementar collision detection personalizado para grid
- [x] Implementar swap logic entre widgets
- [x] Implementar animaciones de transición con Framer Motion

### 1.4 Persistencia
- [x] Implementar guardado de layouts por breakpoint
- [x] Implementar carga inicial de layouts
- [x] Implementar reset a defaults

---

## 🎨 FASE 2: Sistema de Widgets Estandarizado
> **Estado:** ✅ Completada

### 2.1 Componentes Base
- [x] Crear `app/components/WidgetBase/WidgetWrapper.tsx` - Wrapper universal
- [x] Crear `app/components/WidgetBase/WidgetHeader.tsx` - Header estandarizado
- [x] Crear `app/components/WidgetBase/WidgetContent.tsx` - Área de contenido
- [x] Crear `app/components/WidgetBase/WidgetIcon.tsx` - Iconos dinámicos
- [x] Crear `app/components/WidgetBase/WidgetSkeleton.tsx` - Loading state

### 2.2 Widgets Reescritos - Grupo 1 (Simples)
- [x] Reescribir `ClockWidget.tsx` - Reloj
- [x] Reescribir `WorldTimeWidget.tsx` - Zonas horarias
- [x] Reescribir `QuoteWidget.tsx` - Citas
- [x] Reescribir `NotesWidget.tsx` - Notas rápidas
- [x] Reescribir `CalculatorWidget.tsx` - Calculadora

### 2.3 Widgets Reescritos - Grupo 2 (Medios)
- [x] Reescribir `WeatherWidget.tsx` - Clima
- [x] Reescribir `GifWidget.tsx` - GIFs animados
- [x] Reescribir `DictionaryWidget.tsx` - Diccionario
- [x] Reescribir `BreathingWidget.tsx` - Ejercicios de respiración
- [x] Reescribir `DailyFocusWidget.tsx` - Focus diario
- [x] Reescribir `QuickLinksWidget.tsx` - Enlaces rápidos

### 2.4 Widgets Reescritos - Grupo 3 (Complejos)
- [x] Reescribir `CalendarWidget.tsx` - Calendario
- [x] Reescribir `TasksWidget.tsx` - Gestor de tareas
- [x] Reescribir `TimerWidget.tsx` - Timer Pomodoro
- [x] Reescribir `HabitTrackerWidget.tsx` - Tracker de hábitos
- [x] Reescribir `FlashcardWidget.tsx` - Flashcards
- [x] Reescribir `EmbedWidget.tsx` - Embeds externos

---

## 🔊 FASE 3: Sistema de Audio Ambiental v2
> **Estado:** ✅ Completada

### 3.1 Core del Audio System
- [x] Crear `lib/stores/audio.store.ts` - Store de estado de audio
- [x] Crear `lib/audio/AudioManager.ts` - Singleton para Web Audio API
- [x] Unlock para iOS/Android (integrado en AudioManager)
- [x] Crear `lib/hooks/useAmbientAudio.ts` - Hook para consumir audio

### 3.2 Componentes de Audio
- [x] Reescribir `AmbientMixerV2/AmbientMixer.tsx` - Mixer principal
- [x] Crear `AmbientMixerV2/AmbientSoundCard.tsx` - Tarjeta por sonido
- [x] Categorías integradas en AmbientMixer.tsx
- [x] VolumeSlider usando componente Slider de shadcn/ui

### 3.3 Funcionalidades de Audio
- [x] Implementar fade in/out al cambiar volumen
- [x] Implementar crossfade entre sonidos
- [x] Implementar persistencia de estado de audio
- [x] Implementar restauración automática al recargar
- [x] Implementar indicador de sonidos activos global

---

## 🎭 FASE 4: Sistema de Temas Mejorado
> **Estado:** ✅ Completada

### 4.1 Variables CSS Nuevas
- [x] Rediseñar variables en `globals.css` para tema claro (WCAG AA)
- [x] Agregar variables de contraste adaptativo
- [x] Agregar variables de glassmorphism por tema
- [x] Agregar variables de sombras por tema

### 4.2 Componentes de Tema
- [x] Mejorar `ThemeProvider.tsx` con detección de sistema
- [x] Crear hook `useTheme` con contexto completo
- [x] Crear animación de transición de tema
- [x] Crear componentes `ThemeToggle` y `ThemeSelector`
- [x] Asegurar contraste WCAG AA en ambos temas

### 4.3 Sistema de Transiciones
- [x] Implementar transiciones suaves entre temas
- [x] Implementar script de prevención de flash (ThemeScript)
- [x] Variables CSS de timing personalizables

---

## 📱 FASE 5: Responsividad Multi-dispositivo
> **Estado:** ✅ Completada

### 5.1 Sistema de Breakpoints
- [x] Definir breakpoints finales con comportamiento de grid
- [x] Implementar hook `useBreakpoint` mejorado con debounce
- [x] Implementar detección de orientación sin re-renders excesivos
- [x] Implementar hooks auxiliares (`useIsMobile`, `useIsTouch`, etc.)

### 5.2 Layouts por Breakpoint
- [x] Configurar layout lg (desktop 3 columnas)
- [x] Configurar layout md (tablet 2 columnas)
- [x] Configurar layout sm/xs (móvil 1 columna)
- [x] Implementar `ResponsiveContainer` con padding adaptativo

### 5.3 Touch Optimization
- [x] Implementar hook `useTouchGestures` (swipe, tap, long press, pinch)
- [x] Implementar hooks simplificados (`useSwipeGesture`, `useLongPress`)
- [x] Optimizar áreas de touch mínimas (44px)
- [x] Utilidades de visibilidad (`MobileOnly`, `DesktopOnly`, etc.)

### 5.4 Media Queries
- [x] Implementar hook `useMediaQuery`
- [x] Implementar `usePrefersReducedMotion`
- [x] Implementar `usePrefersDarkMode`
- [x] Implementar `usePrefersHighContrast`

---

## 🔧 FASE 6: Integración y Pulido
> **Estado:** ⏳ Pendiente

### 6.1 Integración de Sistemas
- [ ] Integrar nuevo grid en StudioClient
- [ ] Integrar nuevo sistema de audio
- [ ] Integrar nuevos widgets
- [ ] Remover código legacy

### 6.2 Widget Manager
- [ ] Reescribir `WidgetManager.tsx` con nuevo sistema
- [ ] Implementar preview de widgets antes de agregar
- [ ] Implementar búsqueda/filtrado de widgets

### 6.3 Presets
- [ ] Actualizar presets para nuevo sistema
- [ ] Implementar aplicación de presets con animación
- [ ] Implementar guardado de preset personalizado

### 6.4 Navegación y UX
- [ ] Actualizar `TopNavbar.tsx` para nuevo sistema
- [ ] Actualizar `CommandPalette.tsx` con acciones del nuevo sistema
- [ ] Actualizar keyboard shortcuts

### 6.5 Limpieza Final
- [ ] Remover archivos no usados
- [ ] Remover imports no usados
- [ ] Actualizar README.md
- [ ] Verificar build sin errores
- [ ] Verificar funcionamiento en producción

---

## 📊 Progreso General

| Fase | Items | Completados | Porcentaje |
|------|-------|-------------|------------|
| Fase 0 | 11 | 11 | 100% ✅ |
| Fase 1 | 16 | 16 | 100% ✅ |
| Fase 2 | 21 | 21 | 100% ✅ |
| Fase 3 | 13 | 13 | 100% ✅ |
| Fase 4 | 10 | 10 | 100% ✅ |
| Fase 5 | 15 | 15 | 100% ✅ |
| Fase 6 | 15 | 0 | 0% |
| **TOTAL** | **101** | **86** | **85%** |

---

## 📝 Notas de Implementación

### Decisiones Arquitectónicas
1. **Zustand para estado global** - Más simple que Redux, mejor que Context para performance
2. **DnD-Kit sobre react-beautiful-dnd** - Mejor soporte táctil, más moderno
3. **Web Audio API sobre Howler** - Más control, mejor crossfade, nativo
4. **CSS Grid sobre react-grid-layout** - Más predecible, better container queries

### Compatibilidad
- **Browsers:** Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- **Móvil:** iOS 14+, Android 10+
- **PWA:** Service Worker compatible

---

## 🔄 Changelog de Progreso

### Sesión Actual (2026-02-01)
- ✅ **Fase 0:** Tipos, constantes y estructura completados
- ✅ **Fase 1:** Widget Grid System v2 completado
- ✅ **Fase 2:** Todos los 17 widgets reescritos:
  - Simples: Clock, WorldTime, Quote, Notes, Calculator
  - Medios: Weather, GIF, Dictionary, Breathing, DailyFocus, QuickLinks
  - Complejos: Calendar, Tasks, Timer, HabitTracker, Flashcard, Embed
- ✅ **Fase 3:** Sistema de Audio v2 completado (AudioManager, store, hooks, AmbientMixerV2)
- ✅ **Fase 4:** Sistema de Temas v2 completado:
  - globals.css rediseñado con WCAG AA
  - ThemeProvider con useTheme hook
  - ThemeToggle y ThemeSelector components
  - Variables de glassmorphism y sombras por tema
- ✅ **Fase 5:** Responsividad completada:
  - useBreakpoint hook con debounce y orientación
  - ResponsiveContainer con utilidades
  - useTouchGestures para gestos móviles
  - useMediaQuery y hooks de preferencias

### Próximos Pasos
- 🚧 **Fase 6:** Integración final en StudioClient y pulido

---

## 📁 Archivos Creados

### Componentes (app/components/)
```
WidgetGrid/
  ├── index.ts
  ├── WidgetGrid.tsx
  ├── WidgetSlot.tsx
  ├── WidgetDragOverlay.tsx
  └── GridBackground.tsx

WidgetBase/
  ├── index.ts
  ├── WidgetWrapper.tsx
  ├── WidgetHeader.tsx
  ├── WidgetContent.tsx
  ├── WidgetIcon.tsx
  └── WidgetSkeleton.tsx

WidgetsV2/
  ├── index.ts
  ├── ClockWidget.tsx
  ├── QuoteWidget.tsx
  ├── NotesWidget.tsx
  ├── WeatherWidget.tsx
  ├── WorldTimeWidget.tsx
  ├── CalculatorWidget.tsx
  ├── TimerWidget.tsx
  ├── GifWidget.tsx
  ├── DictionaryWidget.tsx
  ├── BreathingWidget.tsx
  ├── DailyFocusWidget.tsx
  ├── QuickLinksWidget.tsx
  ├── CalendarWidget.tsx
  ├── TasksWidget.tsx
  ├── HabitTrackerWidget.tsx
  ├── FlashcardWidget.tsx
  └── EmbedWidget.tsx

AmbientMixerV2/
  ├── index.ts
  ├── AmbientMixer.tsx
  └── AmbientSoundCard.tsx

ResponsiveContainer/
  ├── index.ts
  └── ResponsiveContainer.tsx

ThemeProvider.tsx (actualizado)
```

### Bibliotecas (lib/)
```
stores/
  ├── index.ts
  ├── widget-grid.store.ts
  └── audio.store.ts

hooks/
  ├── index.ts
  ├── useWidgetGrid.ts
  ├── useAmbientAudio.ts
  ├── useBreakpoint.ts
  └── useTouchGestures.ts

audio/
  ├── index.ts
  └── AudioManager.ts

types/
  ├── widget.types.ts
  ├── audio.types.ts
  └── layout.types.ts

constants/
  ├── breakpoints.ts
  ├── widgets.ts
  └── audio.ts

utils/
  ├── grid-packing.ts
  └── grid-validation.ts
```

### Estilos
```
app/globals.css (completamente rediseñado)
```
