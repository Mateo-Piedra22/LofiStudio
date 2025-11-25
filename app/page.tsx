'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { signIn, useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'
import { Star, ArrowRight, Coffee, Waves, Timer, CalendarDays, Settings, Sparkles } from 'lucide-react'

type PublicReview = { userName: string | null; userImage: string | null; rating: number; comment: string | null }

function FeatureCard({ icon: Icon, title, description }: { icon: any; title: string; description: string }) {
  return (
    <motion.div whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="rounded-xl border glass-panel bg-white/5 backdrop-blur-md shadow-lg">
      <div className="p-6 flex items-start gap-4">
        <div className="h-12 w-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center shadow">
          <Icon className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white drop-shadow-sm">{title}</h3>
          <p className="mt-1 text-gray-300">{description}</p>
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

export default function HomePage() {
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
    ;(async () => {
      try {
        const res = await fetch('/api/reviews?sort=rating&limit=25')
        if (!res.ok) return
        const data = await res.json()
        setReviews(Array.isArray(data?.reviews) ? data.reviews : [])
      } catch {}
    })()
  }, [])

  useEffect(() => {
    ;(async () => {
      try {
        if (!openReviews || allReviews.length) return
        const res = await fetch('/api/reviews?sort=date')
        if (!res.ok) return
        const data = await res.json()
        setAllReviews(Array.isArray(data?.reviews) ? data.reviews : [])
      } catch {}
    })()
  }, [openReviews, allReviews.length])

  useEffect(() => {
    if (!carouselApi || hovered) return
    const id = setInterval(() => {
      try {
        carouselApi.scrollNext()
      } catch {}
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
    <main className="min-h-screen w-full relative font-sans">
      <div className="fixed inset-0 -z-20 bg-[url('/lofistudio-bg.png')] bg-cover bg-center bg-no-repeat bg-fixed" />
      <div className="fixed inset-0 -z-10 bg-black/70" />

      <header className="fixed top-0 left-0 right-0 z-30 px-6 pt-4">
        <div className={`max-w-7xl mx-auto px-4 py-3 rounded-2xl border transition-all duration-300 backdrop-blur-md ${scrolled ? 'bg-black/80 border-gray-800 shadow-lg' : 'bg-black/10 border-transparent'}`}>
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-9 w-auto rounded-md shadow-md" />
              <span className="text-white text-xl font-bold uppercase tracking-wider">LofiStudio</span>
            </Link>
            <div className="flex items-center gap-3">
              {session?.user ? (
                <span className="text-white text-sm md:text-base font-semibold">Welcome {session.user.name || ''}</span>
              ) : (
                <>
                  <Button variant="ghost" className="bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
                  <Button asChild className="bg-gradient-to-r from-purple-600/60 to-pink-600/60 border border-purple-400/50 text-white hover:from-purple-600/80 hover:to-pink-600/80 shadow-xl">
                    <Link href="/studio" className="flex items-center gap-2">Go to Studio<ArrowRight className="w-4 h-4" /></Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="relative z-10 px-6 pt-40 pb-28 min-h-[80vh] flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <motion.div variants={container} initial="hidden" animate="show" className="text-center">
            <motion.h1 variants={item} className="font-extrabold text-white drop-shadow-lg text-5xl md:text-7xl leading-tight">Your Focus Sanctuary</motion.h1>
            <motion.p variants={item} className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">Personalized widgets, lofi music, and a polished glassmorphism interface to help you get into flow and stay there.</motion.p>
            <motion.div variants={item} className="mt-10 flex items-center justify-center gap-4">
              <Button asChild className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-purple-600/60 to-pink-600/60 border border-purple-500/50 text-white hover:from-purple-600/80 hover:to-pink-600/80 shadow-xl">
                <Link href="/studio" className="flex items-center gap-2">Enter the Studio<ArrowRight className="w-5 h-5" /></Link>
              </Button>
              <Button variant="outline" className="px-8 py-6 text-lg font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20" onClick={() => signIn('google', { callbackUrl: '/studio' })}>Login</Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="relative z-10 px-6 pb-24">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-3xl font-bold text-white mb-8 drop-shadow">Why LofiStudio?</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white drop-shadow">What Our Users Say</h2>
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
        <div className="max-w-3xl mx-auto text-center glass-panel border rounded-3xl px-8 py-10 bg-white/5 backdrop-blur-md">
          <h3 className="text-2xl font-bold text-white drop-shadow">Support LofiStudio</h3>
          <p className="mt-3 text-gray-300">Help us keep the systems running and continue shipping improvements.</p>
          <div className="mt-6">
            <Button asChild className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg shadow-xl px-8 py-6 text-lg font-semibold">
              <a href="https://cafecito.app/lofistudio" target="_blank" rel="noopener" className="flex items-center gap-2"><Coffee className="w-5 h-5" />Buy Us a Coffee</a>
            </Button>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 pt-8 pb-12">
        <div className="max-w-7xl mx-auto bg-black/80 backdrop-blur-md p-8 text-gray-400 border-t border-gray-800 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-center md:text-left">
            <div className="space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <img src="/brand/lofistudio_logo.png" alt="LofiStudio" className="h-16 w-auto rounded-md" />
                <span className="text-white text-lg font-bold uppercase tracking-wider">LofiStudio</span>
              </div>
              <p className="text-sm">A peaceful place to be the creator of whatever you desire.</p>
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold">Navigation</p>
              <div className="flex flex-col gap-1">
                <Link href="/privacy" className="hover:text-white">Privacy</Link>
                <Link href="/terms" className="hover:text-white">Terms</Link>
                <Link href="/faq" className="hover:text-white">FAQ</Link>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-white font-semibold">Social</p>
              <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="#" className="hover:text-white">Twitter</a>
                <a href="#" className="hover:text-white">Instagram</a>
                <a href="#" className="hover:text-white">Discord</a>
              </div>
            </div>
          </div>
          <div className="mt-8 text-center text-xs">© {new Date().getFullYear()} LofiStudio</div>
        </div>
      </footer>
    </main>
  )
}
