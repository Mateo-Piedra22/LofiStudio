export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
  image?: string;
};

/**
 * 🏷️ SEMANTIC VERSIONING (vMAJOR.MINOR.PATCH)
 * * 🐛 PATCH (x.x.1) : Bug fixes, parches de seguridad y ajustes visuales menores.
 * ✨ MINOR (x.1.0) : Nuevas funcionalidades compatibles (Nuevos widgets, escenas, opciones).
 * 💥 MAJOR (1.x.x) : Cambios estructurales drásticos o incompatibles (Rediseño total, cambio de DB).
 */

const changelog: ChangelogEntry[] = [
  {
    version: '1.4.1',
    date: '2025-11-27',
    title: 'Grid Engine Perfection',
    features: [
      'Smart Grid Packing: The layout engine now intelligently fills gaps, ensuring a compact and neat workspace',
      'Unified Widget Sizing: Widget dimensions are now centrally managed, making future updates smoother and more consistent'
    ],
    fixes: [
      'Accurate Capacity Counting: Fixed an issue where larger widgets weren\'t counting correctly towards the grid limit',
      'Visual Sync Resolved: Eliminated discrepancies between the customization preview and the main dashboard',
      'Smart Placement: Widgets now properly respect grid boundaries and won\'t be placed if they don\'t fit, preventing layout breaks',
      'Spacer Logic Optimized: Invisible spacers now behave predictably, preventing overflow and layout shifts'
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.4.0',
    date: '2025-11-26',
    title: 'Productivity & Knowledge Widgets Pack',
    features: [
      'New pack 1 Widgets: Habit Tracker, Daily Focus, Calculator',
      'New pack 2 Widgets: Quick Links, Flashcards, Iframe Embed',
      'Enhanced Widget Persistence: Seamless settings synchronization for all new widgets',
      'Flexible Config Architecture: Support for complex widget data structures'
    ],
    fixes: [
      'Added 3D transform utilities to global CSS for advanced animations',
      'Implemented secure sandbox attributes for iframe widgets to prevent malicious scripts',
      'Optimized widget size assignments for better grid layout compatibility'
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.3.0',
    date: '2025-11-25',
    title: 'Brand Identity & Legal Pages Overhaul',
    features: [
      'Complete redesign of the Footer with 4-column layout and social integration',
      'New professional "About Us" page with mission, team, and contact info',
      'Full-featured "Legal", "Terms", and "Cookie Policy" pages with comprehensive real-world text',
      'Unified "Glassmorphism" design language across all informational pages'
    ],
    fixes: [
      'Fixed broken navigation links in the footer',
      'Improved accessibility and readability on dark backgrounds',
      'Standardized page layouts for consistent user experience'
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.5',
    date: '2025-11-25',
    title: 'Asset Refresh',
    features: [],
    fixes: [
      'Asset refresh complete, no more asset overflow',
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.5',
    date: '2025-11-25',
    title: 'Visual Polish & Asset Refresh',
    features: [
      'Complete replacement of all Scenes and Variants with new high-quality assets',
      'Restored strict placement restrictions: 1x2 (rows 0-1) and 1x3 (row 0) only'
    ],
    fixes: [
      'Adjusted minigrid row height for a more compact view',
      'Fixed layout synchronization and visual alignment',
      'Implemented deep validation to prevent any widget overflow during reordering'
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.4',
    date: '2025-11-25',
    title: 'Grid Index Ordering & Mini Manager Grid',
    features: [
      'Index-based widget ordering with persistent reorder',
      'Explicit widget size mapping to CSS grid spans',
      'Active Widgets mini grid (3x3 desktop, 2x3 landscape, 1x3 mobile)',
      'Drop to empty slots with vertical and horizontal constraints',
      'Dynamic capacity per breakpoint via responsive events'
    ],
    fixes: [
      'Aligned grid overlay gaps and columns to real grid',
      'Add Widgets panel anchored right and expanded for full visibility',
      'Main grid height corrected to 100vh and minHeight to avoid bottom cutoff',
      'Improved drag comfort with increased spacing in Active Widgets',
      'dnd-kit type errors fixed (transition removal, id normalization)'
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.3',
    date: '2025-11-25',
    title: 'Drag & Drop Hard Lock (Desktop 1024px)',
    features: [],
    fixes: [
      'Implement hard lock of grid drag when viewport != 1024px',
      'Disable grid interactions outside strict desktop to prevent order corruption',
      'Add guard in updateWidgetLayout to avoid writes when not desktop',
      'Short-circuit onLayoutChange/onDrag/onDragStop in non-desktop mode',
      'Refactor WidgetManager rowsFor duplication to ensure consistent sizing',
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.2',
    date: '2025-11-25',
    title: 'YouTube Scenes Refactor',
    features: [
      'Unified Backgrounds into Scene → Variant model (YouTube)',
      'New scenes: Ocean, Rain, City, Cabin, Cafe Jazz, Autumn',
      'Additional scenes: Cafe Rainy, Synthwave, Winter, Library',
      'Scene selector UI with nested variants',
      'YouTube background embed: autoplay, loop, muted, no controls',
    ],
    fixes: [
      'Removed legacy local video JSON configs',
      'Kept overlay dim layer with glass opacity control',
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.1',
    date: '2025-11-24',
    title: 'Fixed EN-ES Mixtures ',
    features: [
      'Add 30+ new ambient sound assets for enhanced user experience',
    ],
    fixes: [
      'Update all UI text from Spanish to English for consistency',
      'Fix EN-ES mixtures in sound playback functionality',
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.2.0',
    date: '2025-11-24',
    title: 'Responsive Mobile',
    features: [
      'Full mobile-responsive layout across the studio',
      'Adaptive grid for portrait and landscape',
      'Optimized touch interactions and gestures',
    ],
    fixes: [],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.1.0',
    date: '2025-11-23',
    title: 'New Landing Page',
    features: [
      'Polished glassmorphism hero section',
      'User reviews carousel with filters',
      'Support section and improved navigation',
    ],
    fixes: [],
    image: '/placeholder.svg?height=240&width=480',
  },
  {
    version: '1.0.1',
    date: '2025-11-22',
    title: 'Ambient Sounds Fix',
    features: [],
    fixes: [
      'Fixed ambient sound loops not resuming',
      'Improved playback stability',
      'Persisted volume and repeat settings',
    ],
    image: '/placeholder.svg?height=240&width=480',
  },
];

export default changelog;
