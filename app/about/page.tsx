'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowLeft, Heart, Users, Shield, Zap } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen w-full relative font-sans selection:bg-primary/30">
      <div className="fixed inset-0 -z-20 bg-[url('/lofistudio-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed" />
      <div className="fixed inset-0 -z-10 bg-black/70" />

      <div className="relative z-10 flex items-start justify-center px-6 py-24">
        <div className="glass-panel rounded-3xl border px-6 md:px-10 py-10 md:py-12 max-w-4xl w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/10 pb-8">
            <div className="flex items-center gap-4">
              <img 
                src="/brand/lofistudio_logo.png" 
                alt="LofiStudio" 
                className="h-16 w-auto rounded-xl shadow-2xl ring-1 ring-white/20" 
              />
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">About LofiStudio</h1>
                <p className="text-muted-foreground mt-1">Crafting digital sanctuaries for focus and flow.</p>
              </div>
            </div>
            <Button asChild variant="secondary" className="bg-white/10 hover:bg-white/20 text-foreground border-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-12 text-foreground/90 leading-relaxed">
            
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground">
                In an increasingly noisy and distracted world, finding a moment of clarity can feel impossible. 
                <strong>LofiStudio</strong> was born from a simple desire: to create a digital space that helps you reclaim your focus.
              </p>
              <p className="text-muted-foreground">
                We believe that productivity isn't just about doing more—it's about feeling better while you do it. 
                By combining ambient soundscapes, aesthetic visuals, and essential tools into a unified interface, 
                we provide a sanctuary where creators, students, and professionals can thrive.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel border p-6 rounded-xl space-y-3">
                <Zap className="w-8 h-8 text-yellow-400" />
                <h3 className="font-semibold text-lg">Flow State</h3>
                <p className="text-sm text-muted-foreground">
                  Every feature is designed to reduce friction and help you enter a state of deep work effortlessly.
                </p>
              </div>
              <div className="glass-panel border p-6 rounded-xl space-y-3">
                <Shield className="w-8 h-8 text-blue-400" />
                <h3 className="font-semibold text-lg">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  Your data belongs to you. We build with a privacy-first architecture that keeps your habits local.
                </p>
              </div>
              <div className="glass-panel border p-6 rounded-xl space-y-3">
                <Users className="w-8 h-8 text-green-400" />
                <h3 className="font-semibold text-lg">Community</h3>
                <p className="text-sm text-muted-foreground">
                  Built by MotionA, we are a collective of designers and developers passionate about digital well-being.
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Who We Are</h2>
              <p className="text-muted-foreground">
                LofiStudio is a product of <strong>MotionA</strong>, a digital product studio dedicated to crafting tools 
                that blend high-performance technology with human-centric design. We don't just write code; we curate experiences.
              </p>
              <p className="text-muted-foreground">
                Our team spans across the globe, united by a love for lofi hip hop, clean UI, and the belief that 
                software should be calm, not chaotic.
              </p>
            </section>

            <section className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <h3 className="text-xl font-semibold mb-2">Get in Touch</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Have a suggestion, found a bug, or just want to say hello? We'd love to hear from you.
              </p>
              <a href="mailto:contact@motiona.xyz" className="text-primary hover:underline font-medium">
                contact@motiona.xyz
              </a>
            </section>

          </div>

          <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} MotionA. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              <Link href="/legal" className="hover:text-foreground transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
