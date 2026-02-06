'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import VersionBadge from '@/app/components/VersionBadge'
import PageBackground from '@/app/components/PageBackground'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Star, ArrowRight, Coffee, Waves, Timer, CalendarDays, Settings, Sparkles, Twitter, Instagram, Github } from 'lucide-react'

type PublicReview = { userName: string | null; userImage: string | null; rating: number; comment: string | null }

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.5, ease: "backOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="p-8 flex flex-col items-start gap-4 relative z-10">
        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center shadow-inner ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
          <Icon className="h-7 w-7" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
          <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ReviewCard({ r }: { r: PublicReview }) {
  return (
    <Card className="glass-panel border bg-white/5 backdrop-blur-md">
      <CardContent className="p-4 flex gap-3 items-start">
        <Avatar>
          {r.userImage ? <AvatarImage src={r.userImage} alt={r.userName || ''} /> : <AvatarFallback>{(r.userName || 'U')[0]}</AvatarFallback>}
        </Avatar>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{r.userName || 'User'}</p>
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={`w-4 h-4 ${i < (r.rating || 0) ? 'text-yellow-400' : 'text-muted-foreground'}`} fill={i < (r.rating || 0) ? 'currentColor' : 'none'} />
            ))}
          </div>
          {r.comment && <p className="mt-2 text-sm text-gray-300">{r.comment}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

export default function LandingPage() {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [allReviews, setAllReviews] = useState<PublicReview[]>([])
  const [ratingFilter, setRatingFilter] = useState<string>('all')
  const [openReviews, setOpenReviews] = useState(false)
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      try {
        carouselApi.scrollNext()
      } catch { }
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
    show: { opacity: 1, transition: { staggerChildren: 0.15 } },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  }

  return (
    <main className="min-h-screen w-full relative font-sans selection:bg-primary/30">
      <PageBackground />

      <header className="fixed top-0 left-0 right-0 z-50 px-6 pt-6 transition-all duration-300">
        <div className={`max-w-7xl mx-auto px-6 py-4 rounded-full border transition-all duration-500 ${scrolled ? 'bg-black/60 border-white/10 backdrop-blur-xl shadow-2xl translate-y-0' : 'bg-transparent border-transparent -translate-y-2'}`}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-10 w-auto rounded-xl shadow-lg relative z-10" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight group-hover:text-primary transition-colors">LofiStudio</span>
            </Link>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <span className="text-white text-sm font-medium bg-white/5 px-4 py-2 rounded-full border border-white/5">Example User{/* session.user.name */}</span>
              ) : (
                <>
                  <Button variant="ghost" className="hidden sm:inline-flex text-white/80 hover:text-white hover:bg-white/5" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
                  <Button asChild className="bg-gradient-to-r from-purple-600/60 to-pink-600/60 border border-purple-400/50 text-white hover:from-purple-600/80 hover:to-pink-600/80 shadow-xl">
                    <Link href="/studio" className="flex items-center gap-2">Go to Studio<ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-6 pt-48 pb-32 min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none opacity-50" />

        <div className="max-w-7xl mx-auto w-full text-center relative z-10">
          <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col items-center">

            <motion.div variants={item} className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs font-semibold tracking-wide text-green-300 uppercase">V2 Live Now</span>
            </motion.div>

            <motion.h1 variants={item} className="font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/60 text-6xl md:text-8xl lg:text-9xl tracking-tighter leading-[1.1] mb-8">
              Focus Like <br className="hidden md:block" /> Never Before
            </motion.h1>

            <motion.p variants={item} className="text-lg md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
              Your personal sanctuary for productivity. Immerse yourself in curated lofi soundscapes,
              powerful widgets, and a <span className="text-white font-medium">distraction-free</span> environment.
            </motion.p>

            <motion.div variants={item} className="p-1 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-black/40 rounded-full p-2">
                <Button asChild size="lg" className="rounded-full px-8 py-7 text-lg font-semibold bg-primary hover:bg-primary/90 text-white shadow-[0_0_30px_-10px_rgba(var(--primary),0.6)] hover:shadow-[0_0_40px_-10px_rgba(var(--primary),0.8)] transition-all duration-300">
                  <Link href="/studio" className="flex items-center gap-2">Enter Studio <ArrowRight className="w-5 h-5" /></Link>
                </Button>
                {!session?.user && (
                  <Button onClick={() => signIn('google')} variant="ghost" size="lg" className="rounded-full px-8 py-7 text-lg font-medium text-white hover:bg-white/10">
                    Login to Save
                  </Button>
                )}
              </div>
            </motion.div>

            <motion.div variants={item} className="mt-20 flex items-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Trust badges or similar could go here */}
              <div className="text-xs text-center text-gray-500 uppercase tracking-widest font-semibold">Trusted by thousands of focus seekers</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-6">Why LofiStudio?</motion.h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Designed for flow. Engineered for focus. Experience the V2 difference.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={Waves} title="Immersive Ambience" description="Curated lofi playlists and ambient sounds crafted for deep focus." />
            <FeatureCard icon={Timer} title="Productive Timers" description="Pomodoro and tasks that keep your sessions structured and effective." />
            <FeatureCard icon={CalendarDays} title="Calendar Integration" description="Plan your day and sync events for a calm, organized workflow." />
            <FeatureCard icon={Settings} title="Flexible Widgets" description="Arrange and customize widgets in a powerful, elegant dashboard." />
            <FeatureCard icon={Sparkles} title="Polished Design" description="A refined glassmorphism UI with delightful micro-interactions." />
            <FeatureCard icon={Waves} title="Zen Mode" description="Reduce visual noise and drift into a distraction-free environment." />
          </div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div>
              <h2 className="text-4xl font-bold text-white mb-2">Community Love</h2>
              <p className="text-gray-400 text-lg">Join thousands of users who have found their flow.</p>
            </div>
            <Dialog open={openReviews} onOpenChange={setOpenReviews}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/20">Read More Reviews</Button>
              </DialogTrigger>
              <DialogContent className="bg-black/80 backdrop-blur-md border border-gray-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Reviews</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger className="w-40 bg-black/30 text-white border-gray-700" aria-label="Filter by rating">
                        <SelectValue placeholder="Filter" />
                      </SelectTrigger>
                      <SelectContent className="bg-black/80 text-white border-gray-700">
                        <SelectItem value="all">All ratings</SelectItem>
                        <SelectItem value="5">5 stars</SelectItem>
                        <SelectItem value="4">4 stars</SelectItem>
                        <SelectItem value="3">3 stars</SelectItem>
                        <SelectItem value="2">2 stars</SelectItem>
                        <SelectItem value="1">1 star</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto pr-2">
                    {filteredReviews.map((r, idx) => (
                      <ReviewCard key={idx} r={r} />
                    ))}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <Carousel setApi={setCarouselApi} opts={{ loop: true, align: 'start' }} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
            <CarouselContent>
              {reviews.map((r, idx) => (
                <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                  <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
                    <ReviewCard r={r} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
            <CarouselNext className="bg-white/10 border-white/20 text-white hover:bg-white/20" />
          </Carousel>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl p-12 md:p-16">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-50" />
            <div className="relative z-10">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">Support LofiStudio</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                We are an independent team building tools for your peace of mind.
                If LofiStudio helps you, consider supporting our work.
              </p>
              <Button asChild size="lg" className="bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold rounded-full text-lg px-8 py-6 shadow-[0_0_20px_rgba(255,221,0,0.4)] hover:shadow-[0_0_30px_rgba(255,221,0,0.6)] transition-all">
                <a href="https://cafecito.app/motiona" target="_blank" rel="noopener" className="flex items-center gap-2">
                  <Coffee className="w-5 h-5 fill-current" /> Buy Us a Coffee
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 pt-24 pb-12 border-t border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-10 w-auto rounded-lg shadow-lg" />
                <span className="text-white text-xl font-bold tracking-tight">LofiStudio</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
                Your personal sanctuary for focus and relaxation. Crafted with care to help you find your flow.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <a href="https://twitter.com/motiona_ok" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/motiona.ok" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://github.com/Mateo-Piedra22" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors" aria-label="GitHub">
                  <Github className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/studio" className="hover:text-white transition-colors">Open Studio</Link></li>
                <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link href="/legal" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-6">Status</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                All systems operational
              </div>
              <VersionBadge />
            </div>
          </div>

          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
            <p>© {new Date().getFullYear()} LofiStudio by MotionA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}