export interface Variant {
  id: string;
  name: string;
  youtubeId: string;
}

export interface Scene {
  id: string;
  name: string;
  thumbnail: string;
  variants: Variant[];
}

export const SCENES: Scene[] = [
  {
    id: 'study',
    name: 'Study',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/mqdefault.jpg',
    variants: [
      { id: 'lofi-girl-radio', name: 'Lofi Girl Radio', youtubeId: 'jfKfPfyJRdk' },
      { id: 'lofi-hiphop-radio', name: 'Lofi Hip Hop Radio', youtubeId: '5qap5aO4i9A' },
      { id: 'space-journey', name: 'Space Journey', youtubeId: 'tNkZsRW7h2c' },
      { id: 'sleep-chill', name: 'Lofi Girl — Sleep/Chill', youtubeId: 'DWcJFNfaw9c' },
    ],
  },
  {
    id: 'cozy',
    name: 'Cozy',
    thumbnail: 'https://img.youtube.com/vi/dx3GxpitvbY/mqdefault.jpg',
    variants: [
      { id: 'coffee-shop', name: 'Coffee Shop Ambience', youtubeId: 'dx3GxpitvbY' },
      { id: 'cozy-coffee-jazz', name: 'Cozy Coffee Shop Piano Jazz', youtubeId: 'MYPVQccHhAQ' },
      { id: 'bedroom-rain-night', name: 'Cozy Bedroom Rainy Night', youtubeId: 'McrdclC42_I' },
      { id: 'rainy-coffee-shop', name: 'Rainy Day Cozy Coffee Shop', youtubeId: '0L38Z9hIi5s' },
      { id: 'rainy-night-coffee', name: 'Rainy Night at the Coffee Shop', youtubeId: 'WMer7YJYYSc' },
    ],
  },
  {
    id: 'nature',
    name: 'Nature',
    thumbnail: 'https://img.youtube.com/vi/GJpZ3ExYmWs/mqdefault.jpg',
    variants: [
      { id: 'forest', name: 'Forest', youtubeId: 'GJpZ3ExYmWs' },
      { id: 'forest-stream', name: 'Forest Stream', youtubeId: 'zpBG7COX5SU' },
      { id: 'tropical-ocean', name: 'Tropical Beach Ocean', youtubeId: 'BNTs6-pNFRk' },
    ],
  },
  {
    id: 'ocean',
    name: 'Ocean',
    thumbnail: 'https://img.youtube.com/vi/E-lbpHIkaTo/mqdefault.jpg',
    variants: [
      { id: 'tropical-beach', name: 'Tropical Beach', youtubeId: 'E-lbpHIkaTo' },
      { id: 'ocean-waves', name: 'Ocean Waves', youtubeId: 'DhT_yf7cTO4' },
      { id: 'tropical-beach-ocean', name: 'Tropical Beach Ocean', youtubeId: 'BNTs6-pNFRk' },
    ],
  },
  {
    id: 'rain',
    name: 'Rain',
    thumbnail: 'https://img.youtube.com/vi/x7SQaDTSrVg/mqdefault.jpg',
    variants: [
      { id: 'rain-window', name: 'Rain on Window', youtubeId: 'x7SQaDTSrVg' },
      { id: 'cozy-room-ambience', name: 'Cozy Room Ambience', youtubeId: 'QX9ptr60JFw' },
      { id: 'rain-fireplace', name: 'Rain & Fireplace Sounds', youtubeId: 'fsttJEXDVBg' },
    ],
  },
  {
    id: 'city',
    name: 'City',
    thumbnail: 'https://img.youtube.com/vi/McrdclC42_I/mqdefault.jpg',
    variants: [
      { id: 'bedroom-night-city', name: 'Bedroom Rainy Night City', youtubeId: 'McrdclC42_I' },
      { id: 'rainy-jazz-cafe', name: 'Rainy Jazz Cafe', youtubeId: 'NJuSStkIZBg' },
      { id: 'night-coffee-shop', name: 'Rainy Night Coffee Shop', youtubeId: 'c0_ejQQcrwI' },
    ],
  },
  {
    id: 'cabin',
    name: 'Cabin',
    thumbnail: 'https://img.youtube.com/vi/4whW5r3Q8js/mqdefault.jpg',
    variants: [
      { id: 'cabin-fireplace-rain', name: 'Cozy Cabin Fireplace & Rain', youtubeId: '4whW5r3Q8js' },
      { id: 'cabin-rain-thunder', name: 'Cozy Cabin Rain & Thunder', youtubeId: '_yGhmxLbdqo' },
      { id: 'forest-cabin', name: 'Cozy Forest Cabin Ambience', youtubeId: 'BsfprSJ2kWM' },
      { id: 'cabin-ambience', name: 'Cozy Cabin Ambience', youtubeId: '1RcVIuZ8Wdk' },
      { id: 'stormy-cabin', name: 'Stormy Night Cozy Cabin', youtubeId: 'jU8w2-EcMIc' },
    ],
  },
  {
    id: 'cafe-jazz',
    name: 'Cafe Jazz',
    thumbnail: 'https://img.youtube.com/vi/MYPVQccHhAQ/mqdefault.jpg',
    variants: [
      { id: 'cozy-coffee-piano-jazz', name: 'Cozy Coffee Shop Piano Jazz', youtubeId: 'MYPVQccHhAQ' },
      { id: 'rainy-jazz-cafe-variant', name: 'Rainy Jazz Cafe', youtubeId: 'NJuSStkIZBg' },
      { id: 'coffee-shop-ambience', name: 'Coffee Shop Ambience', youtubeId: 'dx3GxpitvbY' },
    ],
  },
  {
    id: 'autumn',
    name: 'Autumn',
    thumbnail: 'https://img.youtube.com/vi/VMAPTo7RVCo/mqdefault.jpg',
    variants: [
      { id: 'cozy-fall-cafe', name: 'Cozy Fall Coffee Shop', youtubeId: 'VMAPTo7RVCo' },
      { id: 'cozy-coffee-ambience', name: 'Cozy Coffee Shop Ambience', youtubeId: 'l2mW0DxCBY4' },
      { id: 'warm-fireplace-cafe', name: 'Warm Fireplace & Rain Coffee Shop', youtubeId: '1Vt-Gltde3o' },
    ],
  },
  {
    id: 'cafe-rainy',
    name: 'Cafe Rainy',
    thumbnail: 'https://img.youtube.com/vi/0L38Z9hIi5s/mqdefault.jpg',
    variants: [
      { id: 'rainy-day-coffee-shop', name: 'Rainy Day Cozy Coffee Shop', youtubeId: '0L38Z9hIi5s' },
      { id: 'rainy-night-at-coffee-shop', name: 'Rainy Night at the Coffee Shop', youtubeId: 'WMer7YJYYSc' },
      { id: 'rainy-night-coffee-shop', name: 'Rainy Night Coffee Shop', youtubeId: 'c0_ejQQcrwI' },
    ],
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    thumbnail: 'https://img.youtube.com/vi/tNkZsRW7h2c/mqdefault.jpg',
    variants: [
      { id: 'space-journey-synth', name: 'Space Journey', youtubeId: 'tNkZsRW7h2c' },
      { id: 'sleep-chill-synth', name: 'Sleep/Chill', youtubeId: 'DWcJFNfaw9c' },
    ],
  },
  {
    id: 'winter',
    name: 'Winter',
    thumbnail: 'https://img.youtube.com/vi/4whW5r3Q8js/mqdefault.jpg',
    variants: [
      { id: 'winter-cabin-fireplace-rain', name: 'Cozy Cabin Fireplace & Rain', youtubeId: '4whW5r3Q8js' },
      { id: 'winter-cabin-rain-thunder', name: 'Cozy Cabin Rain & Thunder', youtubeId: '_yGhmxLbdqo' },
      { id: 'winter-stormy-cabin', name: 'Stormy Night Cozy Cabin', youtubeId: 'jU8w2-EcMIc' },
    ],
  },
  {
    id: 'library',
    name: 'Library',
    thumbnail: 'https://img.youtube.com/vi/dx3GxpitvbY/mqdefault.jpg',
    variants: [
      { id: 'library-coffee-quiet', name: 'Quiet Coffee Shop Library', youtubeId: 'dx3GxpitvbY' },
      { id: 'library-rainy-jazz-study', name: 'Rainy Jazz Study', youtubeId: 'NJuSStkIZBg' },
    ],
  },
];

