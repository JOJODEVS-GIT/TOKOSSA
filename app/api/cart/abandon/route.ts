import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * POST /api/cart/abandon
 * Capture un panier abandonne quand le client remplit le checkout sans finaliser.
 * Body : { phone, email?, customerName?, items, subtotal, quarter? }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { phone, email, customerName, items, subtotal, quarter } = body

    if (!phone || !items || !subtotal) {
      return NextResponse.json(
        { error: 'phone, items et subtotal sont requis' },
        { status: 400 }
      )
    }

    // Verifier si un panier abandonné existe deja pour ce numero (non recovered)
    const existing = await prisma.abandonedCart.findFirst({
      where: {
        phone,
        status: { in: ['pending', 'reminded_1'] },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      // Mettre a jour le panier existant
      await prisma.abandonedCart.update({
        where: { id: existing.id },
        data: { items, subtotal, quarter, email, customerName, updatedAt: new Date() },
      })

      return NextResponse.json({ success: true, updated: true })
    }

    // Creer un nouveau panier abandonne
    await prisma.abandonedCart.create({
      data: {
        phone,
        email,
        customerName,
        items,
        subtotal,
        quarter,
        status: 'pending',
      },
    })

    return NextResponse.json({ success: true, created: true })
  } catch (error) {
    console.error('Erreur capture panier abandonne:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * DELETE /api/cart/abandon
 * Marquer un panier comme recovered (commande finalisee).
 * Body : { phone }
 */
export async function DELETE(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'phone requis' }, { status: 400 })
    }

    // Marquer tous les paniers pending de ce numero comme recovered
    await prisma.abandonedCart.updateMany({
      where: {
        phone,
        status: { in: ['pending', 'reminded_1', 'reminded_2'] },
      },
      data: {
        status: 'recovered',
        recoveredAt: new Date(),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur recover panier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
