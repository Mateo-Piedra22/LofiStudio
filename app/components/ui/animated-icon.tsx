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
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const src = LOTTIE_MAP[name] ? `/api/lottie?name=${encodeURIComponent(name)}` : undefined

  React.useEffect(() => {
    if (!src) return
    let disposed = false
    const ensure = async () => {
      try {
        if (!(window as any).lottie) {
          await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script')
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/bodymovin/5.12.2/lottie.min.js'
            s.async = true
            s.onload = () => resolve()
            s.onerror = () => reject(new Error('lottie script failed'))
            document.head.appendChild(s)
          })
        }
        const r = await fetch(src)
        if (!r.ok) throw new Error('lottie json fetch failed')
        const json = await r.json()
        if (disposed) return
        const anim = (window as any).lottie?.loadAnimation({ container: containerRef.current, renderer: 'svg', loop: true, autoplay: true, animationData: json })
        return () => { try { anim?.destroy() } catch {} }
      } catch {
        setFailed(true)
      }
    }
    const cleanup = ensure()
    return () => { disposed = true; if (typeof cleanup === 'function') { try { (cleanup as any)() } catch {} } }
  }, [src])

  if (!failed && src) {
    return <div ref={containerRef} className={className} aria-hidden="true" />
  }
  const Comp = FALLBACK[name] || Cloud
  return <Comp className={className} />
}

export default AnimatedIcon
