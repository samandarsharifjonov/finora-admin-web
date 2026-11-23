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

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX
        mouseY = e.touches[0].clientY
        isMouseActive = true
      }
    }

    const handleTouchEnd = () => {
      mouseX = -9999
      mouseY = -9999
      isMouseActive = false
    }

    window.addEventListener('resize', initDots)
    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('touchmove', handleTouchMove, { passive: true })
    window.addEventListener('touchend', handleTouchEnd)

    initDots()

    const isDark = theme === 'dark'

    // Colors
    const defaultDotColor = isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(148, 163, 184, 0.35)'
    const activeDotColor = isDark ? 'rgba(146, 223, 79, 0.65)' : 'rgba(112, 196, 40, 0.6)'

    const render = () => {
      ctx.clearRect(0, 0, width, height)

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

        // Draw dot
        const distFromOrigin = Math.sqrt(homeDx * homeDx + homeDy * homeDy)
        const isDisplaced = distFromOrigin > 1

        ctx.beginPath()
        ctx.arc(dot.x, dot.y, isDisplaced ? dot.baseRadius * 1.3 : dot.baseRadius, 0, Math.PI * 2)
        ctx.fillStyle = isDisplaced ? activeDotColor : defaultDotColor
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', initDots)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('touchmove', handleTouchMove)
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
