import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * API de recherche produits.
 * Recherche par nom, description et categorie.
 * Requiert au moins 2 caracteres pour eviter les requetes trop larges.
 * Retourne max 8 resultats pour la performance mobile.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const slugs = searchParams.get('slugs')

  // Recherche par slugs (pour les produits recemment vus)
  if (slugs) {
    const slugList = slugs.split(',').filter(Boolean).slice(0, 10)
    if (slugList.length === 0) {
      return NextResponse.json({ products: [] })
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        slug: { in: slugList },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        oldPrice: true,
        images: true,
        category: true,
      },
    })

    // Garder l'ordre des slugs (le plus recent en premier)
    const ordered = slugList
      .map((s) => products.find((p) => p.slug === s))
      .filter(Boolean)

    return NextResponse.json({ products: ordered })
  }

  // Recherche textuelle : minimum 2 caracteres
  if (!q || q.length < 2) {
    return NextResponse.json([])
  }

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: true,
    },
    take: 8,
  })

  return NextResponse.json(products)
}
