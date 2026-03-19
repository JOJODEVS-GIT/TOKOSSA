import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour les paniers abandonnes.
 * GET    : liste tous les paniers abandonnes
 * DELETE : supprime tous les paniers abandonnes
 */

/** GET - Liste les paniers abandonnes tries par date */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const carts = await prisma.abandonedCart.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(carts)
  } catch (error) {
    console.error('GET /api/admin/abandoned-carts error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE - Supprime tous les paniers abandonnes */
export async function DELETE() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    await prisma.abandonedCart.deleteMany()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/abandoned-carts error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
