'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useCallback } from 'react'

/**
 * Composant client pour filtrer les produits par fourchette de prix.
 * Utilise deux inputs number (min / max) en FCFA.
 * Met a jour les searchParams de l'URL pour que le Server Component
 * puisse lire les valeurs et filtrer via Prisma.
 */
export default function PriceFilter({
  currentMin,
  currentMax,
}: {
  currentMin: number | null
  currentMax: number | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [minPrice, setMinPrice] = useState(currentMin?.toString() ?? '')
  const [maxPrice, setMaxPrice] = useState(currentMax?.toString() ?? '')

  /** Applique les filtres de prix dans l'URL */
  const applyPriceFilter = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    // Gestion du prix minimum
    const parsedMin = parseInt(minPrice, 10)
    if (!isNaN(parsedMin) && parsedMin > 0) {
      params.set('minPrice', parsedMin.toString())
    } else {
      params.delete('minPrice')
    }

    // Gestion du prix maximum
    const parsedMax = parseInt(maxPrice, 10)
    if (!isNaN(parsedMax) && parsedMax > 0) {
      params.set('maxPrice', parsedMax.toString())
    } else {
      params.delete('maxPrice')
    }

    router.push(`/produits?${params.toString()}`)
  }, [minPrice, maxPrice, searchParams, router])

  /** Efface les filtres de prix */
  const clearPriceFilter = useCallback(() => {
    setMinPrice('')
    setMaxPrice('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('minPrice')
    params.delete('maxPrice')
    router.push(`/produits?${params.toString()}`)
  }, [searchParams, router])

  const hasFilter = currentMin !== null || currentMax !== null

  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        placeholder="Min"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') applyPriceFilter()
        }}
        className="w-20 px-2 py-1.5 text-sm rounded-full border border-warm-200 bg-white text-warm-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-warm-400"
        min={0}
      />
      <span className="text-warm-400 text-xs">-</span>
      <input
        type="number"
        inputMode="numeric"
        placeholder="Max"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') applyPriceFilter()
        }}
        className="w-20 px-2 py-1.5 text-sm rounded-full border border-warm-200 bg-white text-warm-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder:text-warm-400"
        min={0}
      />
      <button
        type="button"
        onClick={applyPriceFilter}
        className="px-3 py-1.5 text-sm font-medium rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
      >
        OK
      </button>
      {hasFilter && (
        <button
          type="button"
          onClick={clearPriceFilter}
          className="p-1.5 rounded-full text-warm-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          aria-label="Effacer le filtre de prix"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
