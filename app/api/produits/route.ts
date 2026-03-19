import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/produits - Liste des produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const ids = searchParams.get('ids')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {
      isActive: true,
    }

    // Filtre par liste d'IDs (utilise pour les favoris)
    if (ids) {
      const idList = ids.split(',').filter(Boolean)
      if (idList.length > 0) {
        where.id = { in: idList }
      }
    }

    if (category) {
      where.category = category
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('GET /api/produits error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des produits' },
      { status: 500 }
    )
  }
}

// POST /api/produits - Créer un produit (admin)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()

    const {
      name,
      slug,
      description,
      price,
      oldPrice,
      images,
      stock,
      category,
      isFeatured,
    } = body

    // Validation basique
    if (!name || !slug || !description || !price || !category) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      )
    }

    // Vérifier si le slug existe déjà
    const existing = await prisma.product.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un produit avec ce slug existe déjà' },
        { status: 400 }
      )
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseInt(price),
        oldPrice: oldPrice ? parseInt(oldPrice) : null,
        images: images || [],
        stock: stock || 0,
        category,
        isFeatured: isFeatured || false,
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('POST /api/produits error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}
