'use client'

import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'promo' | 'stock' | 'success' | 'warning' | 'danger' | 'flash'
  className?: string
  pulse?: boolean
}

export default function Badge({ children, variant = 'default', className, pulse = false }: BadgeProps) {
  const variants = {
    default: 'bg-warm-100 text-warm-700',
    promo: 'bg-red-500 text-white shadow-sm shadow-red-500/20',
    stock: 'bg-amber-50 text-amber-700 border border-amber-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
    warning: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    flash: 'bg-gradient-to-r from-secondary-500 to-primary-500 text-white shadow-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold',
        variants[variant],
        pulse && 'animate-pulse',
        className
      )}
    >
      {children}
    </span>
  )
}

// Badge de reduction
export function DiscountBadge({ percent }: { percent: number }) {
  return (
    <Badge variant="promo" className="relative overflow-hidden">
      -{percent}%
      <span className="absolute inset-0 animate-shimmer-overlay" />
    </Badge>
  )
}

// Badge stock faible
export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) {
    return <Badge variant="danger">Rupture de stock</Badge>
  }

  if (stock <= 5) {
    return (
      <Badge variant="stock">
        <svg className="w-3.5 h-3.5 mr-1 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
        Plus que {stock} en stock
      </Badge>
    )
  }

  return null
}

// Badge flash sale
export function FlashBadge() {
  return (
    <Badge variant="flash">
      <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
      </svg>
      FLASH
    </Badge>
  )
}

// Badge livraison gratuite
export function FreeDeliveryBadge() {
  return (
    <Badge variant="success">
      <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
      Livraison gratuite
    </Badge>
  )
}
