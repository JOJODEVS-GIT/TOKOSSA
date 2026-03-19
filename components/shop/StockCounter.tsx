'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface StockCounterProps {
  stock: number
  maxStock?: number
  showBar?: boolean
  className?: string
}

export default function StockCounter({
  stock,
  maxStock = 20,
  showBar = true,
  className,
}: StockCounterProps) {
  const percentage = Math.min((stock / maxStock) * 100, 100)

  const getColor = () => {
    if (stock <= 0) return 'red'
    if (stock <= 3) return 'red'
    if (stock <= 5) return 'amber'
    if (stock <= 10) return 'yellow'
    return 'green'
  }

  const color = getColor()

  const colorClasses = {
    red: {
      fill: 'bg-red-500',
      text: 'text-red-600',
      icon: 'text-red-500',
    },
    amber: {
      fill: 'bg-amber-500',
      text: 'text-amber-600',
      icon: 'text-amber-500',
    },
    yellow: {
      fill: 'bg-yellow-500',
      text: 'text-yellow-600',
      icon: 'text-yellow-500',
    },
    green: {
      fill: 'bg-green-500',
      text: 'text-green-600',
      icon: 'text-green-500',
    },
  }

  const colors = colorClasses[color]

  if (stock <= 0) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="inline-flex items-center px-3 py-1.5 bg-red-50 text-red-700 text-sm font-medium rounded-xl border border-red-200">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Rupture de stock
        </span>
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Text indicator */}
      <div className="flex items-center gap-2">
        {stock <= 5 && (
          <svg
            className={cn('w-4 h-4', colors.icon)}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span className={cn('text-sm font-medium', colors.text)}>
          {stock <= 5 ? (
            <>Plus que <strong>{stock}</strong> en stock !</>
          ) : (
            <>{stock} disponibles</>
          )}
        </span>
      </div>

      {/* Progress bar */}
      {showBar && (
        <div className="stock-bar">
          <div
            className={cn('stock-bar-fill', colors.fill)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}

      {/* Urgency message */}
      {stock <= 3 && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
          <svg className="w-4 h-4 text-red-500 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-xs text-red-600 font-medium">
            Depechez-vous, il n&apos;en reste presque plus !
          </p>
        </div>
      )}
    </div>
  )
}

// Timer de promotion / urgence
interface UrgencyTimerProps {
  endTime: Date
  label?: string
  className?: string
}

export function UrgencyTimer({ endTime, label = 'Offre expire dans', className }: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
  } | null>(null)

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date()
      const diff = endTime.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft(null)
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    calculateTime()
    const interval = setInterval(calculateTime, 1000)

    return () => clearInterval(interval)
  }, [endTime])

  if (!timeLeft) return null

  const pad = (n: number) => n.toString().padStart(2, '0')

  return (
    <div className={cn('urgency-timer', className)}>
      <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1">
        <span className="bg-white rounded-lg px-2 py-1 shadow-sm border border-red-100 text-sm font-bold">{pad(timeLeft.hours)}</span>
        <span className="text-red-400 font-bold">:</span>
        <span className="bg-white rounded-lg px-2 py-1 shadow-sm border border-red-100 text-sm font-bold">{pad(timeLeft.minutes)}</span>
        <span className="text-red-400 font-bold">:</span>
        <span className="bg-white rounded-lg px-2 py-1 shadow-sm border border-red-100 text-sm font-bold">{pad(timeLeft.seconds)}</span>
      </div>
    </div>
  )
}
