'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface CategoryPaginationProps {
  /** Page courante (1-indexee) */
  currentPage: number
  /** Nombre total de pages */
  totalPages: number
  /** Nombre total de produits */
  totalItems: number
  /** Nombre de produits par page */
  itemsPerPage: number
  /** Slug de la categorie courante (ex: "electronique") */
  categorySlug: string
}

/**
 * CategoryPagination — Composant client de navigation entre pages d'une categorie.
 * Variante de Pagination adaptee aux URLs /categories/[slug].
 * Preserve tous les query params existants (sort, minPrice, maxPrice, promo, inStock)
 * lors de la navigation entre les pages.
 */
export default function CategoryPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  categorySlug,
}: CategoryPaginationProps) {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  /**
   * Construit l'URL d'une page en preservant tous les filtres actifs.
   * La base de l'URL change pour pointer vers /categories/[slug].
   */
  function buildPageHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString())
    if (page === 1) {
      params.delete('page')
    } else {
      params.set('page', String(page))
    }
    const qs = params.toString()
    return `/categories/${categorySlug}${qs ? `?${qs}` : ''}`
  }

  /**
   * Calcule la liste des numeros de pages a afficher.
   * Sur mobile : page courante +/- 1 + premiere/derniere.
   * Sur desktop : jusqu'a 7 pages visibles avec ellipses.
   */
  function getPageNumbers(): (number | 'ellipsis')[] {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | 'ellipsis')[] = [1]

    if (currentPage > 3) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (currentPage < totalPages - 2) {
      pages.push('ellipsis')
    }

    pages.push(totalPages)

    return pages
  }

  const pageNumbers = getPageNumbers()

  // Debut et fin des produits affiches sur la page courante
  const firstItem = (currentPage - 1) * itemsPerPage + 1
  const lastItem = Math.min(currentPage * itemsPerPage, totalItems)

  return (
    <nav
      aria-label="Navigation des pages de la categorie"
      className="flex flex-col items-center gap-4 mt-10 mb-4"
    >
      {/* Compteur de resultats */}
      <p className="text-sm text-warm-500">
        {firstItem}–{lastItem} sur{' '}
        <span className="font-semibold text-secondary-500">{totalItems}</span> produits
      </p>

      {/* Pills de navigation */}
      <div className="flex items-center gap-1.5">
        {/* Bouton Precedent */}
        {currentPage > 1 ? (
          <Link
            href={buildPageHref(currentPage - 1)}
            aria-label="Page precedente"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-warm-200 bg-white text-warm-600 shadow-sm hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </span>
        )}

        {/* Numeros de pages */}
        {pageNumbers.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex items-center justify-center w-9 h-9 text-warm-400 text-sm"
            >
              ...
            </span>
          ) : (
            <Link
              key={page}
              href={buildPageHref(page)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
              className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                page === currentPage
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'border border-warm-200 bg-white text-warm-600 hover:border-primary-300 hover:text-primary-500 shadow-sm'
              }`}
            >
              {page}
            </Link>
          )
        )}

        {/* Bouton Suivant */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageHref(currentPage + 1)}
            aria-label="Page suivante"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-warm-200 bg-white text-warm-600 shadow-sm hover:border-primary-300 hover:text-primary-500 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="flex items-center justify-center w-9 h-9 rounded-full border border-warm-100 bg-warm-50 text-warm-300 cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        )}
      </div>
    </nav>
  )
}
