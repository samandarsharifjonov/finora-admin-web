import React, { useState, useEffect, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  maxTilt?: number
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6.5,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [tilt, setTilt] = useState({ rotX: 0, rotY: 0, glareX: 50, glareY: 50, active: false })
  const targetRef = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50, active: false })
  const currentRef = useRef({ rotX: 0, rotY: 0, glareX: 50, glareY: 50 })
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current
      if (!card) return

      const rect = card.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Mouse distance relative to card center
      const dx = e.clientX - centerX
      const dy = e.clientY - centerY

      // Normalize across window width/height
      const normX = Math.max(-1, Math.min(1, dx / (window.innerWidth / 2)))
      const normY = Math.max(-1, Math.min(1, dy / (window.innerHeight / 2)))

      // Target rotation angles (perspective tilt)
      const rotY = normX * maxTilt
      const rotX = -normY * maxTilt

      // Glare position relative to card boundaries
      const glareX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
      const glareY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

      targetRef.current = {
        rotX,
        rotY,
        glareX,
        glareY,
        active: true,
      }
    }

    const handleMouseLeave = () => {
      targetRef.current = {
        rotX: 0,
        rotY: 0,
        glareX: 50,
        glareY: 50,
        active: false,
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseleave', handleMouseLeave)

    // Butter-smooth lerp animation loop (60fps)
    const animate = () => {
      const target = targetRef.current
      const current = currentRef.current
      const lerpFactor = 0.09

      current.rotX += (target.rotX - current.rotX) * lerpFactor
      current.rotY += (target.rotY - current.rotY) * lerpFactor
      current.glareX += (target.glareX - current.glareX) * lerpFactor
      current.glareY += (target.glareY - current.glareY) * lerpFactor

      setTilt({
        rotX: Number(current.rotX.toFixed(3)),
        rotY: Number(current.rotY.toFixed(3)),
        glareX: Number(current.glareX.toFixed(2)),
        glareY: Number(current.glareY.toFixed(2)),
        active: target.active,
      })

      rafId.current = requestAnimationFrame(animate)
    }

    rafId.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [maxTilt])

  // Specular sheen colors
  const sheenGradient = isDark
    ? `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.12), transparent 70%)`
    : `radial-gradient(circle 380px at ${tilt.glareX}% ${tilt.glareY}%, rgba(255, 255, 255, 0.6), transparent 70%)`

  // Dynamic 3D shadow shifting realistically in opposite direction of tilt
  const shadowX = -tilt.rotY * 2.2
  const shadowY = tilt.rotX * 2.2 + 16
  const shadowBlur = 38
  const shadowSpread = -6
  const shadowColor = isDark ? 'rgba(0, 0, 0, 0.55)' : 'rgba(15, 23, 42, 0.08)'

  return (
    <div
      ref={cardRef}
      className={`relative will-change-transform ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotX}deg) rotateY(${tilt.rotY}deg)`,
        boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px ${shadowSpread}px ${shadowColor}`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Specular Glass Reflection Sheen */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-3xl transition-opacity duration-300"
        style={{
          background: sheenGradient,
          opacity: tilt.active ? 1 : 0,
        }}
        aria-hidden="true"
      />

      {/* Card Body */}
      {children}
    </div>
  )
}
