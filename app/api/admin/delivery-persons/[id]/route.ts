import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Routes admin pour un livreur specifique.
 * PATCH  : modifier un livreur (toggle isActive, modifier zone, etc.)
 * DELETE : supprimer un livreur
 */

/** Schema de validation pour la modification d'un livreur */
interface PatchDeliveryPersonBody {
  name?: string
  phone?: string
  zone?: string
  isActive?: boolean
  totalDeliveries?: number
}

/** PATCH - Modifier un livreur */
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
    const body = (await request.json()) as PatchDeliveryPersonBody

    // Verifier que le livreur existe
    const existing = await prisma.deliveryPerson.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Livreur introuvable' },
        { status: 404 }
      )
    }

    // Construire les donnees de mise a jour dynamiquement
    const updateData: Record<string, unknown> = {}

    if (typeof body.name === 'string') {
      updateData.name = body.name
    }
    if (typeof body.phone === 'string') {
      updateData.phone = body.phone
    }
    if (typeof body.zone === 'string') {
      updateData.zone = body.zone
    }
    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive
    }
    if (typeof body.totalDeliveries === 'number') {
      updateData.totalDeliveries = body.totalDeliveries
    }

    const livreur = await prisma.deliveryPerson.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(livreur)
  } catch (error) {
    console.error('Erreur lors de la modification du livreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** DELETE - Supprimer un livreur */
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

    // Verifier que le livreur existe
    const existing = await prisma.deliveryPerson.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Livreur introuvable' },
        { status: 404 }
      )
    }

    await prisma.deliveryPerson.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du livreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
