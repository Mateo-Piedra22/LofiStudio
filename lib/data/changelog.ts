export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  features: string[];
  fixes: string[];
  image?: string;
};

const changelog: ChangelogEntry[] = [
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
