'use client';

import { motion } from 'framer-motion';

interface AudioVisualizerProps {
  isPlaying: boolean;
}

export default function AudioVisualizer({ isPlaying }: AudioVisualizerProps) {
  const bars = Array.from({ length: 32 });

  return (
    <div className="flex items-center justify-center gap-1 h-16 mb-4">
      {bars.map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-primary rounded-full"
          animate={{
            height: isPlaying ? ['20%', '100%', '40%', '80%', '30%'] : '20%',
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.05,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}
