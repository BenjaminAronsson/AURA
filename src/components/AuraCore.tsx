import { useEffect, useRef } from 'react'
import { audio } from '../game/audio'
import { settings } from '../game/settings'

/**
 * The moving AURA visual — a "pulsing signal core": concentric breathing rings,
 * an expanding scan pulse, and a central sine waveform, all in the amber/green
 * CRT palette. Subtly reacts to the ambient hum via audio.getLevel(). Respects
 * the reduce-motion setting. Self-contained canvas render loop.
 */
export function AuraCore() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const GREEN = '#35ff8a'
    const AMBER = '#ffb347'
    let raf = 0
    let t0 = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      canvas.width = Math.max(1, Math.floor(w * dpr))
      canvas.height = Math.max(1, Math.floor(h * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const draw = (now: number) => {
      const reduce = settings.current.reduceMotion
      const t = (now - t0) / 1000
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      const cx = w / 2
      const cy = h / 2
      const R = Math.min(w, h) * 0.42
      const level = audio.getLevel() // 0..~1
      const energy = reduce ? 0.12 : 0.28 + level * 0.9

      ctx.clearRect(0, 0, w, h)
      ctx.lineCap = 'round'

      // Concentric breathing rings.
      const rings = 5
      for (let i = 0; i < rings; i++) {
        const phase = reduce ? 0 : Math.sin(t * 0.8 + i * 0.7) * (4 + energy * 10)
        const r = R * (0.28 + (i / rings) * 0.72) + phase
        const alpha = 0.08 + (1 - i / rings) * 0.18
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(53, 255, 138, ${alpha})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Expanding scan pulse (skipped under reduce-motion).
      if (!reduce) {
        const pulse = (t * 0.35) % 1
        ctx.beginPath()
        ctx.arc(cx, cy, R * (0.2 + pulse * 0.95), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 179, 71, ${0.3 * (1 - pulse)})`
        ctx.lineWidth = 1.5
        ctx.stroke()
      }

      // Central waveform core.
      const bandR = R * 0.5
      const amp = bandR * (0.12 + energy * 0.35)
      ctx.beginPath()
      const seg = 72
      for (let i = 0; i <= seg; i++) {
        const x = cx - bandR + (i / seg) * bandR * 2
        const k = (i / seg) * Math.PI * 2
        const env = Math.sin((i / seg) * Math.PI) // taper at edges
        const y =
          cy + Math.sin(k * 3 + (reduce ? 0 : t * 3)) * amp * env +
          Math.sin(k * 7 + (reduce ? 0 : t * 1.7)) * amp * 0.3 * env
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.strokeStyle = GREEN
      ctx.lineWidth = 1.6
      ctx.shadowBlur = 12 + energy * 18
      ctx.shadowColor = GREEN
      ctx.stroke()
      ctx.shadowBlur = 0

      // Core dot.
      const coreR = 3 + energy * 7
      ctx.beginPath()
      ctx.arc(cx, cy, coreR, 0, Math.PI * 2)
      ctx.fillStyle = AMBER
      ctx.shadowBlur = 14 + energy * 20
      ctx.shadowColor = AMBER
      ctx.fill()
      ctx.shadowBlur = 0

      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="aura-core" aria-hidden="true" />
}
