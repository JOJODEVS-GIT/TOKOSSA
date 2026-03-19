import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { Prisma } from '@prisma/client'

import prisma from '@/lib/db'
import { safeJsonLd } from '@/lib/utils'
import ProductGrid from '@/components/shop/ProductGrid'
import { ProductGridSkeleton } from '@/components/shop/ProductCardSkeleton'
import CategoryPagination from '@/components/shop/CategoryPagination'
import SortSelect from '@/components/shop/SortSelect'
import PriceFilter from '@/components/shop/PriceFilter'
import FilterChip from '@/components/shop/FilterChip'

// ISR : page re-generee toutes les 5 minutes
export const revalidate = 300

// Nombre de produits affiches par page
const ITEMS_PER_PAGE = 24

// ============================================================
// Types
// ============================================================

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    sort?: string
    minPrice?: string
    maxPrice?: string
    promo?: string
    inStock?: string
    page?: string
  }>
}

// ============================================================
// generateMetadata — SEO dynamique par categorie
// ============================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true, image: true },
  })

  if (!category) {
    return {
      title: 'Categorie introuvable | TOKOSSA',
    }
  }

  const title = `${category.name} | TOKOSSA`
  const description =
    category.description ||
    `Decouvrez nos produits ${category.name} sur TOKOSSA. Livraison rapide a Cotonou et environs.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tokossa.bj/categories/${slug}`,
      siteName: 'TOKOSSA',
      images: category.image ? [{ url: category.image }] : [],
    },
    alternates: {
      canonical: `https://tokossa.bj/categories/${slug}`,
    },
  }
}

// ============================================================
// generateStaticParams — Pre-build des pages de categories
// ============================================================

export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  })

  return categories.map((cat) => ({ slug: cat.slug }))
}

