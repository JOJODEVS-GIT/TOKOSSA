import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour un panier abandonne specifique.
 * PATCH  : mettre a jour le statut (relance WhatsApp)
 * DELETE : supprimer un panier abandonne
 */

/** PATCH - Mettre a jour le statut d'un panier (ex: reminded_1) */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    const cart = await prisma.abandonedCart.update({
      where: { id },
      data: {
        status: body.status,
        remindedAt: body.status?.startsWith('reminded') ? new Date() : undefined,
        recoveredAt: body.status === 'recovered' ? new Date() : undefined,
      },
    })

    return NextResponse.json(cart)
  } catch (error) {
    console.error('PATCH /api/admin/abandoned-carts/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE - Supprimer un panier abandonne */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { id } = await params

    await prisma.abandonedCart.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/abandoned-carts/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
