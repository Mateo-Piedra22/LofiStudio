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
      { id: 'chill-raccoon', name: 'Chill Raccoon', youtubeId: 'D_uLM5i0Z4c' }, //FIXED 1.2.5.1
      { id: 'morning-coffee', name: 'Morning Coffee', youtubeId: '1fueZCTYkpA' }, //FIXED 1.2.5.1
      { id: 'late-night-code', name: 'Late Night Coding', youtubeId: 'f02mOEt11OQ' },
      { id: 'street-corner', name: 'Street Corner', youtubeId: 'fWl0ozldt7o' }, //FIXED 1.2.5.1
    ],
  },

  // 2. COZY INDOORS
  {
    id: 'cozy-indoors',
    name: 'Cozy Indoors',
    thumbnail: 'https://img.youtube.com/vi/EHNdBT08eVQ/maxresdefault.jpg',
    variants: [
      { id: 'luxury-apartment', name: 'Apartment View', youtubeId: 'EHNdBT08eVQ' }, //FIXED 1.2.5.1
      { id: 'rainy-window', name: 'Window Rain', youtubeId: 'fz0XZf9KuTY' },
      { id: 'fireplace', name: 'Crackling Fireplace', youtubeId: 'L_LUpnjgPso' },
      { id: 'attic-nook', name: 'Reading Nook', youtubeId: '6bPN0JyGfA4' },
      { id: 'cat-window', name: 'Cat on Window', youtubeId: 'LilJoej4v9I' },
      { id: 'sunny-kitchen', name: 'Sunny Kitchen', youtubeId: '4DpkvEzh-e8' },
      { id: 'bedroom-night', name: 'Night Bedroom', youtubeId: 'T46zKtkeVqA' },
      { id: 'gamer-room', name: 'Gamer Room', youtubeId: '1JN3FYRT7V0' }, //FIXED 1.2.5.1
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
      { id: 'magical-village', name: 'Enchanted Bookstore', youtubeId: '9P3r0PiK7Yg' }, //FIXED 1.2.5.1
      { id: 'dusty-bookshop', name: 'Old Bookshop', youtubeId: '9OY5P-rdkmQ' },
      { id: 'rainy-bookstore', name: 'Rainy Bookstore', youtubeId: 'sh9d5cKy0JA' }, //FIXED 1.2.5.1
      { id: 'grand-archive', name: 'Grand Archives', youtubeId: 'wIIFa9OcJ6s' },
      { id: 'study-hall', name: 'University Hall', youtubeId: 'Ynf8zIAUmIM' },
    ],
  },

  // 5. NATURE ESCAPES
  {
    id: 'nature-escapes',
    name: 'Nature Escapes',
    thumbnail: 'https://img.youtube.com/vi/UZ9uyQI3pF0/maxresdefault.jpg',
    variants: [
      { id: 'forest-river', name: 'Autumn River', youtubeId: 'WNCl-69POro' },
      { id: 'mountain-peak', name: 'Mountain Summit', youtubeId: 'qTf_ruu8KCY' },
      { id: 'waterfall', name: 'Jungle Waterfall', youtubeId: 'kS2299GecDs' }, //FIXED 1.2.5.1
      { id: 'secret-garden', name: 'Secret Garden', youtubeId: 'ik-cXNtsndE' },
      { id: 'meadow', name: 'Sunny Meadow', youtubeId: 'UZ9uyQI3pF0' }, //FIXED 1.2.5.1
      { id: 'desert', name: 'Sahara Dunes', youtubeId: '_YO8rKMCeck' }, //FIXED 1.2.5.1
      { id: 'northern-lights', name: 'Aurora Borealis', youtubeId: 'MTc4ZuxUWiA' },
    ],
  },

  // 6. WATER WORLDS
  {
    id: 'water-worlds',
    name: 'Water Worlds',
    thumbnail: 'https://img.youtube.com/vi/XDLQWASvK0s/maxresdefault.jpg',
    variants: [
      { id: 'deep-ocean', name: 'Deep Ocean', youtubeId: 'XDLQWASvK0s' }, //FIXED 1.2.5.1
      { id: 'coral-reef', name: 'Coral Reef', youtubeId: 'tEDqyi5Au4o' },
      { id: 'tropical-beach', name: 'Tropical Beach', youtubeId: 'DGIXT7ce3vQ' }, //FIXED 1.2.5.1
      { id: 'submarine', name: 'Submarine View', youtubeId: 'DGsr04gbBSA' },
      { id: 'jellyfish', name: 'Jellyfish Tank', youtubeId: 'qbg3C1Dn-Cg' }, //FIXED 1.2.5.1
      { id: 'rain-ocean', name: 'Storm at Sea', youtubeId: 'FwtcOz2556U' },
    ],
  },

  // 7. URBAN & CITY
  {
    id: 'urban-city',
    name: 'Urban & City',
    thumbnail: 'https://img.youtube.com/vi/sAkVnhthpMI/maxresdefault.jpg',
    variants: [
      { id: 'night-drive', name: 'Night City Drive', youtubeId: 'eP_mC1Ci9as' }, //FIXED 1.2.5.1
      { id: 'shibuya', name: 'Shibuya Crossing', youtubeId: 'etGrJw94B80' },
      { id: 'rooftop-night', name: 'Anime Rooftop', youtubeId: '8N_hf_KyBlg' },
      { id: 'rainy-street', name: 'Rainy Tokyo', youtubeId: 'sAkVnhthpMI' }, //FIXED 1.2.5.1
      { id: 'laundromat', name: 'Night Laundromat', youtubeId: 'Nu_BPcqm0No' },
      { id: 'bus-stop', name: 'Lonely Bus Stop', youtubeId: 'pr1H8-AW_Uk' },
      { id: 'nyc-timelapse', name: 'NYC Traffic', youtubeId: 'PN6ikfDhjws' }, //FIXED 1.2.5.1
    ],
  },

  // 8. TRAVEL & COMMUTE
  {
    id: 'travel-commute',
    name: 'Travel & Commute',
    thumbnail: 'https://img.youtube.com/vi/5wRWniHlbKQ/maxresdefault.jpg',
    variants: [
      { id: 'train-journey', name: 'Train Journey', youtubeId: 'ADt_RisXY0U' }, //FIXED 1.2.5.1
      { id: 'plane-window', name: 'Airplane Night', youtubeId: '_NL7Pk9EqDg' }, //FIXED 1.2.5.1
      { id: 'night-bus', name: 'Night Bus Journey', youtubeId: 'ktprPL9EoyY' }, //FIXED 1.2.5.1
      { id: 'ferry-ride', name: 'Ferry Boat', youtubeId: 'Do40QlmvOVQ' },
      { id: 'rainy-drive', name: 'Rainy Drive', youtubeId: 'XPuWuEV87SE' }, //FIXED 1.2.5.1
      { id: 'heavy-rainy-car', name: 'Heavy Rainy Drive', youtubeId: 'cb3NnbT5y4s' }, //FIXED 1.2.5.1
      { id: 'warp-speed', name: 'Hyperspace Jump', youtubeId: 'KdTwFEY2e0k' },
    ],
  },

  // 9. FANTASY WORLDS
  {
    id: 'fantasy-worlds',
    name: 'Fantasy Worlds',
    thumbnail: 'https://img.youtube.com/vi/vyg5jJrZ42s/maxresdefault.jpg',
    variants: [
      { id: 'medieval-tavern', name: 'Medieval Tavern', youtubeId: 'vyg5jJrZ42s' }, //FIXED 1.2.5.1
      { id: 'witch-hut', name: 'Swamp Witch Hut', youtubeId: '_qbC9jURi_w' },
      { id: 'floating-islands', name: 'Floating Islands', youtubeId: 'CSV9y3-jTrs' },
      { id: 'dwarven-forge', name: 'Dwarven Forge', youtubeId: 'k0UzHqy1XxA' },
      { id: 'secret-treehouse', name: 'Elven Treehouse', youtubeId: 'jhp6kvnGasM' },
      { id: 'hobbit-hole', name: 'The Hobbit Hole', youtubeId: 'rJhSZQdLARE' }, //FIXED 1.2.5.1
    ],
  },

  // 10. SCI-FI & SPACE
  {
    id: 'scifi-space',
    name: 'Sci-Fi & Space',
    thumbnail: 'https://img.youtube.com/vi/ibNrPjETR_k/maxresdefault.jpg',
    variants: [
      { id: 'cyberpunk-city', name: 'Cyberpunk City', youtubeId: 'ibNrPjETR_k' }, //FIXED 1.2.5.1
      { id: 'cybernetic-terrace', name: 'Cybernetic Terrace', youtubeId: 'A4kU-LiaXiE' }, //FIXED 1.2.5.1
      { id: 'cyberpunk-nightcity', name: 'Cyberpunk Night City', youtubeId: 'SthlzIeMNW8' }, //FIXED 1.2.5.1
      { id: 'cyberpunk-night-drive', name: 'Cyberpunk Night Drive', youtubeId: 'GsqsG3axUCs' }, //FIXED 1.2.5.1
      { id: 'spaceship-bridge', name: 'Space Station', youtubeId: 'xQ_IQS3VKjA' },
      { id: 'alien-planet', name: 'Alien Landscape', youtubeId: '5IZJqSpJrXc' },
      { id: 'black-hole', name: 'Gargantua Black Hole', youtubeId: '0-W0jMjGmVk' },
      { id: 'steampunk-lab', name: 'Steampunk Lab', youtubeId: 'aPKbxYBSK7c' },
      { id: 'neon-setup', name: 'Neon Gaming setup', youtubeId: 'FkJAFJwXZ_8' }, //FIXED 1.2.5.1
    ],
  },

  // 11. PIXEL ART & RETRO
  {
    id: 'pixel-retro',
    name: 'Pixel Art & Retro',
    thumbnail: 'https://img.youtube.com/vi/gNPmSpvofoo/maxresdefault.jpg',
    variants: [
      { id: 'pixel-bedroom', name: 'Cozy Pixel Room', youtubeId: 'f02mOEt11OQ' },
      { id: 'pixel-city', name: '8-Bit City Night', youtubeId: 'gNPmSpvofoo' }, //FIXED 1.2.5.1
      { id: 'pixel-train', name: 'Pixel Train', youtubeId: 'IpATZR0f3ps' }, //FIXED 1.2.5.1
      { id: 'pixel-coffee', name: 'Retro Coffee Shop', youtubeId: 'ak596Dhx1hM' }, //FIXED 1.2.5.1
      { id: 'pixel-forest', name: '8-Bit Forest', youtubeId: 'QCJRus4cguc' },
      { id: 'vaporwave-sun', name: 'Vaporwave Sunset', youtubeId: 'FMeM9iBkS9k' },
      { id: 'retro-terminal', name: 'Old PC Terminal', youtubeId: 'EX2M90OzYQY' },
    ],
  },

  // 12. JAPAN AESHTHETICS
  {
    id: 'japan-aesthetics',
    name: 'Japan Aesthetics',
    thumbnail: 'https://img.youtube.com/vi/BLO5CyYUMLU/maxresdefault.jpg',
    variants: [
      { id: 'convenience-store', name: 'Convenience Store', youtubeId: '1KFmpyzRTcA' }, //FIXED 1.2.5.1
      { id: 'afterschool-classroom', name: 'Empty Classroom', youtubeId: 'WvYmV2eFWe0' }, //FIXED 1.2.5.1
      { id: 'vending-machine', name: 'Rainy Vending', youtubeId: 'phLk-mr4vUY' }, //FIXED 1.2.5.1
      { id: 'yokohama-school', name: 'Yokohama School', youtubeId: 'BmAJ2DAb6zU' }, //FIXED 1.2.5.1
      { id: 'ghibli-meadow', name: 'Ghibli Style Meadow', youtubeId: 'PtIKsk1Qabw' }, //FIXED 1.2.5.1
      { id: 'train-crossing', name: 'Train Crossing', youtubeId: '8VHWJof6Ro8' }, //FIXED 1.2.5.1
      { id: 'japan-street-corner', name: 'Street Corner', youtubeId: 'D8fp-baFdG0' }, //FIXED 1.2.5.1
    ],
  },

  // 13. GAMING VIBES
  {
    id: 'gaming-vibes',
    name: 'Gaming Vibes',
    thumbnail: 'https://img.youtube.com/vi/ynlSAlsDP_A/maxresdefault.jpg',
    variants: [
      { id: 'minecraft-cherry', name: 'Minecraft Cherry', youtubeId: '0EWcxtOAJE4' },
      { id: 'zelda-fairy', name: 'Zelda Fairy Fountain', youtubeId: 'pYy6Zs72kQ8' },
      { id: 'zelda-botw', name: 'BotW Scenery', youtubeId: '8acHLOVxOgo' },
      { id: 'animal-crossing', name: 'Animal Crossing Rain', youtubeId: 'aDb68zMmT2c' },
      { id: 'skyrim-night', name: 'Skyrim Night', youtubeId: '9ou1pl0XNRs' }, //FIXED 1.2.5.1
      { id: 'autumn-stardew-valley', name: 'Autumn Stardew Farm', youtubeId: '_2rnKRoY1tw' }, //FIXED 1.2.5.1
      { id: 'winter-stardew-valley', name: 'Winter Stardew Farm', youtubeId: 'j72SHSPd1rQ' }, //FIXED 1.2.5.1
      { id: 'night-stardew-valley', name: 'Night Stardew Farm', youtubeId: 'jtW8OFrDvqM' }, //FIXED 1.2.5.1
    ],
  },

  // 14. HISTORICAL & VINTAGE
  {
    id: 'historical-vintage',
    name: 'Historical & Vintage',
    thumbnail: 'https://img.youtube.com/vi/_WAi6b-Jeg4/maxresdefault.jpg',
    variants: [
      { id: 'jazz-bar-1920', name: '1920s Jazz Bar', youtubeId: 'bxc3KcxZ4-I' },
      { id: 'victorian-london', name: 'Victorian London', youtubeId: '_WAi6b-Jeg4' }, //FIXED 1.2.5.1
      { id: 'vinyl-shop', name: 'Retro Record Store', youtubeId: 'f6o66HPdqas' },
      { id: 'noir-detective', name: 'Noir Office', youtubeId: '6-_oEkN1W5s' }, // FIXED 1.2.5.1
      { id: 'ancient-temple', name: 'Ancient Temple', youtubeId: 'wIIFa9OcJ6s' },
      { id: 'rainy-wild-west', name: 'Rainy Wild West', youtubeId: 'D-EH6E-OCTc' }, // FIXED 1.2.5.1
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
      { id: 'foggy-cemetery', name: 'Foggy Cemetery', youtubeId: 'kaCLwbVN_cE' }, // FIXED 1.2.5.1
      { id: 'witches-lair', name: 'Witch\'s Lair', youtubeId: '_qbC9jURi_w' },
      { id: 'dark-forest', name: 'Dark Forest', youtubeId: 'LVanPoKh7Ew' }, // FIXED 1.2.5.1
      { id: 'abandoned-cafe', name: 'Abandoned Cafe', youtubeId: 'EC1gpeFTZTY' }, // FIXED 1.2.5.1
    ],
  },

  // 16. ABSTRACT & FOCUS
  {
    id: 'abstract-focus',
    name: 'Deep Focus',
    thumbnail: 'https://img.youtube.com/vi/5kQ-LFhBQlg/maxresdefault.jpg',
    variants: [
      { id: 'pink-aura', name: 'Soft Pink Aura', youtubeId: '6rvSJhgOdwQ' },
      { id: 'blue-gradient', name: 'Calm Blue Gradient', youtubeId: 'FqLSjN0BQNk' }, // FIXED 1.2.5.1
      { id: 'golden-bokeh', name: 'Warm Golden Bokeh', youtubeId: '2JT_GlQsWxU' }, // FIXED 1.2.5.1
      { id: 'lava-lamp', name: 'Liquid Lava Lamp', youtubeId: 'tgJwYEcmYmQ' },
      { id: 'oled-dark', name: 'OLED Dark Waves', youtubeId: 'eCHaiEjCDFM' },
      { id: 'visual-static', name: 'White Noise Static', youtubeId: '5DV_b_WMppI' },
      { id: 'neon-geometry', name: 'Slow Geometry', youtubeId: '3-3IzhzHKfg' },
      { id: 'deep-space', name: 'Deep Space', youtubeId: '5kQ-LFhBQlg' }, // FIXED 1.2.5.1
    ],
  },
];