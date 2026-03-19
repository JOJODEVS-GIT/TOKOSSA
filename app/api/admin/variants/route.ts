import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/variants?productId=xxx — Liste les variantes d'un produit
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const productId = request.nextUrl.searchParams.get('productId')
    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 })
    }

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(variants)
  } catch (error) {
    console.error('GET /api/admin/variants error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// POST /api/admin/variants — Creer une variante
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, name, sku, stock, price, options, image } = body

    if (!productId || !name?.trim()) {
      return NextResponse.json({ error: 'productId et name requis' }, { status: 400 })
    }

    // Verifier que le produit existe
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json({ error: 'Produit non trouve' }, { status: 404 })
    }

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: name.trim(),
        sku: sku?.trim() || null,
        stock: parseInt(stock) || 0,
        price: price ? parseInt(price) : null,
        options: options || {},
        image: image || null,
      },
    })

    return NextResponse.json(variant, { status: 201 })
  } catch (error) {
    console.error('POST /api/admin/variants error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// PUT /api/admin/variants — Modifier une variante
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, sku, stock, price, options, image, isActive } = body

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    const variant = await prisma.productVariant.update({
      where: { id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(sku !== undefined && { sku: sku?.trim() || null }),
        ...(stock !== undefined && { stock: parseInt(stock) || 0 }),
        ...(price !== undefined && { price: price ? parseInt(price) : null }),
        ...(options !== undefined && { options }),
        ...(image !== undefined && { image }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return NextResponse.json(variant)
  } catch (error) {
    console.error('PUT /api/admin/variants error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE /api/admin/variants?id=xxx — Supprimer une variante
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const id = request.nextUrl.searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 })
    }

    await prisma.productVariant.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/variants error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
