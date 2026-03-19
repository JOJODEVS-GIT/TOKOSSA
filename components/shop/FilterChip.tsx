'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

/**
 * Chip toggle pour les filtres booleens (promo, en stock, etc.).
 * Quand actif, ajoute le parametre a l'URL.
 * Quand desactive, le supprime.
 */
interface FilterChipProps {
  /** Nom affiche sur le chip */
  label: string
  /** Cle du parametre URL (ex: "promo", "inStock") */
  paramKey: string
  /** Si le filtre est actuellement actif */
  isActive: boolean
}

export default function FilterChip({ label, paramKey, isActive }: FilterChipProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleToggle = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (isActive) {
      params.delete(paramKey)
    } else {
      params.set(paramKey, 'true')
    }

    router.push(`/produits?${params.toString()}`)
  }, [isActive, paramKey, searchParams, router])

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
        isActive
          ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
          : 'bg-white text-warm-700 border border-warm-200 shadow-sm hover:border-primary-300'
      }`}
    >
      {isActive && (
        <svg
          className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
      {label}
    </button>
  )
}
