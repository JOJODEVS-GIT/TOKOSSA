import { Suspense } from 'react'
import Link from 'next/link'
import prisma from '@/lib/db'
import { safeJsonLd } from '@/lib/utils'
import ProductGrid from '@/components/shop/ProductGrid'
import type { Metadata } from 'next'

// Pas de cache statique : les resultats dependent de la query utilisateur
export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

/**
 * Recupere les produits correspondant a la query de recherche (max 24).
 * Si aucune query, retourne les produits mis en avant (isFeatured).
 */
async function fetchProduits(query: string) {
  if (!query.trim()) {
    // Pas de query : produits populaires (mis en avant)
    return prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { createdAt: 'desc' },
      take: 24,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        images: true,
        stock: true,
        category: true,
        isFeatured: true,
      },
    })
  }

  // Recherche insensible a la casse dans name, description et category
  return prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    take: 24,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      oldPrice: true,
      images: true,
      stock: true,
      category: true,
      isFeatured: true,
    },
  })
}

export default async function RecherchePage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = (params.q ?? '').trim()

  const produits = await fetchProduits(query)

  // JSON-LD BreadcrumbList pour le SEO
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: 'https://tokossa.bj',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Recherche',
        item: 'https://tokossa.bj/recherche',
      },
    ],
  }

  return (
    <>
      {/* JSON-LD — Fil d'ariane pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />

      <div className="min-h-screen bg-warm-50">
        {/* Header avec degrade indigo — coherent avec la page /produits */}
        <div className="bg-gradient-to-r from-secondary-500 to-secondary-500/90 text-white">
          <div className="container mx-auto px-4 py-6">
            {/* Lien retour vers le catalogue */}
            <Link
              href="/produits"
              className="inline-flex items-center gap-1.5 text-white/70 hover:text-white text-sm mb-3 transition-colors"
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
              Tous les produits
            </Link>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              {query ? `Resultats pour "${query}"` : 'Rechercher un produit'}
            </h1>
            <p className="text-white/70 mt-1">
              {query
                ? `${produits.length} produit${produits.length !== 1 ? 's' : ''} trouve${produits.length !== 1 ? 's' : ''}`
                : 'Produits populaires'}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Champ de recherche — toujours visible pour permettre une nouvelle recherche */}
          <form
            action="/recherche"
            method="GET"
            className="mb-6"
          >
            <div className="relative max-w-xl">
              {/* Icone loupe */}
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400 pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                />
              </svg>

              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Rechercher un produit, une categorie..."
                autoComplete="off"
                className="w-full pl-11 pr-24 py-3 rounded-2xl border border-warm-200 bg-white text-warm-900 placeholder-warm-400 focus:outline-none focus:ring-2 focus:ring-secondary-400 focus:border-transparent shadow-sm text-sm"
              />

              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                Chercher
              </button>
            </div>
          </form>

          {/* Titre de section contextuel */}
          {!query && (
            <p className="text-warm-600 text-sm font-medium mb-4">
              Produits populaires du moment
            </p>
          )}

          {/* Grille de resultats */}
          <Suspense
            fallback={
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-warm-200 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <ProductGrid
              products={produits}
              emptyMessage={
                query
                  ? `Aucun produit trouve pour "${query}". Essayez un autre mot-cle.`
                  : 'Aucun produit populaire disponible pour le moment.'
              }
            />
          </Suspense>

          {/* Suggestion si aucun resultat */}
          {query && produits.length === 0 && (
            <div className="mt-6 text-center">
              <Link
                href="/produits"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl transition-colors text-sm"
              >
                Voir tous les produits
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

/**
 * Metadata dynamique basee sur la query de recherche.
 * Ameliore le SEO et le partage sur les reseaux sociaux.
 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const query = (params.q ?? '').trim()

  const title = query
    ? `Recherche "${query}" | TOKOSSA`
    : 'Recherche | TOKOSSA'

  const description = query
    ? `Resultats de recherche pour "${query}" sur TOKOSSA. Livraison rapide a Cotonou.`
    : 'Recherchez parmi tous les produits TOKOSSA. Livraison rapide a Cotonou et environs.'

  return {
    title,
    description,
    robots: {
      // Ne pas indexer les pages de resultats de recherche (duplicate content)
      index: false,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: query
        ? `https://tokossa.bj/recherche?q=${encodeURIComponent(query)}`
        : 'https://tokossa.bj/recherche',
      siteName: 'TOKOSSA',
    },
  }
}
