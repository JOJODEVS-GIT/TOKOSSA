'use client'

import { useState, useEffect } from 'react'
import { useCartStore } from '@/lib/store'

/**
 * Bouton panier avec badge indiquant le nombre d'articles.
 * Utilise un etat `mounted` pour eviter le mismatch d'hydratation SSR/client.
 */
export default function CartButton() {
  const { openCart, totalItems } = useCartStore()

  // Eviter le mismatch SSR : afficher le compteur seulement apres montage
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const itemCount = mounted ? totalItems() : 0

  return (
    <button
      onClick={openCart}
      className="relative p-2.5 hover:bg-warm-100 rounded-xl transition-colors"
      aria-label="Panier"
      data-testid="cart-button"
    >
      {/* Icone panier */}
      <svg
        className="w-6 h-6 text-secondary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        />
      </svg>

      {/* Badge nombre d'articles */}
      {itemCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary-500 text-white text-[11px] font-bold rounded-full px-1"
          data-testid="cart-badge"
        >
          {itemCount}
        </span>
      )}
    </button>
  )
}
