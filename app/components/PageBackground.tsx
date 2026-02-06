'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function PageBackground() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#050508]">
      {/* Main Background Image with Ken Burns Effect */}
      <motion.div
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <img
          src="/lofistudio-bg.png"
          alt="Background"
          className="w-full h-full object-cover opacity-40 mix-blend-overlay"
        />
      </motion.div>

      {/* Animated Gradient Orbs */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.2, 0.4, 0.2],
          x: [0, 50, 0],
          y: [0, -30, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-purple-900/30 rounded-full blur-[120px]"
      />

      <motion.div
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.1, 0.3, 0.1],
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-indigo-900/20 rounded-full blur-[130px]"
      />

      {/* Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />

      {/* Vignette & Color Grading */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      <div className="absolute inset-0 bg-black/20" />
    </div>
  )
}
