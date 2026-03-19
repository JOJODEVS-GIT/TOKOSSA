'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface AnimatedCounterProps {
  /** Valeur cible du compteur */
  value: number
  /** Suffixe affiche apres le nombre (ex: "+") */
  suffix?: string
  /** Label affiche sous le compteur */
  label?: string
  /** Duree de l'animation en millisecondes */
  duration?: number
}

/**
 * Compteur anime qui s'active quand il entre dans le viewport.
 * Utilise IntersectionObserver pour detecter la visibilite
 * et une interpolation easeOutQuart pour un rendu fluide.
 */
export default function AnimatedCounter({
  value,
  suffix = '',
  label,
  duration = 2000,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const containerRef = useRef<HTMLSpanElement>(null)

  // Fonction d'interpolation easeOutQuart pour un ralentissement progressif
  const easeOutQuart = useCallback((t: number): number => {
    return 1 - Math.pow(1 - t, 4)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)

          // Animation du compteur via requestAnimationFrame
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            const easedProgress = easeOutQuart(progress)
            const currentValue = Math.round(easedProgress * value)

            setDisplayValue(currentValue)

            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }

          requestAnimationFrame(animate)
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [value, duration, hasAnimated, easeOutQuart])

  return (
    <span ref={containerRef} className="inline-flex flex-col items-center">
      <span className="text-5xl font-bold text-secondary-500 tabular-nums">
        {displayValue}
        {suffix}
      </span>
      {label && (
        <span className="text-sm text-warm-500 mt-1">{label}</span>
      )}
    </span>
  )
}
