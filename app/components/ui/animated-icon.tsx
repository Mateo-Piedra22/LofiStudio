  "use client"
import React from 'react'
import lottie from 'lottie-web'
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

const LOTTIE_NAMES = new Set([
  'CloudRain','CloudLightning','Sun','Cloud','Droplets','Wind','MapPin','Volume2'
])

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
  const src = LOTTIE_NAMES.has(name) ? `/api/lottie?name=${encodeURIComponent(name)}` : undefined

  React.useEffect(() => {
    if (!src) return
    let disposed = false
    const ensure = async () => {
      try {
        const r = await fetch(src)
        if (!r.ok) throw new Error('lottie json fetch failed')
        const json = await r.json()
        if (disposed) return
        const container = containerRef.current
        if (!container) throw new Error('missing container')
        const anim = lottie.loadAnimation({ container, renderer: 'svg', loop: true, autoplay: true, animationData: json })
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
