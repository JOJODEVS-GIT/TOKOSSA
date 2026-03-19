import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Routes admin pour la gestion des codes promo.
 * GET    : liste toutes les promotions
 * POST   : creer une nouvelle promotion
 * PATCH  : modifier une promotion existante (activer/desactiver, modifier champs)
 * DELETE : supprimer une ou toutes les promotions
 */

/** GET - Liste toutes les promotions triees par date de creation */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const promos = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(promos)
  } catch (error) {
    console.error('Erreur lors de la recuperation des promos:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** Schema de validation pour la creation d'une promo */
interface CreatePromoBody {
  code: string
  discount: number
  type: 'percent' | 'fixed'
  minOrder?: number
  maxUses?: number
  expiresAt?: string
}

/** POST - Creer un nouveau code promo */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = (await request.json()) as CreatePromoBody

    // Validation basique
    if (!body.code || !body.discount) {
      return NextResponse.json(
        { error: 'Le code et la reduction sont obligatoires' },
        { status: 400 }
      )
    }

    if (body.type === 'percent' && (body.discount < 1 || body.discount > 100)) {
      return NextResponse.json(
        { error: 'Le pourcentage doit etre entre 1 et 100' },
        { status: 400 }
      )
    }

    // Verifier si le code existe deja
    const existing = await prisma.promoCode.findUnique({
      where: { code: body.code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ce code promo existe deja' },
        { status: 409 }
      )
    }

    const promo = await prisma.promoCode.create({
      data: {
        code: body.code.toUpperCase(),
        discount: body.discount,
        type: body.type || 'percent',
        minOrder: body.minOrder ?? null,
        maxUses: body.maxUses ?? null,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
        isActive: true,
        usedCount: 0,
      },
    })

    return NextResponse.json(promo, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la creation de la promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** DELETE - Supprimer une ou toutes les promotions */
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
      await prisma.promoCode.delete({ where: { id } })
    } else {
      await prisma.promoCode.deleteMany()
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/admin/promotions error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** Schema de validation pour la modification d'une promo */
interface PatchPromoBody {
  id: string
  isActive?: boolean
  discount?: number
  type?: 'percent' | 'fixed'
  minOrder?: number | null
  maxUses?: number | null
  expiresAt?: string | null
}

/** PATCH - Modifier une promotion (activer/desactiver, modifier champs) */
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = (await request.json()) as PatchPromoBody

    if (!body.id) {
      return NextResponse.json(
        { error: 'L\'id de la promotion est obligatoire' },
        { status: 400 }
      )
    }

    // Construire les donnees de mise a jour dynamiquement
    const updateData: Record<string, unknown> = {}

    if (typeof body.isActive === 'boolean') {
      updateData.isActive = body.isActive
    }
    if (typeof body.discount === 'number') {
      updateData.discount = body.discount
    }
    if (body.type) {
      updateData.type = body.type
    }
    if (body.minOrder !== undefined) {
      updateData.minOrder = body.minOrder
    }
    if (body.maxUses !== undefined) {
      updateData.maxUses = body.maxUses
    }
    if (body.expiresAt !== undefined) {
      updateData.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }

    const promo = await prisma.promoCode.update({
      where: { id: body.id },
      data: updateData,
    })

    return NextResponse.json(promo)
  } catch (error) {
    console.error('Erreur lors de la modification de la promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
