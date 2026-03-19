import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * GET /api/loyalty?phone=xxx
 * Recupere le solde de points de fidelite d'un client
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json({ error: 'Telephone requis' }, { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { loyaltyPoints: true, name: true },
    })

    if (!user) {
      return NextResponse.json({ points: 0, name: null })
    }

    return NextResponse.json({
      points: user.loyaltyPoints,
      name: user.name,
    })
  } catch (error) {
    console.error('Loyalty GET error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/loyalty
 * Credite des points apres un achat (100 FCFA = 1 point)
 * SECURITE : Appel interne uniquement (via header X-Internal-Key)
 * Body: { phone, orderId, orderTotal }
 */
export async function POST(request: Request) {
  try {
    // SECURITE : Verifier que l'appel est interne (serveur-a-serveur)
    const internalKey = request.headers.get('x-internal-key')
    const expectedKey = process.env.NEXTAUTH_SECRET

    if (!expectedKey || internalKey !== expectedKey) {
      console.warn('SECURITE: Tentative d\'acces non autorise a POST /api/loyalty')
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { phone, orderId, orderTotal } = await request.json()

    if (!phone || !orderTotal) {
      return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    }

    // SECURITE : Verifier que orderTotal est un nombre positif raisonnable
    if (typeof orderTotal !== 'number' || orderTotal <= 0 || orderTotal > 10000000) {
      return NextResponse.json({ error: 'Montant invalide' }, { status: 400 })
    }

    // SECURITE : Verifier que la commande existe et est confirmee
    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { status: true, total: true, phone: true },
      })

      if (!order) {
        return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })
      }

      if (order.status !== 'CONFIRMED' && order.status !== 'DELIVERED') {
        return NextResponse.json({ error: 'Commande non confirmee' }, { status: 400 })
      }

      // Verifier que le telephone correspond
      if (order.phone !== phone) {
        return NextResponse.json({ error: 'Telephone ne correspond pas' }, { status: 400 })
      }
    }

    // Calculer les points : 100 FCFA = 1 point
    const pointsEarned = Math.floor(orderTotal / 100)

    if (pointsEarned <= 0) {
      return NextResponse.json({ pointsEarned: 0 })
    }

    // Trouver ou creer l'utilisateur
    const user = await prisma.user.upsert({
      where: { phone },
      update: {
        loyaltyPoints: { increment: pointsEarned },
      },
      create: {
        phone,
        loyaltyPoints: pointsEarned,
      },
    })

    // Enregistrer l'historique
    await prisma.loyaltyPoint.create({
      data: {
        userId: user.id,
        points: pointsEarned,
        type: 'EARN',
        reason: 'purchase',
        orderId: orderId || null,
      },
    })

    // Mettre a jour la commande avec les points gagnes
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { loyaltyPointsEarned: pointsEarned },
      }).catch(() => {}) // Ignorer si commande introuvable
    }

    return NextResponse.json({
      pointsEarned,
      totalPoints: user.loyaltyPoints,
    })
  } catch (error) {
    console.error('Loyalty POST error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
