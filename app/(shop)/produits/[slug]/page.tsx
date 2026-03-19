import { Suspense } from 'react'
import prisma from '@/lib/db'
import { notFound } from 'next/navigation'
import { safeJsonLd } from '@/lib/utils'
import ProductDetail from '@/components/shop/ProductDetail'
import AdPromoBanner from '@/components/shop/AdPromoBanner'
import type { Metadata } from 'next'

/**
 * Page detail produit — Server Component.
 * ISR : page re-générée toutes les heures.
 */

// ISR : page re-generee toutes les 5 minutes (prix, stock, avis)
export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

// PERFORMANCE : Pre-générer les pages des produits actifs au build
// Si la DB est indisponible au build (ex: CI, Vercel), retourne [] → ISR à la demande
export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
      take: 500,
    })
    return products.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

// Metadata dynamique pour le SEO et Open Graph
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, images: true },
  })

  if (!product) {
    return { title: 'Produit non trouve | TOKOSSA' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tokossa.bj'

  // Fallback si la description produit est null ou vide
  const metaDescription =
    product.description?.slice(0, 160) ||
    `Achetez ${product.name} au meilleur prix sur TOKOSSA. Livraison rapide à Cotonou.`

  return {
    title: `${product.name} | TOKOSSA`,
    description: metaDescription,
    alternates: { canonical: `/produits/${slug}` },
    openGraph: {
      type: 'website',
      title: `${product.name} | TOKOSSA`,
      description: metaDescription,
      url: `${baseUrl}/produits/${slug}`,
      images: product.images[0]
        ? [{ url: product.images[0], width: 800, height: 800, alt: product.name }]
        : [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'TOKOSSA' }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | TOKOSSA`,
      description: metaDescription,
      images: product.images[0] ? [product.images[0]] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params

  // Recuperer le produit par son slug avec ses variantes actives
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      variants: {
        where: { isActive: true },
        orderBy: { createdAt: 'asc' },
        select: { id: true, name: true, stock: true, price: true, options: true, image: true },
      },
    },
  })

  if (!product) notFound()

  // PERFORMANCE : Paralleliser les requetes independantes
  const productSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    oldPrice: true,
    images: true,
    stock: true,
    category: true,
  }

  // Pré-lancer les 4 requêtes en parallèle :
  // otherProducts est pré-lancé sans filtre d'IDs exclus — on filtrera après réception.
  // Cela évite une requête séquentielle si la catégorie a moins de 4 produits.
  // reviews : les 5 derniers avis approuvés pour le JSON-LD Review[]
  const [sameCategoryProducts, reviewStats, otherProductsRaw, reviews] = await Promise.all([
    prisma.product.findMany({
      where: {
        category: product.category,
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.review.aggregate({
      where: { productId: product.id },
      _avg: { rating: true },
      _count: { rating: true },
    }),
    prisma.product.findMany({
      where: {
        category: { not: product.category },
        id: { not: product.id },
        isActive: true,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      select: productSelect,
    }),
    prisma.review.findMany({
      where: { productId: product.id },
      select: { rating: true, comment: true, name: true, createdAt: true },
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
  ])

  // Si pas assez dans la meme categorie, completer avec les produits pre-charges
  let relatedProducts = sameCategoryProducts
  if (sameCategoryProducts.length < 4) {
    const remainingCount = 4 - sameCategoryProducts.length
    const sameCategoryIds = new Set(sameCategoryProducts.map((p) => p.id))
    const otherProducts = otherProductsRaw
      .filter((p) => !sameCategoryIds.has(p.id))
      .slice(0, remainingCount)
    relatedProducts = [...sameCategoryProducts, ...otherProducts]
  }

  // Serialiser le produit pour le Client Component
  // (Prisma renvoie des objets avec des types Date qu'il faut convertir)
  const serializedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    oldPrice: product.oldPrice,
    images: product.images,
    stock: product.stock,
    category: product.category,
    isFeatured: product.isFeatured,
    variants: product.variants.map((v) => ({
      id: v.id,
      name: v.name,
      stock: v.stock,
      price: v.price,
      options: v.options as Record<string, string>,
      image: v.image,
    })),
  }

  // Construction du JSON-LD Product (donnees structurees SEO)
  const productUrl = `https://tokossa.bj/produits/${product.slug}`

  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'TOKOSSA',
    },
    // Si le produit a des variantes actives, on expose une offre par variante
    // pour que Google puisse indexer les prix et disponibilités de chaque option
    // Note : la requête filtre déjà isActive: true en DB — toutes les variantes ici sont actives
    offers: product.variants && product.variants.length > 0
      ? product.variants
          .map((v) => ({
            '@type': 'Offer',
            name: v.name,
            price: v.price ?? product.price,
            priceCurrency: 'XOF',
            availability:
              (v.stock ?? product.stock) > 0
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
            url: productUrl,
            seller: { '@type': 'Organization', name: 'TOKOSSA' },
          }))
      : {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'XOF',
          availability: product.stock > 0
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
          url: productUrl,
          seller: { '@type': 'Organization', name: 'TOKOSSA' },
        },
  }

  // Ajouter aggregateRating si des avis existent
  if (reviewStats._count.rating > 0 && reviewStats._avg.rating !== null) {
    jsonLd.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: Math.round(reviewStats._avg.rating * 10) / 10,
      reviewCount: reviewStats._count.rating,
      bestRating: 5,
      worstRating: 1,
    }
  }

  // Ajouter les Review[] individuels si des avis approuvés existent
  // Google les affiche dans les rich snippets de recherche
  if (reviews.length > 0) {
    jsonLd.review = reviews.map((r) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: {
        '@type': 'Person',
        name: r.name,
      },
      ...(r.comment ? { reviewBody: r.comment } : {}),
      datePublished: r.createdAt.toISOString().split('T')[0],
    }))
  }

  return (
    <>
      {/* JSON-LD — Donnees structurees Product pour le SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />

      {/* Banniere promo Meta Ads (UTM tracking) */}
      <Suspense fallback={null}>
        <AdPromoBanner />
      </Suspense>

      <ProductDetail
        product={serializedProduct}
        relatedProducts={relatedProducts}
      />
    </>
  )
}
