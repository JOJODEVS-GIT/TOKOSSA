import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyTransaction } from '@/lib/kkiapay'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const RATE_LIMIT_SPLIT = { max: 10, windowMs: 60 * 1000 }

/**
 * POST /api/paiement/split-second
 * Confirme le paiement de la 2ème tranche (à la livraison) pour un paiement en 2x.
 * Body : { orderId, transactionId }
 */
export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'paiement-split-second', RATE_LIMIT_SPLIT))) {
      return NextResponse.json({ error: 'Trop de requetes' }, { status: 429 })
    }

    const body = await request.json()
    const { orderId, transactionId } = body

    if (!orderId || !transactionId) {
      return NextResponse.json(
        { error: 'orderId et transactionId requis' },
        { status: 400 }
      )
    }

    // Verifier la transaction aupres de KKiaPay
    const transaction = await verifyTransaction(transactionId)

    if (!transaction || transaction.status !== 'SUCCESS') {
      return NextResponse.json(
        { error: 'Transaction invalide ou non reussie' },
        { status: 400 }
      )
    }

    // Recuperer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json({ error: 'Commande non trouvee' }, { status: 404 })
    }

    // Verifier que c'est bien un paiement en 2x
    if (!order.isSplitPayment || !order.splitSecondAmount) {
      return NextResponse.json(
        { error: 'Cette commande ne necessite pas de 2eme paiement' },
        { status: 400 }
      )
    }

    // Verifier que la 1ere tranche a bien ete payee
    if (!order.paidAt) {
      return NextResponse.json(
        { error: 'La premiere tranche de paiement n\'a pas encore ete confirmee' },
        { status: 400 }
      )
    }

    // Verifier que la 2eme tranche n'a pas deja ete payee
    if (order.splitSecondPaidAt) {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyPaid: true,
      })
    }

    // Verifier que la commande est dans un statut permettant le 2eme paiement
    if (!['CONFIRMED', 'PREPARING', 'DELIVERING'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Statut de commande incompatible avec le 2eme paiement' },
        { status: 400 }
      )
    }

    // Verifier le montant
    if (transaction.amount !== order.splitSecondAmount) {
      return NextResponse.json(
        { error: 'Montant de la transaction incorrect' },
        { status: 400 }
      )
    }

    // Enregistrer le paiement de la 2eme tranche — transaction atomique pour idempotence
    const result = await prisma.order.updateMany({
      where: { id: orderId, splitSecondPaidAt: null },
      data: { splitSecondPaidAt: new Date() },
    })

    if (result.count === 0) {
      return NextResponse.json({ success: true, orderNumber: order.orderNumber, alreadyPaid: true })
    }

    console.log('Split 2eme tranche confirme:', order.orderNumber)

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('POST /api/paiement/split-second error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation du 2eme paiement' },
      { status: 500 }
    )
  }
}
