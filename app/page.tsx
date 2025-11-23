'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Star, ArrowRight, Coffee } from 'lucide-react'

type PublicReview = { userName: string | null; userImage: string | null; rating: number; comment: string | null }

export default function HomePage() {
  const [reviews, setReviews] = useState<PublicReview[]>([])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/reviews')
        if (!res.ok) return
        const data = await res.json()
        setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
      } catch {}
    })()
  }, [])

  return (
    <main className="min-h-screen w-full relative font-sans">
      <div className="absolute inset-0 -z-10">
        <img src="/lofistudio-bg.png" alt="LofiStudio" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-4">
        <div className="glass-button border rounded-2xl px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-8 w-auto rounded-md" />
            <span className="text-sm text-foreground/80">LofiStudio</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="glass-button" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
            <Button asChild className="glass-button">
              <Link href="/studio">Go to Studio</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-6 pt-32 pb-24">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
            Tu espacio de enfoque y calma
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-4 text-base md:text-lg text-muted-foreground">
            Widgets, música lofi y un diseño glassmorphism para entrar en flow.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="mt-8 flex items-center justify-center gap-3">
            <Button className="glass-button" asChild>
              <Link href="/studio" className="flex items-center gap-2">
                Entrar al Studio
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button variant="outline" className="glass-button" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-semibold text-foreground mb-4">Usuarios felices</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.map((r, idx) => (
              <Card key={idx} className="glass-panel border">
                <CardContent className="p-4 flex gap-3 items-start">
                  <Avatar>
                    {r.userImage ? <AvatarImage src={r.userImage} alt={r.userName || ''} /> : <AvatarFallback>{(r.userName || 'U')[0]}</AvatarFallback>}
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{r.userName || 'Usuario'}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-primary' : 'text-muted-foreground'}`} />
                      ))}
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-3xl mx-auto text-center glass-panel border rounded-3xl px-8 py-10">
          <h3 className="text-xl font-semibold text-foreground">Support</h3>
          <p className="mt-2 text-sm text-muted-foreground">Ayúdame a mantener LofiStudio en línea y seguir mejorándolo.</p>
          <div className="mt-4">
            <Button asChild className="glass-button">
              <a href="https://cafecito.app/lofistudio" target="_blank" rel="noopener" className="flex items-center gap-2">
                <Coffee className="w-4 h-4" />
                Invitame 1 Coffee
              </a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-12">
        <div className="max-w-6xl mx-auto flex items-center justify-between glass-button border rounded-2xl px-4 py-3">
          <div className="text-xs text-muted-foreground">© {new Date().getFullYear()} MotionA</div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/terms" className="underline">Terms</Link>
            <Link href="/legal" className="underline">Privacy</Link>
            <Link href="/cookies" className="underline">Cookies</Link>
          </div>
        </div>
      </footer>
    </main>
  )
}

