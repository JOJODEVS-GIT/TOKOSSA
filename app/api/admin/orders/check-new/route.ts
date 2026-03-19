import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Route : Verification des nouvelles commandes.
 * Retourne les commandes creees dans les 60 dernieres secondes.
 * Utilisee par le composant NewOrderAlert pour le polling admin.
 */

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const sixtySecondsAgo = new Date(Date.now() - 60 * 1000)

    const newOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: sixtySecondsAgo },
      },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      count: newOrders.length,
      orders: newOrders,
    })
  } catch (error) {
    console.error('Erreur check nouvelles commandes:', error)
    return NextResponse.json(
      { count: 0, orders: [] },
      { status: 200 }
    )
  }
}
