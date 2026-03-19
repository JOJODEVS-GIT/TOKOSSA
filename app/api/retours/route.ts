import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * Delai maximum pour demander un retour apres livraison (en jours).
 */
const DELAI_RETOUR_JOURS = 7

/**
 * Raisons de retour acceptees.
 */
const RAISONS_VALIDES = ['defectueux', 'ne_correspond_pas', 'autre'] as const

// POST /api/retours - Creer une demande de retour
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, reason, description } = body as {
      orderId?: string
      reason?: string
      description?: string
    }

    // Validation des champs requis
    if (!orderId || !reason) {
      return NextResponse.json(
        { error: 'Le numero de commande et la raison sont requis' },
        { status: 400 }
      )
    }

    // Validation de la raison
    if (!RAISONS_VALIDES.includes(reason as typeof RAISONS_VALIDES[number])) {
      return NextResponse.json(
        { error: 'Raison de retour invalide' },
        { status: 400 }
      )
    }

    // Verifier que la commande existe
    const order = await prisma.order.findUnique({
      where: { orderNumber: orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        deliveredAt: true,
        phone: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable. Verifiez le numero.' },
        { status: 404 }
      )
    }

    // Verifier que la commande est bien livree
    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'Seules les commandes livrees peuvent faire l\'objet d\'un retour.' },
        { status: 400 }
      )
    }

    // Verifier le delai de 7 jours apres livraison
    const deliveredAt = order.deliveredAt
    if (!deliveredAt) {
      return NextResponse.json(
        { error: 'La date de livraison n\'est pas enregistree pour cette commande.' },
        { status: 400 }
      )
    }

    const maintenant = new Date()
    const dateLimite = new Date(deliveredAt)
    dateLimite.setDate(dateLimite.getDate() + DELAI_RETOUR_JOURS)

    if (maintenant > dateLimite) {
      return NextResponse.json(
        { error: `Le delai de retour de ${DELAI_RETOUR_JOURS} jours est depasse.` },
        { status: 400 }
      )
    }

    // Verifier qu'il n'y a pas deja une demande de retour en cours
    const existingReturn = await prisma.returnRequest.findFirst({
      where: {
        orderId: order.id,
        status: { in: ['pending', 'approved'] },
      },
    })

    if (existingReturn) {
      return NextResponse.json(
        { error: 'Une demande de retour est deja en cours pour cette commande.' },
        { status: 409 }
      )
    }

    // Creer la demande de retour
    const returnRequest = await prisma.returnRequest.create({
      data: {
        orderId: order.id,
        reason,
        description: description || null,
      },
    })

    return NextResponse.json(
      {
        id: returnRequest.id,
        orderNumber: order.orderNumber,
        status: returnRequest.status,
        message: 'Votre demande de retour a ete enregistree. Nous vous contacterons sous 48h.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/retours error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la creation de la demande de retour' },
      { status: 500 }
    )
  }
}

// GET /api/retours?phone=01XXXXXXXX - Lister les retours d'un client par telephone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json(
        { error: 'Le numero de telephone est requis' },
        { status: 400 }
      )
    }

    // Recuperer les retours via les commandes du client
    const returns = await prisma.returnRequest.findMany({
      where: {
        order: {
          phone,
        },
      },
      include: {
        order: {
          select: {
            orderNumber: true,
            total: true,
            customerName: true,
            phone: true,
            deliveredAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(returns)
  } catch (error) {
    console.error('GET /api/retours error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des retours' },
      { status: 500 }
    )
  }
}
