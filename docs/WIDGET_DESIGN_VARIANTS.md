# Widget Design System V2.1 (Proposed)

This document outlines the design architectural vision for the "Next Gen" widgets in LofiStudio. The goal is to make every widget an responsive, adaptive object that feels "alive" and fits perfectly into any grid configuration.

## Core Design Principles

1.  **Adaptive Density**: A widget is not just a scalable image. 
    -   At **1x1**, it is an *Icon/Indicator* (Status at a glance).
    -   At **2x1/1x2**, it is a *Tool* (Interactive functionality).
    -   At **2x2+**, it is a *Dashboard* (Deep insights and management).
2.  **Motion-First**: Nothing just "appears". Numbers count up, progress bars fill smoothly, lists cascade in.
3.  **Visual Themes**: We will support 3 distinct visual languages (skins) that users can toggle globally or per-widget.

---

## Visual Themes (Skins)

### A. **"Lofi Glass" (Default)**
*   **Vibe**: Ethereal, modern, Apple-esque.
*   **Styling**: 
    -   `backdrop-blur-md`, `bg-white/10` (or black/20).
    -   1px subtle borders (`border-white/10`).
    -   Shadows: Diffused colored glows derived from content (e.g., Spotify art glow).
*   **Typography**: `Inter` or `Geist Sans`. Clean, varied font weights.

### B. **"Cozy Paper" (Tactile)**
*   **Vibe**: Warm, skeuomorphic, Notion-like, Bullet Journal.
*   **Styling**:
    -   Solid creamy backgrounds (`#FDFBF7` / Dark Slate).
    -   Subtle paper texture overlays.
    -   Hand-drawn borders or rounded dashed lines.
*   **Typography**: `Outfit` or `Patrick Hand` (Handwritten elements).

### C. **"Cyber Terminal" (Info-Dense)**
*   **Vibe**: Hacker, Sci-Fi, Retro-futurism.
*   **Styling**:
    -   Scanlines, dark high-contrast backgrounds (`#050505`).
    -   Neon accent borders (Cyan, Magenta).
    -   Monospace layouts.
*   **Typography**: `JetBrains Mono` or `Share Tech Mono`.

---

## Widget-Specific Adaptive Layouts

Below are the proposed designs for key widgets across different grid sizes.

### 1. **Tasks Widget**
*   **1x1 (Focus Mode)**:
    -   Shows *one single number* (Remaining tasks) inside a circular progress ring.
    -   OR: Shows the *highest priority* task text only.
    -   *Interaction*: Click opens quick-add modal.
*   **1x2 (List Mode)**:
    -   Vertical list of tasks.
    -   Scrollable.
    -   Perfect for "To-Do" styling.
*   **2x2 (Manager Mode)**:
    -   Left col: Categories/Lists.
    -   Right col: Tasks in selected list.
    -   Bottom: "Add Task" input always visible.

### 2. **Calendar Widget**
*   **1x1 (Date Block)**:
    -   Displays big "24" (Day) and "MON" (Weekday).
    -   Red dot if events exist today.
*   **2x1 (Agenda Strip)**:
    -   Left: Today's Date.
    -   Right: "Next Up: Meeting with Team @ 2pm". (Scrollable horizontal ticker).
*   **2x2 (Planner)**:
    -   Top: Full Month Grid (dots for events, interactive).
    -   Bottom: List of events for selected day (Detailed view).

### 3. **Pomodoro / Timer**
*   **1x1 (Mini-Disc)**:
    -   Minimalist ring.
    -   Center: "24:59".
    -   Hover: Play/Pause controls overlay.
*   **2x1 (Control Center)**:
    -   Left: Timer Ring.
    -   Right: Session controls (Short/Long Break buttons) + "Round 2/4".
*   **1x2 (History Stack)**:
    -   Top: Timer.
    -   Bottom: Vertical list of completed sessions today ("10:00am - Focus").

### 4. **Clock / World Time**
*   **1x1 (Analog/Digi)**:
    -   Choice of Minimal Analog Face or Stacked Digital (Hours over Minutes).
*   **2x1 (World Strip)**:
    -   Current Time (Left) + 2 Secondary Cities (Right) compact.
*   **2x2 (World Map)**:
    -   Interactive SVG map with dots showing day/night cycle and pinned cities.

### 5. **Breathing Widget**
*   **1x1 (Gem)**:
    -   A single pulsing SVG shape (Blob/Circle) that expands/contracts. No text.
*   **2x2 (Guided Session)**:
    -   Center: Large animation.
    -   Bottom: Text instructions ("Inhale... Hold... Exhale").
    -   Controls: Pattern selector (4-7-8, Box, etc).

### 6. **Quote Widget**
*   **1x1 (Icon)**:
    -   A "feather" or "quote" icon.
    -   Hover triggers a tooltip with the daily quote.
*   **2x1 (Banner)**:
    -   Text centered. "Knowledge is power."
    -   Author small below.
*   **2x2 (Card)**:
    -   Unsplash background image (dimmed).
    -   Elegant typography over image.
    -   "Share" and "Save" buttons visible.

### 7. **Weather Widget**
*   **1x1 (Current)**:
    -   Big Icon (Sun/Cloud) + Temperature.
*   **2x1 (Forecast)**:
    -   Current (Left) + Next 3 hours (Right).
*   **2x2 (Dashboard)**:
    -   Top: Current detailed (Humidity, Wind).
    -   Bottom: 5-Day Forecast graph (Sparkline).

---

## Animation & Polish Plan

1.  **State Transitions (`framer-motion` layout)**:
    -   When resizing a widget, elements shouldn't just "cut". We use `layoutId` to morph the "1x1 Icon" into the "2x1 Header".
2.  **Loading Skeletons**:
    -   Shimmer effects matching the widget shape (Circle for timer, Lines for tasks).
3.  **Interaction Feedback**:
    -   Buttons confirm clicks with scale (`0.95`).
    -   Success states (Check task) trigger confetti or "pop" effects.

## Next Steps for Implementation
1.  **Refactor**: Update `WidgetWrapper` to pass `width` and `height` dimensions to children.
2.  **Components**: Split extensive widgets (like Calendar) into sub-views (`CalendarSmall` `CalendarLarge`) conditionally rendered based on props.
3.  **Styles**: Define the CSS variables for the 3 visual themes in `index.css`.
