  "use client"
import React from 'react'
import {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Snowflake,
  CloudFog,
  Zap,
  Droplets,
  Wind as WindIcon,
  MapPin,
  Coffee,
  Waves,
  Trees,
  Flame,
  Bird,
  Ship,
  Book,
  Quote,
  Search,
  Settings as SettingsIcon,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  Home,
  ArrowLeft,
  Loader2,
  Ghost,
  Cookie,
  FileText,
  Save,
  Scale,
  Building2,
  Languages,
  RefreshCw,
  GripHorizontal,
  Image as ImageIcon,
  Edit2,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  List,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Play,
  Pause,
  Music2,
  Maximize2,
  Music,
  Timer as TimerIcon,
  Bell,
  BellOff,
  Briefcase,
  Keyboard,
  EyeOff,
  Eye,
  Calendar,
  Clock,
} from 'lucide-react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'lottie-player': any
    }
  }
}

const LOTTIE_MAP: Record<string, string> = {
  CloudRain: 'https://assets1.lottiefiles.com/packages/lf20_rain.json',
  CloudLightning: 'https://assets6.lottiefiles.com/packages/lf20_thunder.json',
  Sun: 'https://assets8.lottiefiles.com/packages/lf20_sun.json',
  Cloud: 'https://assets5.lottiefiles.com/packages/lf20_cloud.json',
  Snowflake: 'https://assets9.lottiefiles.com/packages/lf20_snowflake.json',
  CloudFog: 'https://assets1.lottiefiles.com/packages/lf20_fog.json',
  Zap: 'https://assets10.lottiefiles.com/packages/lf20_bolt.json',
  Droplets: 'https://assets2.lottiefiles.com/packages/lf20_droplets.json',
  Wind: 'https://assets8.lottiefiles.com/packages/lf20_wind.json',
  MapPin: 'https://assets1.lottiefiles.com/packages/lf20_mappin.json',
  Coffee: 'https://assets4.lottiefiles.com/packages/lf20_coffee.json',
  Waves: 'https://assets8.lottiefiles.com/packages/lf20_waves.json',
  Trees: 'https://assets7.lottiefiles.com/packages/lf20_forest.json',
  Flame: 'https://assets3.lottiefiles.com/packages/lf20_flame.json',
  Bird: 'https://assets2.lottiefiles.com/packages/lf20_bird.json',
  Ship: 'https://assets2.lottiefiles.com/packages/lf20_ship.json',
  Book: 'https://assets5.lottiefiles.com/packages/lf20_book.json',
  Quote: 'https://assets8.lottiefiles.com/packages/lf20_quote.json',
  Play: 'https://assets8.lottiefiles.com/packages/lf20_playbutton.json',
  Pause: 'https://assets9.lottiefiles.com/packages/lf20_pause.json',
  Search: 'https://assets2.lottiefiles.com/packages/lf20_search.json',
  SettingsIcon: 'https://assets7.lottiefiles.com/packages/lf20_settings_gear.json',
  Volume2: 'https://assets4.lottiefiles.com/private_files/lf30_volume.json',
  ChevronDown: 'https://assets8.lottiefiles.com/packages/lf20_chevrondown.json',
  ArrowLeft: 'https://assets6.lottiefiles.com/packages/lf20_arrowleft.json',
  Loader2: 'https://assets8.lottiefiles.com/packages/lf20_loader.json',
}

const FALLBACK: Record<string, React.ComponentType<any>> = {
  CloudRain,
  CloudLightning,
  Sun,
  Cloud,
  Snowflake,
  CloudFog,
  Zap,
  Droplets,
  Wind: WindIcon,
  MapPin,
  Coffee,
  Waves,
  Trees,
  Flame,
  Bird,
  Ship,
  Book,
  Quote,
  Search,
  SettingsIcon,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  CheckSquare,
  AlertTriangle,
  RotateCcw,
  Home,
  ArrowLeft,
  Loader2,
  Ghost,
  Cookie,
  FileText,
  Save,
  Scale,
  Building2,
  Languages,
  RefreshCw,
  GripHorizontal,
  Image: ImageIcon,
  Edit2,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  List,
  SkipForward,
  SkipBack,
  Repeat,
  Shuffle,
  Play,
  Pause,
  Music2,
  Maximize2,
  Music,
  Timer: TimerIcon,
  Bell,
  BellOff,
  Briefcase,
  Keyboard,
  EyeOff,
  Eye,
  Calendar,
  CalendarIcon: Calendar,
  Clock,
  ClockIcon: Clock,
}

export function AnimatedIcon({ name, className }: { name: string, className?: string }) {
  const [failed, setFailed] = React.useState(false)
  const [ready, setReady] = React.useState(false)
  const src = LOTTIE_MAP[name]

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.customElements?.get('lottie-player')) { setReady(true); return }
    const s = document.createElement('script')
    s.src = 'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js'
    s.async = true
    s.onload = () => { setReady(true) }
    s.onerror = () => { setFailed(true) }
    document.head.appendChild(s)
    return () => { try { document.head.removeChild(s) } catch {} }
  }, [])

  const ref = React.useRef<any>(null)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const onError = () => { setFailed(true); try { console.warn('[lottie] failed to render icon', name, src) } catch {} }
    el.addEventListener('error', onError)
    return () => el.removeEventListener('error', onError)
  }, [src])

  React.useEffect(() => {
    let active = true
    if (!src) return
    const ctl = new AbortController()
    const timer = setTimeout(() => { try { ctl.abort() } catch {} }, 6000)
    fetch(src, { signal: ctl.signal }).then(r => {
      if (!active) return
      if (!r.ok) { setFailed(true); try { console.warn('[lottie] fetch failed', name, src, r.status) } catch {} }
    }).catch(() => { if (active) { setFailed(true); try { console.warn('[lottie] fetch error', name, src) } catch {} } })
    return () => { active = false; clearTimeout(timer); ctl.abort() }
  }, [src])

  if (ready && !failed && src) {
    return (
      <lottie-player ref={ref} src={src} background="transparent" speed="1" loop autoplay className={className} aria-hidden="true"></lottie-player>
    )
  }
  const Comp = FALLBACK[name] || Cloud
  return <Comp className={className} />
}

export default AnimatedIcon
