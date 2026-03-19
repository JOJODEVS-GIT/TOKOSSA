import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/admin/categories/[id] — Modifier une categorie
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, slug, image, description, isActive, order } = body

    const existing = await prisma.category.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Categorie non trouvee' }, { status: 404 })
    }

    // Verifier unicite du slug si modifie
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.category.findUnique({ where: { slug } })
      if (slugExists) {
        return NextResponse.json({ error: 'Ce slug existe deja' }, { status: 409 })
      }
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(slug !== undefined && { slug: slug.trim().toLowerCase() }),
        ...(image !== undefined && { image }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('PUT /api/admin/categories/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/categories/[id] — Supprimer une categorie
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params

    // Verifier si des produits utilisent cette categorie
    const productsCount = await prisma.product.count({ where: { categoryId: id } })
    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Impossible de supprimer : ${productsCount} produit(s) utilisent cette categorie` },
        { status: 409 }
      )
    }

    await prisma.category.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/categories/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
