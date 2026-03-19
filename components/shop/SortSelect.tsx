'use client'

import { useRouter, useSearchParams } from 'next/navigation'

/**
 * Composant client pour le tri des produits.
 * Isole l'interactivite (onChange) dans un Client Component
 * pour que la page produits reste un Server Component.
 */
export default function SortSelect({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/produits?${params.toString()}`)
  }

  return (
    <select
      value={currentSort}
      onChange={(e) => handleSort(e.target.value)}
      className="px-4 py-2 bg-white border border-warm-200 rounded-xl text-sm shadow-sm text-warm-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
    >
      <option value="featured">Populaires</option>
      <option value="price-asc">Prix croissant</option>
      <option value="price-desc">Prix decroissant</option>
    </select>
  )
}
