# Widget System Documentation

## Overview
LofiStudio uses a grid-based widget system that allows users to drag, resize, and configure productivity tools.

## Key Components

### 1. WidgetGrid
The main canvas. It uses a responsive grid logic (columns change based on viewport).
- **Store**: `lib/stores/widget-grid.store.ts`
- **Logic**: Handles collision detection, "smart packing" (filling gaps), and sorting.

### 2. WidgetBase
The container for all widgets.
- **File**: `app/components/WidgetBase/WidgetWrapper.tsx`
- **Features**: 
  - Glassmorphic container style
  - Header actions (Settings, Remove, Custom Actions)
  - Loading states
  - Error boundaries

### 3. Creating a New Widget

#### Step 1: Create Component
Create a file in `app/components/WidgetsV2/MyNewWidget.tsx`.
```tsx
export function MyNewWidget({ id, settings }: WidgetProps) {
    return (
        <WidgetWrapper id={id} title="My Widget" icon="Star">
            <div>Content here</div>
        </WidgetWrapper>
    );
}
```

#### Step 2: Register Widget
Add to `lib/constants/widgets.ts` (Registry definition).
```typescript
{
    type: 'my-widget',
    label: 'My Widget',
    description: 'Does cool stuff',
    defaultW: 2,
    defaultH: 2,
    component: lazy(() => import('@/components/WidgetsV2/MyNewWidget'))
}
```

#### Step 3: Add to Renderer
Update `app/components/StudioV2/WidgetRenderer.tsx` to handle the new type case.

## State Persistence
- **Local**: `localStorage` keeps the `lofi-widget-layout` key.
- **Sync**: Authenticated users sync their layout to Postgres via `LayoutStore`.

## Responsive Behavior
- **Desktop**: Free drag-and-drop.
- **Mobile**: Linear stack or simplified grid.
