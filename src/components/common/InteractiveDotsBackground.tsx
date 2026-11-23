import React, { useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface Dot {
  originX: number
  originY: number
  x: number
  y: number
  vx: number
  vy: number
  baseRadius: number
}

interface Shockwave {
  x: number
  y: number
  currentRadius: number
  maxRadius: number
  speed: number
  thickness: number
  force: number
}

export const InteractiveDotsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const { theme } = useTheme()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = 0
    let height = 0
    const dots: Dot[] = []
    const shockwaves: Shockwave[] = []

    const SPACING = 30
    const REPEL_RADIUS = 110
    const REPEL_FORCE = 6.5
    const RETURN_SPEED = 0.08
    const DAMPING = 0.82

    let mouseX = -9999
    let mouseY = -9999
    let isMouseActive = false

    const initDots = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight

      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      ctx.scale(dpr, dpr)

      dots.length = 0
      const cols = Math.ceil(width / SPACING) + 1
      const rows = Math.ceil(height / SPACING) + 1

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * SPACING
          const y = r * SPACING
          dots.push({
            originX: x,
            originY: y,
            x,
            y,
            vx: 0,
            vy: 0,
            baseRadius: 1.25,
          })
        }
      }
    }

    const triggerShockwave = (x: number, y: number) => {
      // Create new expanding shockwave ripple
      shockwaves.push({
        x,
        y,
        currentRadius: 0,
        maxRadius: Math.max(width, height) * 0.7,
        speed: 13,
        thickness: 45,
        force: 16,
      })

      // Limit max concurrent shockwaves to keep 60 FPS silky smooth
      if (shockwaves.length > 5) {
        shockwaves.shift()
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      isMouseActive = true
    }

    const handleMouseLeave = () => {
      mouseX = -9999
      mouseY = -9999
      isMouseActive = false
    }

    const handleMouseDown = (e: MouseEvent) => {
      triggerShockwave(e.clientX, e.clientY)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
        isMouseActive = true
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0]
        mouseX = touch.clientX
        mouseY = touch.clientY
        isMouseActive = true
        triggerShockwave(touch.clientX, touch.clientY)
      }
    }

    const handleTouchEnd = () => {
      mouseX = -9999
      mouseY = -9999
      isMouseActive = false
    }

    window.addEventListener('resize', initDots)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    initDots()

    const isDark = theme === 'dark'

    // Colors
    const defaultDotColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(148, 163, 184, 0.35)'
    const activeDotColor = isDark ? 'rgba(146, 223, 79, 0.7)' : 'rgba(112, 196, 40, 0.65)'

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      // 1. Update and render active shockwaves
      for (let w = shockwaves.length - 1; w >= 0; w--) {
        const wave = shockwaves[w]
        wave.currentRadius += wave.speed

        const progress = wave.currentRadius / wave.maxRadius
        const waveOpacity = Math.max(0, 1 - progress)

        if (progress >= 1) {
          shockwaves.splice(w, 1)
          continue
        }

        // Draw visual neon shockwave ring
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.currentRadius, 0, Math.PI * 2)
        ctx.strokeStyle = isDark
          ? `rgba(146, 223, 79, ${waveOpacity * 0.28})`
          : `rgba(112, 196, 40, ${waveOpacity * 0.22})`
        ctx.lineWidth = 2.5
        ctx.stroke()

        // Apply radial outward displacement to dots along the shockwave crest
        for (let i = 0; i < dots.length; i++) {
          const dot = dots[i]
          const dx = dot.x - wave.x
          const dy = dot.y - wave.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const diff = dist - wave.currentRadius

          if (Math.abs(diff) < wave.thickness) {
            const pushFactor =
              (1 - Math.abs(diff) / wave.thickness) * wave.force * waveOpacity
            const nx = dx / (dist || 1)
            const ny = dy / (dist || 1)
            dot.vx += nx * pushFactor
            dot.vy += ny * pushFactor
          }
        }
      }

      // 2. Update and render dots
      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i]

        // Physics: Repulsion from cursor
        if (isMouseActive) {
          const dx = dot.x - mouseX
          const dy = dot.y - mouseY
          const dist = Math.sqrt(dx * dx + dy * dy)

          if (dist < REPEL_RADIUS && dist > 0) {
            const force = (1 - dist / REPEL_RADIUS) * REPEL_FORCE
            const nx = dx / dist
            const ny = dy / dist
            dot.vx += nx * force
            dot.vy += ny * force
          }
        }

        // Physics: Spring pull back to origin
        const homeDx = dot.originX - dot.x
        const homeDy = dot.originY - dot.y
        dot.vx += homeDx * RETURN_SPEED
        dot.vy += homeDy * RETURN_SPEED

        // Damping
        dot.vx *= DAMPING
        dot.vy *= DAMPING

        dot.x += dot.vx
        dot.y += dot.vy

        // Draw dot with dynamic neon color when displaced
        const distFromOrigin = Math.sqrt(homeDx * homeDx + homeDy * homeDy)
        const isDisplaced = distFromOrigin > 1

        ctx.beginPath()
        ctx.arc(
          dot.x,
          dot.y,
          isDisplaced ? dot.baseRadius * 1.35 : dot.baseRadius,
          0,
          Math.PI * 2
        )
        ctx.fillStyle = isDisplaced ? activeDotColor : defaultDotColor
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', initDots)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      cancelAnimationFrame(animationFrameId)
    }
  }, [theme])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
