'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Button } from '@/components/ui/button'
import VersionBadge from '@/app/components/VersionBadge'
import PageBackground from '@/app/components/PageBackground'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Star, ArrowRight, Coffee, Waves, Timer, CalendarDays, Settings, Sparkles, Twitter, Instagram, Github, Music, Cloud, Moon } from 'lucide-react'

type PublicReview = { userName: string | null; userImage: string | null; rating: number; comment: string | null }

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      viewport={{ once: true, margin: "-50px" }}
      className="group relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="p-8 flex flex-col items-start gap-4 relative z-10">
        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 text-white flex items-center justify-center shadow-inner ring-1 ring-white/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-foreground transition-colors">{title}</h3>
          <p className="text-gray-400 leading-relaxed text-sm group-hover:text-gray-300 transition-colors">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ReviewCard({ r }: { r: PublicReview }) {
  return (
    <Card className="glass-panel border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-colors">
      <CardContent className="p-5 flex gap-4 items-start">
        <Avatar className="h-10 w-10 border border-white/10">
          {r.userImage ? <AvatarImage src={r.userImage} alt={r.userName || ''} /> : <AvatarFallback>{(r.userName || 'U')[0]}</AvatarFallback>}
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">{r.userName || 'User'}</p>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < (r.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
              ))}
            </div>
          </div>
          {r.comment && <p className="mt-2 text-sm text-gray-300 leading-relaxed line-clamp-3">"{r.comment}"</p>}
        </div>
      </CardContent>
    </Card>
  )
}

