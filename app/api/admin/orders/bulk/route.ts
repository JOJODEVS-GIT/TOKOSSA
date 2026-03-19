import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour les actions groupees sur les commandes.
 * PATCH  : changer le statut de plusieurs commandes
 * DELETE : supprimer une, plusieurs ou toutes les commandes
 */

/** PATCH - Changer le statut de plusieurs commandes */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const { ids, status } = body as { ids: string[]; status: string }

    if (!ids?.length || !status) {
      return NextResponse.json(
        { error: 'ids et status sont requis' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = { status }
    if (status === 'DELIVERED') updateData.deliveredAt = new Date()
    if (status === 'CONFIRMED') updateData.paidAt = new Date()

    await prisma.order.updateMany({
      where: { id: { in: ids } },
      data: updateData,
    })

    return NextResponse.json({ success: true, updated: ids.length })
  } catch (error) {
    console.error('PATCH /api/admin/orders/bulk error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE - Supprimer des commandes */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids')

    if (idsParam) {
      const ids = idsParam.split(',')
      await prisma.returnRequest.deleteMany({ where: { orderId: { in: ids } } })
      await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } })
      await prisma.order.deleteMany({ where: { id: { in: ids } } })
    } else {
      await prisma.returnRequest.deleteMany()
      await prisma.orderItem.deleteMany()
      await prisma.order.deleteMany()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/orders/bulk error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
