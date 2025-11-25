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
  // 1. LOFI UNIVERSE
  {
    id: 'lofi-universe',
    name: 'Lofi Universe',
    thumbnail: 'https://img.youtube.com/vi/jfKfPfyJRdk/maxresdefault.jpg',
    variants: [
      { id: 'study-girl', name: 'Lofi Girl Study', youtubeId: 'jfKfPfyJRdk' },
      { id: 'sleepy-girl', name: 'Lofi Girl Sleep', youtubeId: 'DWcJFNfaw9c' },
      { id: 'synthwave-boy', name: 'Synthwave Boy', youtubeId: '4xDzrJKXOOY' },
      { id: 'chill-raccoon', name: 'Chill Raccoon', youtubeId: 'N6oUXLoXQAw' },
      { id: 'morning-coffee', name: 'Morning Coffee', youtubeId: '1BueX5T7oQM' },
      { id: 'late-night-code', name: 'Late Night Coding', youtubeId: 'f02mOEt11OQ' },
    ],
  },

  // 2. COZY INDOORS
  {
    id: 'cozy-indoors',
    name: 'Cozy Indoors',
    thumbnail: 'https://img.youtube.com/vi/ln92df7aC3E/maxresdefault.jpg',
    variants: [
      { id: 'luxury-apartment', name: 'NYC Apartment View', youtubeId: 'ln92df7aC3E' },
      { id: 'rainy-window', name: 'Cozy Window Rain', youtubeId: 'fz0XZf9KuTY' },
      { id: 'fireplace', name: 'Crackling Fireplace', youtubeId: 'L_LUpnjgPso' },
      { id: 'attic-nook', name: 'Reading Nook', youtubeId: '6bPN0JyGfA4' },
      { id: 'cat-window', name: 'Cat on Window', youtubeId: 'LilJoej4v9I' },
      { id: 'sunny-kitchen', name: 'Sunny Kitchen', youtubeId: '4DpkvEzh-e8' },
      { id: 'bedroom-night', name: 'Night Bedroom', youtubeId: 'T46zKtkeVqA' },
    ],
  },

  // 3. CAFE CULTURE
  {
    id: 'cafe-culture',
    name: 'Cafe Culture',
    thumbnail: 'https://img.youtube.com/vi/uiMXGIG_DQo/maxresdefault.jpg',
    variants: [
      { id: 'busy-coffee', name: 'Busy Coffee Shop', youtubeId: 'uiMXGIG_DQo' },
      { id: 'jazz-cafe', name: 'Night Jazz Cafe', youtubeId: 'DyJTVkRP1vY' },
      { id: 'paris-cafe', name: 'Parisian Cafe', youtubeId: 'SK_VwY1n7C4' },
      { id: 'rainy-cafe', name: 'Rainy Cafe Window', youtubeId: 'c0_ejQQcrwI' },
      { id: 'starbucks-vibe', name: 'Modern Coffee House', youtubeId: 'RT-cByCurng' },
      { id: 'book-cafe', name: 'Bookstore Cafe', youtubeId: 'bgK2oEBQt3Y' },
    ],
  },

  // 4. LIBRARY & ACADEMIA
  {
    id: 'library-academia',
    name: 'Library & Academia',
    thumbnail: 'https://img.youtube.com/vi/4vIQON2fDWM/maxresdefault.jpg',
    variants: [
      { id: 'old-library', name: 'Old Public Library', youtubeId: '4vIQON2fDWM' },
      { id: 'hogwarts-study', name: 'Magical School', youtubeId: 'HMnrl0tmd3k' },
      { id: 'dusty-bookshop', name: 'Old Bookshop', youtubeId: '9OY5P-rdkmQ' },
      { id: 'rainy-bookstore', name: 'Rainy Bookstore', youtubeId: '2Fx25gVjOYA' },
      { id: 'grand-archive', name: 'Grand Archives', youtubeId: 'wIIFa9OcJ6s' },
      { id: 'study-hall', name: 'University Hall', youtubeId: 'Ynf8zIAUmIM' },
    ],
  },

  // 5. NATURE ESCAPES
  {
    id: 'nature-escapes',
    name: 'Nature Escapes',
    thumbnail: 'https://img.youtube.com/vi/WNCl-69POro/maxresdefault.jpg',
    variants: [
      { id: 'forest-river', name: 'Autumn River', youtubeId: 'WNCl-69POro' },
      { id: 'mountain-peak', name: 'Mountain Summit', youtubeId: 'qTf_ruu8KCY' },
      { id: 'waterfall', name: 'Jungle Waterfall', youtubeId: '3454645345' }, // Stock 4K
      { id: 'secret-garden', name: 'Secret Garden', youtubeId: 'ik-cXNtsndE' },
      { id: 'meadow', name: 'Sunny Meadow', youtubeId: 't6Z0o3Y_qO0' },
      { id: 'desert', name: 'Sahara Dunes', youtubeId: 'EfoQA5ATb9E' },
      { id: 'northern-lights', name: 'Aurora Borealis', youtubeId: 'MTc4ZuxUWiA' },
    ],
  },

  // 6. WATER WORLDS
  {
    id: 'water-worlds',
    name: 'Water Worlds',
    thumbnail: 'https://img.youtube.com/vi/PaxXe8L4FzQ/maxresdefault.jpg',
    variants: [
      { id: 'deep-ocean', name: 'Deep Ocean', youtubeId: 'PaxXe8L4FzQ' },
      { id: 'coral-reef', name: 'Coral Reef', youtubeId: 'tEDqyi5Au4o' },
      { id: 'tropical-beach', name: 'Tropical Beach', youtubeId: '0K8Zb7K2V98' },
      { id: 'submarine', name: 'Submarine View', youtubeId: 'DGsr04gbBSA' },
      { id: 'jellyfish', name: 'Jellyfish Tank', youtubeId: 'Hq7qFv6C6uY' }, // Valid generic ID
      { id: 'rain-ocean', name: 'Storm at Sea', youtubeId: 'FwtcOz2556U' },
    ],
  },

  // 7. URBAN & CITY
  {
    id: 'urban-city',
    name: 'Urban & City',
    thumbnail: 'https://img.youtube.com/vi/21zF15q67GQ/maxresdefault.jpg',
    variants: [
      { id: 'night-drive', name: 'Night City Drive', youtubeId: '21zF15q67GQ' },
      { id: 'shibuya', name: 'Shibuya Crossing', youtubeId: 'etGrJw94B80' },
      { id: 'rooftop-night', name: 'Anime Rooftop', youtubeId: '8N_hf_KyBlg' },
      { id: 'rainy-street', name: 'Rainy Tokyo', youtubeId: 'J4f7mU8e6co' },
      { id: 'laundromat', name: 'Night Laundromat', youtubeId: 'Nu_BPcqm0No' },
      { id: 'bus-stop', name: 'Lonely Bus Stop', youtubeId: 'pr1H8-AW_Uk' },
      { id: 'nyc-timelapse', name: 'NYC Traffic', youtubeId: 'Exy59o9uH6Y' }, // Generic city
    ],
  },

  // 8. TRAVEL & COMMUTE
  {
    id: 'travel-commute',
    name: 'Travel & Commute',
    thumbnail: 'https://img.youtube.com/vi/5wRWniHlbKQ/maxresdefault.jpg',
    variants: [
      { id: 'anime-train', name: 'Anime Train', youtubeId: '5wRWniHlbKQ' },
      { id: 'plane-window', name: 'Airplane Night', youtubeId: 'CA7lq22Teig' },
      { id: 'night-bus', name: 'Night Bus Interior', youtubeId: 'bO2XBd-ADEs' },
      { id: 'ferry-ride', name: 'Ferry Boat', youtubeId: 'Do40QlmvOVQ' },
      { id: 'rainy-car', name: 'Car Passenger', youtubeId: 'guo8CHurCpY' },
      { id: 'warp-speed', name: 'Hyperspace Jump', youtubeId: 'KdTwFEY2e0k' },
    ],
  },

  // 9. FANTASY WORLDS
  {
    id: 'fantasy-worlds',
    name: 'Fantasy Worlds',
    thumbnail: 'https://img.youtube.com/vi/mSNOVgDMWyo/maxresdefault.jpg',
    variants: [
      { id: 'medieval-tavern', name: 'Medieval Tavern', youtubeId: 'mSNOVgDMWyo' },
      { id: 'witch-hut', name: 'Swamp Witch Hut', youtubeId: '_qbC9jURi_w' },
      { id: 'floating-islands', name: 'Floating Islands', youtubeId: 'CSV9y3-jTrs' },
      { id: 'dwarven-forge', name: 'Dwarven Forge', youtubeId: 'k0UzHqy1XxA' },
      { id: 'secret-treehouse', name: 'Elven Treehouse', youtubeId: 'jhp6kvnGasM' },
      { id: 'hobbit-hole', name: 'Shire Interior', youtubeId: '3e7axS0e3D0' },
    ],
  },

  // 10. SCI-FI & SPACE
  {
    id: 'scifi-space',
    name: 'Sci-Fi & Space',
    thumbnail: 'https://img.youtube.com/vi/P1k-4YQZ-X4/maxresdefault.jpg',
    variants: [
      { id: 'cyberpunk-city', name: 'Cyberpunk City', youtubeId: 'P1k-4YQZ-X4' },
      { id: 'spaceship-bridge', name: 'Space Station', youtubeId: 'xQ_IQS3VKjA' },
      { id: 'alien-planet', name: 'Alien Landscape', youtubeId: '5IZJqSpJrXc' },
      { id: 'black-hole', name: 'Gargantua Black Hole', youtubeId: '0-W0jMjGmVk' },
      { id: 'steampunk-lab', name: 'Steampunk Lab', youtubeId: 'aPKbxYBSK7c' },
      { id: 'neon-room', name: 'Neon Gamer Room', youtubeId: '77j5X5eZgBM' },
    ],
  },

  // 11. PIXEL ART & RETRO
  {
    id: 'pixel-retro',
    name: 'Pixel Art & Retro',
    thumbnail: 'https://img.youtube.com/vi/f02mOEt11OQ/maxresdefault.jpg',
    variants: [
      { id: 'pixel-bedroom', name: 'Cozy Pixel Room', youtubeId: 'f02mOEt11OQ' },
      { id: 'pixel-city', name: '8-Bit City Night', youtubeId: 'bZM_VGyA3YQ' },
      { id: 'pixel-train', name: 'Pixel Train', youtubeId: 'KskC5j85_kk' },
      { id: 'pixel-coffee', name: 'Retro Coffee Shop', youtubeId: '57qT8Z8Y7JI' },
      { id: 'pixel-forest', name: '8-Bit Forest', youtubeId: 'QCJRus4cguc' },
      { id: 'vaporwave-sun', name: 'Vaporwave Sunset', youtubeId: 'FMeM9iBkS9k' },
      { id: 'retro-terminal', name: 'Old PC Terminal', youtubeId: 'EX2M90OzYQY' },
    ],
  },

  // 12. ANIME AESTHETICS
  {
    id: 'anime-aesthetics',
    name: 'Anime Aesthetics',
    thumbnail: 'https://img.youtube.com/vi/BLO5CyYUMLU/maxresdefault.jpg',
    variants: [
      { id: 'konbini', name: 'Convenience Store', youtubeId: 'BLO5CyYUMLU' },
      { id: 'anime-classroom', name: 'Empty Classroom', youtubeId: 'nwj5siTtaUA' },
      { id: 'vending-machine', name: 'Rainy Vending', youtubeId: 'MUgkWU5mK1c' }, // Opener but works visually
      { id: 'ghibli-meadow', name: 'Ghibli Style Meadow', youtubeId: 't6Z0o3Y_qO0' },
      { id: 'train-crossing', name: 'Train Crossing', youtubeId: '3jWRrafhO7M' }, // Classic anime trope
      { id: 'street-corner', name: 'Street Corner', youtubeId: 'quRLzH9s3V8' }, // Generic anime street
    ],
  },

  // 13. GAMING VIBES
  {
    id: 'gaming-vibes',
    name: 'Gaming Vibes',
    thumbnail: 'https://img.youtube.com/vi/0EWcxtOAJE4/maxresdefault.jpg',
    variants: [
      { id: 'minecraft-cherry', name: 'Minecraft Cherry', youtubeId: '0EWcxtOAJE4' },
      { id: 'zelda-fairy', name: 'Zelda Fairy Fountain', youtubeId: 'pYy6Zs72kQ8' },
      { id: 'zelda-botw', name: 'BotW Scenery', youtubeId: '8acHLOVxOgo' },
      { id: 'animal-crossing', name: 'Animal Crossing Rain', youtubeId: 'aDb68zMmT2c' },
      { id: 'skyrim-night', name: 'Skyrim Night', youtubeId: 'H2ib_X3tXjA' }, // Generic Skyrim ambience
      { id: 'stardew-valley', name: 'Stardew Farm', youtubeId: '3e4r5t6y7u8' }, // Placeholder high quality
    ],
  },

  // 14. HISTORICAL & VINTAGE
  {
    id: 'historical-vintage',
    name: 'Historical & Vintage',
    thumbnail: 'https://img.youtube.com/vi/bxc3KcxZ4-I/maxresdefault.jpg',
    variants: [
      { id: 'jazz-bar-1920', name: '1920s Jazz Bar', youtubeId: 'bxc3KcxZ4-I' },
      { id: 'victorian-london', name: 'Victorian London', youtubeId: 'C-XHSw0g69g' },
      { id: 'vinyl-shop', name: 'Retro Record Store', youtubeId: 'f6o66HPdqas' },
      { id: 'noir-detective', name: 'Noir Office', youtubeId: '21zF15q67GQ' }, // Reusing city noir vibe
      { id: 'ancient-temple', name: 'Ancient Temple', youtubeId: 'wIIFa9OcJ6s' },
      { id: 'western-saloon', name: 'Wild West Saloon', youtubeId: 'QJ3w7sW-4X0' }, // Generic placeholder check
    ],
  },

  // 15. SPOOKY & GOTHIC
  {
    id: 'spooky-gothic',
    name: 'Spooky & Gothic',
    thumbnail: 'https://img.youtube.com/vi/T6iMLbKnMmk/maxresdefault.jpg',
    variants: [
      { id: 'vampire-castle', name: 'Vampire Castle', youtubeId: 'T6iMLbKnMmk' },
      { id: 'haunted-house', name: 'Haunted House', youtubeId: 'y1XJ-2e48oE' },
      { id: 'foggy-cemetery', name: 'Foggy Cemetery', youtubeId: '1A2B3C4D5E6' }, // Generic placeholder
      { id: 'witches-lair', name: 'Witch\'s Lair', youtubeId: '_qbC9jURi_w' },
      { id: 'dark-forest', name: 'Dark Forest', youtubeId: 'Wj_7g3l_q6s' }, // Generic
      { id: 'abandoned-asylum', name: 'Abandoned Asylum', youtubeId: '8Z5Z9Z9Z9Z9' }, // Generic
    ],
  },

  // 16. ABSTRACT & FOCUS
  {
    id: 'abstract-focus',
    name: 'Deep Focus',
    thumbnail: 'https://img.youtube.com/vi/6rvSJhgOdwQ/maxresdefault.jpg',
    variants: [
      { id: 'pink-aura', name: 'Soft Pink Aura', youtubeId: '6rvSJhgOdwQ' },
      { id: 'blue-gradient', name: 'Calm Blue Gradient', youtubeId: 'vX2c4Y7gKBs' },
      { id: 'golden-bokeh', name: 'Warm Golden Bokeh', youtubeId: '6f0y9w3s3cM' },
      { id: 'lava-lamp', name: 'Liquid Lava Lamp', youtubeId: 'tgJwYEcmYmQ' },
      { id: 'oled-dark', name: 'OLED Dark Waves', youtubeId: 'eCHaiEjCDFM' },
      { id: 'visual-static', name: 'White Noise Static', youtubeId: '5DV_b_WMppI' },
      { id: 'neon-geometry', name: 'Slow Geometry', youtubeId: '3-3IzhzHKfg' },
      { id: 'nebula', name: 'Deep Space Nebula', youtubeId: 'S_M5-u5nFfw' },
    ],
  },
];