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