// ============================================================
// Page principale — Server Component
// ============================================================

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const sp = await searchParams

  // Lecture et validation du numero de page (minimum 1)
  const rawPage = parseInt(sp.page || '1', 10)
  const currentPage = isNaN(rawPage) || rawPage < 1 ? 1 : rawPage

  // Lecture des filtres
  const sortBy = sp.sort || 'featured'
  const minPrice = sp.minPrice ? parseInt(sp.minPrice, 10) : null
  const maxPrice = sp.maxPrice ? parseInt(sp.maxPrice, 10) : null
  const promoFilter = sp.promo === 'true'
  const inStockFilter = sp.inStock === 'true'

  // Recuperation de la categorie par slug
  const category = await prisma.category.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      image: true,
      isActive: true,
    },
  })

  // Categorie inexistante ou desactivee → 404
  if (!category || !category.isActive) {
    notFound()
  }

  // Construction du filtre Prisma
  // On cherche par categoryId (relation) OU par le champ string `category` (compatibilite)
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    OR: [
      { categoryId: category.id },
      { category: { equals: category.slug, mode: 'insensitive' } },
      { category: { equals: category.name, mode: 'insensitive' } },
    ],
  }

  // Filtre par fourchette de prix (en FCFA)
  if (minPrice !== null || maxPrice !== null) {
    where.price = {}
    if (minPrice !== null && !isNaN(minPrice)) {
      where.price.gte = minPrice
    }
    if (maxPrice !== null && !isNaN(maxPrice)) {
      where.price.lte = maxPrice
    }
  }

  // Filtre "En promotion" : produits avec oldPrice non null
  if (promoFilter) {
    where.oldPrice = { not: null }
  }

  // Filtre "En stock" : produits avec stock > 0
  if (inStockFilter) {
    where.stock = { gt: 0 }
  }

  // Construction du tri
  const orderBy:
    | Prisma.ProductOrderByWithRelationInput
    | Prisma.ProductOrderByWithRelationInput[] =
    sortBy === 'price-asc'
      ? { price: 'asc' }
      : sortBy === 'price-desc'
        ? { price: 'desc' }
        : [{ isFeatured: 'desc' }, { createdAt: 'desc' }]

  // Requetes paralleles : produits de la page + total pour la pagination
  const [products, totalItems] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: ITEMS_PER_PAGE,
      skip: (currentPage - 1) * ITEMS_PER_PAGE,
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
    }),
    prisma.product.count({ where }),
  ])

  // Calcul du nombre total de pages
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
  const safePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1

  // Nombre de filtres actifs (hors tri)
  const activeFiltersCount = [
    minPrice !== null || maxPrice !== null,
    promoFilter,
    inStockFilter,
  ].filter(Boolean).length

  // JSON-LD CollectionPage + BreadcrumbList pour le SEO
  const collectionJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description:
      category.description ||
      `Produits de la categorie ${category.name} sur TOKOSSA`,
    url: `https://tokossa.bj/categories/${slug}`,
    ...(category.image && { image: category.image }),
    breadcrumb: {
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
          name: 'Categories',
          item: 'https://tokossa.bj/categories',
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.name,
          item: `https://tokossa.bj/categories/${slug}`,
        },
      ],
    },
  }

  return (
    <>
      {/* JSON-LD — CollectionPage + fil d'ariane pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />

      <div className="min-h-screen bg-warm-50">
        {/* Header de la categorie */}
        <div className="relative overflow-hidden">
          {category.image ? (
            /* Header avec image Cloudinary */
            <div className="relative h-36 md:h-48">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              {/* Overlay degrade pour lisibilite du texte */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 py-4">
                {/* Lien retour vers /produits */}
                <Link
                  href="/produits"
                  className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm mb-2 transition-colors"
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
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {category.name}
                </h1>
                <p className="text-white/70 mt-1 text-sm">
                  {totalItems} produit{totalItems > 1 ? 's' : ''} disponible
                  {totalItems > 1 ? 's' : ''}
                  {totalPages > 1 && (
                    <span className="ml-2 text-white/50">
                      — page {safePage}/{totalPages}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ) : (
            /* Header avec degrade (fallback sans image) */
            <div className="bg-gradient-to-r from-secondary-500 to-secondary-500/90 text-white">
              <div className="container mx-auto px-4 py-5">
                {/* Lien retour vers /produits */}
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
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-white/70 mt-1 text-sm line-clamp-2">
                    {category.description}
                  </p>
                )}
                <p className="text-white/60 mt-1 text-sm">
                  {totalItems} produit{totalItems > 1 ? 's' : ''} disponible
                  {totalItems > 1 ? 's' : ''}
                  {totalPages > 1 && (
                    <span className="ml-2 text-white/40">
                      — page {safePage}/{totalPages}
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Description de la categorie (si image header, on l'affiche ici) */}
          {category.image && category.description && (
            <p className="text-warm-600 text-sm mb-4 leading-relaxed">
              {category.description}
            </p>
          )}

          {/* Filtres */}
          <div className="space-y-3 mb-6">
            {/* Ligne : Tri + filtres avances */}
            <div className="flex flex-wrap gap-4">
              {/* Tri — composant client isole */}
              <div className="ml-auto">
                <Suspense
                  fallback={
                    <div className="px-4 py-2 bg-white border border-warm-200 rounded-xl text-sm text-warm-400">
                      Chargement...
                    </div>
                  }
                >
                  <SortSelect currentSort={sortBy} />
                </Suspense>
              </div>
            </div>

            {/* Ligne : Filtres (promo, stock, prix) */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 items-center">
              {/* Indicateur de filtres actifs */}
              {activeFiltersCount > 0 && (
                <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold whitespace-nowrap">
                  {activeFiltersCount} filtre{activeFiltersCount > 1 ? 's' : ''}
                </span>
              )}

              {/* Filtre "En promo" */}
              <Suspense fallback={null}>
                <FilterChip label="En promo" paramKey="promo" isActive={promoFilter} />
              </Suspense>

              {/* Filtre "En stock" */}
              <Suspense fallback={null}>
                <FilterChip label="En stock" paramKey="inStock" isActive={inStockFilter} />
              </Suspense>

              {/* Separateur visuel */}
              <div className="w-px h-6 bg-warm-200 flex-shrink-0" />

              {/* Filtre par fourchette de prix */}
              <Suspense fallback={null}>
                <PriceFilter currentMin={minPrice} currentMax={maxPrice} />
              </Suspense>
            </div>
          </div>

          {/* Grille produits — Suspense avec squelettes */}
          <Suspense fallback={<ProductGridSkeleton />}>
            <ProductGrid
              products={products}
              emptyMessage="Aucun produit dans cette categorie pour le moment"
            />
          </Suspense>

          {/* Pagination — Suspense requis car CategoryPagination utilise useSearchParams */}
          <Suspense fallback={null}>
            <CategoryPagination
              currentPage={safePage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              categorySlug={slug}
            />
          </Suspense>
        </div>
      </div>
    </>
  )
}
