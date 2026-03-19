'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Accueil',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/produits',
    label: 'Produits',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    href: '#cart',
    label: 'Panier',
    isCart: true,
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
  },
  {
    href: '/commandes',
    label: 'Commandes',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { openCart, totalItems } = useCartStore()
  const itemCount = totalItems()

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-warm-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] md:hidden safe-bottom z-40">
      <div className="flex items-center justify-around h-[68px]">
        {navItems.map((item) => {
          const isActive = item.href === pathname
          const isCart = item.isCart

          if (isCart) {
            return (
              <button
                key={item.href}
                onClick={openCart}
                className="relative flex flex-col items-center justify-center flex-1 h-full text-warm-500"
              >
                <div className={cn(
                  'relative p-1.5 rounded-xl transition-colors',
                  itemCount > 0 && 'bg-primary-50'
                )}>
                  {item.icon(false)}
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full px-1">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="mt-0.5 text-[11px]">{item.label}</span>
              </button>
            )
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive ? 'text-primary-500' : 'text-warm-500'
              )}
            >
              <div className="relative">
                {isActive && (
                  <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-500" />
                )}
                {item.icon(isActive)}
              </div>
              <span className={cn(
                'mt-0.5 text-[11px]',
                isActive && 'font-semibold text-primary-600'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
