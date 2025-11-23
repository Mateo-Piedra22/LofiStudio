'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/app/components/Toast'

export default function ReviewExperience() {
  const [rating, setRating] = useState<number>(0)
  const [hover, setHover] = useState<number>(0)
  const [comment, setComment] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [sent, setSent] = useState<boolean>(false)
  const toast = useToast()

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/reviews?me=1')
        if (!res.ok) return
        const data = await res.json()
        const r = data?.review
        if (r) {
          setRating(Number(r.rating) || 0)
          setComment(r.comment || '')
        }
      } catch {}
    })()
  }, [])

  const submit = async () => {
    if (!rating) return
    setLoading(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      if (res.ok) {
        setSent(true)
        toast.success('Reseña guardada', 3000)
        setTimeout(() => setSent(false), 3000)
      } else {
        toast.error('Error al guardar reseña', 4000)
      }
    } catch {
      toast.error('Error de red', 4000)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-green-500/10 border border-green-500/20 rounded-lg">
        <CheckCircle2 className="w-12 h-12 text-green-400 mb-2" />
        <p className="text-foreground font-medium">¡Gracias por tu reseña!</p>
        <p className="text-muted-foreground text-sm">Tu opinión ayuda a mejorar LofiStudio.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 rounded-lg glass border">
      <div>
        <p className="text-sm text-muted-foreground mb-2">¿Cómo fue tu experiencia?</p>
        <div className="flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, i) => {
            const idx = i + 1
            const active = (hover || rating) >= idx
            return (
              <button
                key={idx}
                onClick={() => setRating(idx)}
                onMouseEnter={() => setHover(idx)}
                onMouseLeave={() => setHover(0)}
                className={`p-2 rounded-lg ${active ? 'bg-primary/10' : 'hover:bg-accent/10'} transition-colors`}
              >
                <Star className={`w-6 h-6 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-sm text-muted-foreground mb-2">Cuéntanos más</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te gustó? ¿Qué mejorarías?"
          className="bg-background/50 border-border text-foreground min-h-[100px]"
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={submit} disabled={!rating || loading} className="w-full sm:w-auto">
          {loading ? 'Guardando…' : 'Guardar reseña'}
        </Button>
      </div>
    </div>
  )
}

