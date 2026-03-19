import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour une demande de retour specifique.
 * PATCH  : changer le statut (approved, rejected, refunded)
 * DELETE : supprimer la demande
 */

/** PATCH - Changer le statut d'une demande de retour */
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

    const validStatuses = ['pending', 'approved', 'rejected', 'refunded']
    if (body.status && !validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: `Statut invalide. Valeurs : ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const returnReq = await prisma.returnRequest.update({
      where: { id },
      data: { status: body.status },
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

    return NextResponse.json(returnReq)
  } catch (error) {
    console.error('PATCH /api/admin/returns/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** DELETE - Supprimer une demande de retour */
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

    await prisma.returnRequest.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/returns/[id] error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
