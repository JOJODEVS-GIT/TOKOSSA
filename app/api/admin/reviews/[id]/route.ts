import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Routes admin pour moderer un avis specifique.
 * PATCH  : mettre a jour isVerified (approuver/rejeter)
 * DELETE : supprimer un avis
 */

/** Schema de validation pour la modification d'un avis */
interface PatchReviewBody {
  isVerified: boolean
}

/** PATCH - Approuver ou rejeter un avis */
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
    const body = (await request.json()) as PatchReviewBody

    // Verifier que l'avis existe
    const existing = await prisma.review.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Avis introuvable' },
        { status: 404 }
      )
    }

    const review = await prisma.review.update({
      where: { id },
      data: { isVerified: body.isVerified },
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Erreur lors de la modification de l\'avis:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** DELETE - Supprimer un avis */
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

    // Verifier que l'avis existe
    const existing = await prisma.review.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Avis introuvable' },
        { status: 404 }
      )
    }

    await prisma.review.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'avis:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
