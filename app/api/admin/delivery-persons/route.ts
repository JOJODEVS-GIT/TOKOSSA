import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Routes admin pour la gestion des livreurs TOKOSSA.
 * GET  : liste tous les livreurs tries par nom
 * POST : creer un nouveau livreur
 */

/** GET - Liste tous les livreurs tries par nom */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const livreurs = await prisma.deliveryPerson.findMany({
      orderBy: { name: 'asc' },
    })
    return NextResponse.json(livreurs)
  } catch (error) {
    console.error('Erreur lors de la recuperation des livreurs:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** Schema de validation pour la creation d'un livreur */
interface CreateDeliveryPersonBody {
  name: string
  phone: string
  zone: string
}

/** POST - Creer un nouveau livreur */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = (await request.json()) as CreateDeliveryPersonBody

    // Validation des champs obligatoires
    if (!body.name || !body.phone || !body.zone) {
      return NextResponse.json(
        { error: 'Le nom, le telephone et la zone sont obligatoires' },
        { status: 400 }
      )
    }

    // Verifier si le telephone existe deja
    const existing = await prisma.deliveryPerson.findUnique({
      where: { phone: body.phone },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Un livreur avec ce numero de telephone existe deja' },
        { status: 409 }
      )
    }

    const livreur = await prisma.deliveryPerson.create({
      data: {
        name: body.name,
        phone: body.phone,
        zone: body.zone,
        isActive: true,
        totalDeliveries: 0,
      },
    })

    return NextResponse.json(livreur, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la creation du livreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
