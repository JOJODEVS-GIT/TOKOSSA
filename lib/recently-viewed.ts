'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'tokossa_recently_viewed'
const MAX_ITEMS = 10

/**
 * Hook pour gerer les produits recemment consultes.
 * Stocke les slugs dans localStorage (hydration-safe).
 */
export function useRecentlyViewed() {
  const [viewedSlugs, setViewedSlugs] = useState<string[]>([])

  // Charger depuis localStorage au mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setViewedSlugs(JSON.parse(stored))
      }
    } catch {
      // localStorage indisponible
    }
  }, [])

  /** Ajouter un slug aux produits vus */
  const addViewed = useCallback((slug: string) => {
    setViewedSlugs((prev) => {
      // Retirer le slug s'il existe deja, puis l'ajouter en tete
      const filtered = prev.filter((s) => s !== slug)
      const updated = [slug, ...filtered].slice(0, MAX_ITEMS)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // localStorage indisponible
      }

      return updated
    })
  }, [])

  return { viewedSlugs, addViewed }
}
