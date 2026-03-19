import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'

import prisma from '@/lib/db'
import { safeJsonLd } from '@/lib/utils'

// ISR : page re-generee toutes les 5 minutes
export const revalidate = 300

// ============================================================
// Metadata statique — SEO
// ============================================================

export const metadata: Metadata = {
  title: 'Nos Categories | TOKOSSA',
  description:
    'Explorez toutes nos categories de produits sur TOKOSSA. Electronique, Mode, Beaute, Sport, Maison — livraison rapide a Cotonou et environs.',
  openGraph: {
    title: 'Nos Categories | TOKOSSA',
    description:
      'Explorez toutes nos categories de produits sur TOKOSSA. Livraison rapide a Cotonou.',
    url: 'https://tokossa.bj/categories',
    siteName: 'TOKOSSA',
  },
  alternates: {
    canonical: 'https://tokossa.bj/categories',
  },
}

// ============================================================
// Couleurs de fallback pour les categories sans image
// Assignees de facon deterministe par index pour cohérence visuelle
// ============================================================
const FALLBACK_COLORS = [
  'from-primary-400 to-primary-600',
  'from-secondary-400 to-secondary-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-indigo-400 to-indigo-600',
]

// ============================================================
// Page principale — Server Component
// ============================================================

export default async function CategoriesPage() {
  // Recuperation de toutes les categories actives, avec le nombre de produits
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      description: true,
      _count: {
        select: {
          // Compte uniquement les produits actifs de la categorie
          products: true,
        },
      },
    },
  })

  // JSON-LD — BreadcrumbList + ItemList pour le SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Categories TOKOSSA',
    url: 'https://tokossa.bj/categories',
    numberOfItems: categories.length,
    itemListElement: categories.map((cat, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: cat.name,
      url: `https://tokossa.bj/categories/${cat.slug}`,
    })),
  }

  return (
    <>
      {/* JSON-LD — Liste de categories pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      <div className="min-h-screen bg-warm-50">
        {/* Header avec degrade */}
        <div className="bg-gradient-to-r from-secondary-500 to-secondary-500/90 text-white">
          <div className="container mx-auto px-4 py-6">
            {/* Lien retour vers la boutique */}
            <Link
              href="/produits"
              className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-3 transition-colors"
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
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              Nos Categories
            </h1>
            <p className="text-white/70 mt-1 text-sm">
              {categories.length} categorie{categories.length > 1 ? 's' : ''} disponible
              {categories.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          {categories.length === 0 ? (
            /* Etat vide — aucune categorie active */
            <div className="text-center py-16">
              <svg
                className="w-16 h-16 mx-auto text-warm-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <p className="text-warm-500">Aucune categorie disponible pour le moment.</p>
              <Link
                href="/produits"
                className="inline-block mt-4 px-6 py-2 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                Voir tous les produits
              </Link>
            </div>
          ) : (
            /* Grille de categories — 2 colonnes mobile, 3 tablette/desktop */
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {categories.map((category, index) => {
                // Couleur de fallback deterministe selon la position
                const fallbackGradient =
                  FALLBACK_COLORS[index % FALLBACK_COLORS.length]

                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group block"
                  >
                    <article className="rounded-2xl overflow-hidden bg-white shadow-sm border border-warm-100 hover:shadow-md hover:border-warm-200 transition-all duration-200">
                      {/* Visuel de la categorie */}
                      <div className="relative aspect-video overflow-hidden">
                        {category.image ? (
                          /* Image Cloudinary */
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, 33vw"
                          />
                        ) : (
                          /* Placeholder colore avec la premiere lettre */
                          <div
                            className={`w-full h-full bg-gradient-to-br ${fallbackGradient} flex items-center justify-center group-hover:scale-105 transition-transform duration-300`}
                          >
                            <span className="text-4xl font-bold text-white/80 select-none">
                              {category.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Overlay leger au survol */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                      </div>

                      {/* Informations textuelles */}
                      <div className="p-3 md:p-4">
                        <h2 className="font-semibold text-warm-900 text-sm md:text-base leading-tight group-hover:text-primary-600 transition-colors">
                          {category.name}
                        </h2>

                        {/* Description courte si disponible */}
                        {category.description && (
                          <p className="text-warm-500 text-xs mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        )}

                        {/* Compteur de produits */}
                        <p className="text-warm-400 text-xs mt-1">
                          {category._count.products === 0
                            ? 'Bientot disponible'
                            : `${category._count.products} produit${category._count.products > 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Lien vers tous les produits en bas de page */}
          <div className="mt-10 text-center">
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-warm-200 text-warm-700 rounded-xl font-medium hover:border-primary-300 hover:text-primary-600 shadow-sm transition-all"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
              Voir tous les produits
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
