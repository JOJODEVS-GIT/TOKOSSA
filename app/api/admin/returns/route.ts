import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour les demandes de retour.
 * GET    : liste toutes les demandes de retour
 * DELETE : supprime toutes les demandes de retour
 */

/** GET - Liste les demandes de retour avec infos commande */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const returns = await prisma.returnRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        order: {
          select: {
            orderNumber: true,
            customerName: true,
            phone: true,
            total: true,
          },
        },
      },
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('GET /api/admin/returns error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE - Supprime toutes les demandes de retour */
export async function DELETE() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    await prisma.returnRequest.deleteMany()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/returns error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
