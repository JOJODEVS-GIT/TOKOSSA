import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/categories — Liste toutes les categories
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/admin/categories error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/categories — Creer une categorie
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, image, description, isActive, order } = body

    if (!name?.trim() || !slug?.trim()) {
      return NextResponse.json({ error: 'Nom et slug requis' }, { status: 400 })
    }

    // Verifier l'unicite du slug
    const existing = await prisma.category.findUnique({ where: { slug: slug.trim() } })
    if (existing) {
      return NextResponse.json({ error: 'Ce slug existe deja' }, { status: 409 })
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        image: image || null,
        description: description || null,
        isActive: isActive ?? true,
        order: order ?? 0,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/categories error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
