import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/produits/[id] — Recuperer un produit par ID (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const product = await prisma.product.findUnique({
      where: { id },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouve' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('GET /api/produits/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation du produit' },
      { status: 500 }
    )
  }
}

// PUT /api/produits/[id] — Mettre a jour un produit (admin)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verification admin
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    // Verifier que le produit existe
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Produit non trouve' },
        { status: 404 }
      )
    }

    // Si le slug change, verifier l'unicite
    if (body.slug && body.slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({
        where: { slug: body.slug },
      })
      if (slugExists) {
        return NextResponse.json(
          { error: 'Un produit avec ce slug existe deja' },
          { status: 400 }
        )
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        price: body.price !== undefined ? parseInt(body.price) : undefined,
        oldPrice: body.oldPrice !== undefined
          ? (body.oldPrice ? parseInt(body.oldPrice) : null)
          : undefined,
        images: body.images ?? undefined,
        stock: body.stock !== undefined ? parseInt(body.stock) : undefined,
        category: body.category,
        isActive: body.isActive ?? undefined,
        isFeatured: body.isFeatured ?? undefined,
      },
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT /api/produits/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise a jour du produit' },
      { status: 500 }
    )
  }
}

// DELETE /api/produits/[id] — Desactiver un produit (soft delete, admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verification admin
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Verifier que le produit existe
    const existing = await prisma.product.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Produit non trouve' },
        { status: 404 }
      )
    }

    // Soft delete : desactiver le produit au lieu de le supprimer
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, message: 'Produit desactive' })
  } catch (error) {
    console.error('DELETE /api/produits/[id] error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}
