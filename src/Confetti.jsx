import { useEffect, useRef } from 'react'

export default function Confetti({ active = false, onComplete }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const colors = [
      '#a855f7', // purple
      '#6366f1', // indigo
      '#10b981', // emerald
      '#f59e0b', // amber
      '#ec4899', // pink
      '#3b82f6', // blue
      '#14b8a6'  // teal
    ]

    const particleCount = 130
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: width * (0.2 + Math.random() * 0.6),
        y: height * 0.35 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 1,
        gravity: 0.35 + Math.random() * 0.1,
        drag: 0.98
      })
    }

    let startTime = Date.now()
    const duration = 3200 // 3.2 seconds

    function render() {
      const elapsed = Date.now() - startTime
      ctx.clearRect(0, 0, width, height)

      let stillAlive = false

      particles.forEach((p) => {
        p.vx *= p.drag
        p.vy += p.gravity
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        if (elapsed > 1800) {
          p.opacity = Math.max(0, 1 - (elapsed - 1800) / 1400)
        }

        if (p.opacity > 0 && p.y < height + 50) {
          stillAlive = true
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7)
          ctx.restore()
        }
      })

      if (stillAlive && elapsed < duration) {
        animationFrameId = requestAnimationFrame(render)
      } else {
        ctx.clearRect(0, 0, width, height)
        if (onComplete) onComplete()
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [active, onComplete])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 w-full h-full"
    />
  )
}