function FloatingIcon({ children, delay, x, y }: { children: React.ReactNode, delay: number, x: number | string, y: number | string }) {
  return (
    <motion.div
      initial={{ x: 0, y: 0, opacity: 0 }}
      animate={{
        y: [0, -20, 0],
        opacity: [0, 0.4, 0],
        rotate: [0, 10, -10, 0]
      }}
      transition={{
        duration: 8,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute text-white/10 pointer-events-none z-0"
      style={{ left: x, top: y }}
    >
      {children}
    </motion.div>
  )
}

export default function LandingPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [allReviews, setAllReviews] = useState<PublicReview[]>([])
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [openReviews, setOpenReviews] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)

  const { scrollY } = useScroll();
  const headerBackground = useTransform(scrollY, [0, 50], ["rgba(0,0,0,0)", "rgba(0,0,0,0.6)"]);
  const headerBackdrop = useTransform(scrollY, [0, 50], ["blur(0px)", "blur(12px)"]);
  const headerBorder = useTransform(scrollY, [0, 50], ["rgba(255,255,255,0)", "rgba(255,255,255,0.1)"]);

  const [hovered, setHovered] = useState(false)

  // Fetch reviews logic (kept same as before)
  useEffect(() => {
    ; (async () => {
      try {
        const res = await fetch('/api/reviews?sort=rating&limit=25')
        if (!res.ok) return
        const data = await res.json()
        setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
      } catch { }
    })()
  }, [])

  useEffect(() => {
    ; (async () => {
      try {
        if (!openReviews || allReviews.length) return
        const res = await fetch('/api/reviews?sort=date')
        if (!res.ok) return
        const data = await res.json()
        setAllReviews(Array.isArray(data?.reviews) ? data.reviews : [])
      } catch { }
    })()
  }, [openReviews, allReviews.length])

  useEffect(() => {
    if (!carouselApi || hovered) return
    const id = setInterval(() => {
      try { carouselApi.scrollNext() } catch { }
    }, 4000)
    return () => clearInterval(id)
  }, [carouselApi, hovered])

  const filteredReviews = useMemo(() => {
    const base = allReviews.length ? allReviews : reviews
    if (ratingFilter === 'all') return base
    const r = Number(ratingFilter)
    if (!Number.isFinite(r)) return base
    return base.filter(x => Number(x.rating) === r)
  }, [reviews, allReviews, ratingFilter])

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
  }

  return (
    <main className="min-h-screen w-full relative font-sans selection:bg-primary/30">
      <PageBackground />

      {/* Floating Atmosphere Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FloatingIcon delay={0} x="10%" y="20%"><Music className="w-12 h-12" /></FloatingIcon>
        <FloatingIcon delay={2} x="80%" y="15%"><Cloud className="w-16 h-16" /></FloatingIcon>
        <FloatingIcon delay={4} x="20%" y="70%"><Moon className="w-10 h-10" /></FloatingIcon>
        <FloatingIcon delay={1} x="85%" y="60%"><Coffee className="w-14 h-14" /></FloatingIcon>
        <FloatingIcon delay={3} x="50%" y="40%"><Sparkles className="w-8 h-8" /></FloatingIcon>
      </div>

      <motion.header
        style={{ backgroundColor: headerBackground, backdropFilter: headerBackdrop, borderColor: headerBorder }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-9 w-auto rounded-lg relative z-10" />
            </div>
            <span className="text-white text-lg font-bold tracking-tight">LofiStudio</span>
          </Link>

          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end">
                  <span className="text-xs text-gray-400">Welcome back,</span>
                  <span className="text-sm font-medium text-white">{session.user.name?.split(' ')[0]}</span>
                </div>
                <Link href="/studio">
                  <Button className="rounded-full bg-white text-black hover:bg-gray-200 font-medium px-6">
                    Enter Studio
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <Button variant="ghost" className="text-gray-300 hover:text-white hover:bg-white/5" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
                <Button asChild className="rounded-full bg-white/10 border border-white/10 hover:bg-white/20 text-white backdrop-blur-md">
                  <Link href="/studio">Get Started <ArrowRight className="w-4 h-4 ml-2" /></Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </motion.header>

      <section className="relative z-10 px-6 pt-40 pb-32 min-h-[90vh] flex flex-col items-center justify-center text-center">
        <motion.div variants={container} initial="hidden" animate="show" className="max-w-4xl mx-auto">

          <motion.div variants={item} className="mb-8 flex justify-center">
            <VersionBadge />
          </motion.div>

          {session?.user ? (
            <motion.h1 variants={item} className="font-bold text-white text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8 drop-shadow-2xl">
              Ready to find <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300">your flow, {session.user.name?.split(' ')[0]}?</span>
            </motion.h1>
          ) : (
            <motion.h1 variants={item} className="font-bold text-white text-5xl md:text-7xl lg:text-8xl tracking-tight mb-8 drop-shadow-2xl">
              Your Personal <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200">Focus Sanctuary</span>
            </motion.h1>
          )}

          <motion.p variants={item} className="text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-12">
            Immerse yourself in lofi soundscapes, smart widgets, and a distraction-free environment designed for deep work.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {session?.user ? (
              <Button asChild size="lg" className="h-14 rounded-full px-10 text-lg font-semibold bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                <Link href="/studio">
                  Continue to Studio <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <>
                <Button onClick={() => signIn('google', { callbackUrl: '/studio' })} size="lg" className="h-14 rounded-full px-10 text-lg font-semibold bg-white text-black hover:bg-gray-200 hover:scale-105 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)]">
                  Join for Free
                </Button>
                <Button asChild variant="outline" size="lg" className="h-14 rounded-full px-10 text-lg border-white/20 bg-black/20 text-white hover:bg-white/10 hover:border-white/40 backdrop-blur-md">
                  <Link href="/studio">Try as Guest</Link>
                </Button>
              </>
            )}
          </motion.div>

        </motion.div>
      </section>

      <section className="relative z-10 px-6 py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-white mb-6">Crafted for Serenity</motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Every detail works in harmony to keep you in the zone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard icon={Waves} title="Ambient Mixer" description="Blend rain, cafe, and nature sounds with curated lofi stations." />
            <FeatureCard icon={Timer} title="Smart Focus" description="Integrated Pomodoro timer that tracks your productivity sessions." />
            <FeatureCard icon={Settings} title="Widget Grid" description="Drag, drop, and resize widgets to create your perfect setup." />
            <FeatureCard icon={CalendarDays} title="Life Sync" description="Connect your Google Calendar and Tasks to stay organized." />
            <FeatureCard icon={Sparkles} title="Visual Themes" description="Stunning backgrounds and glassmorphic UI that adapts to you." />
            <FeatureCard icon={Moon} title="Zen Mode" description="One click to hide everything and focus only on what matters." />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 py-24 border-t border-white/5 bg-gradient-to-b from-transparent to-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white">Loved by Creators</h2>
              <p className="text-gray-400 text-lg">Join the thousands who code, study, and create with LofiStudio.</p>
            </div>
            <Dialog open={openReviews} onOpenChange={setOpenReviews}>
              <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full border-white/20 text-white hover:bg-white/10">Read all reviews</Button>
              </DialogTrigger>
              {/* ... Dialog Content (Same as before but styled) ... */}
              <DialogContent className="bg-[#0c0c12] border-white/10 text-white max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Community Reviews</DialogTitle>
                </DialogHeader>
                <div className="flex items-center gap-3 py-4 border-b border-white/10">
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white">
                      <SelectValue placeholder="All Ratings" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a24] border-white/10 text-white">
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 overflow-y-auto p-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredReviews.map((r, i) => <ReviewCard key={i} r={r} />)}
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Carousel setApi={setCarouselApi} opts={{ loop: true, align: "start" }} className="w-full">
            <CarouselContent className="-ml-4">
              {reviews.map((r, i) => (
                <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <ReviewCard r={r} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="hidden md:flex gap-2 justify-end mt-4">
              <CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-white/10" />
              <CarouselNext className="static translate-y-0 bg-white/5 border-white/10 text-white hover:bg-white/10" />
            </div>
          </Carousel>
        </div>
      </section>

      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <div className="mb-8">
            <img src="/brand/lofistudio_logo.png" alt="Logo" className="h-12 w-auto mx-auto opacity-80 mb-4" />
            <p className="text-gray-500 text-sm max-w-md mx-auto">
              Built independently by MotionA. Designed for flow.
            </p>
          </div>
          <div className="flex items-center gap-6 mb-8">
            <a href="https://twitter.com/motiona_ok" target="_blank" className="text-gray-500 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://instagram.com/motiona.ok" target="_blank" className="text-gray-500 hover:text-white transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://github.com/Mateo-Piedra22" target="_blank" className="text-gray-500 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/studio" className="hover:text-white transition-colors">Start Focusing</Link>
            <Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
          <div className="mt-8 text-xs text-gray-600">
            &copy; {new Date().getFullYear()} LofiStudio by MotionA. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  )
}