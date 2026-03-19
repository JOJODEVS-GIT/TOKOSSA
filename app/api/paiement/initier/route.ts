import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { getKKiapayWidgetConfig } from '@/lib/kkiapay'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const RATE_LIMIT_INITIER = { max: 10, windowMs: 60 * 1000 }

// POST /api/paiement/initier - Initialiser un paiement KKiaPay
export async function POST(request: NextRequest) {
  try {
    // SECURITE : Rate limiting — max 10 initiations par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'paiement-initier', RATE_LIMIT_INITIER))) {
      return NextResponse.json(
        { error: 'Trop de requetes' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      )
    }

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cette commande a déjà été traitée' },
        { status: 400 }
      )
    }

    // Générer la configuration du widget KKiaPay
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/paiement/webhook`

    // Si paiement en 2x, envoyer uniquement le montant de la 1ere partie
    const amount = order.isSplitPayment && order.splitFirstAmount
      ? order.splitFirstAmount
      : order.total

    const config = getKKiapayWidgetConfig({
      amount,
      reason: `Commande TOKOSSA #${order.orderNumber}`,
      name: order.customerName,
      phone: order.phone,
      email: order.email || undefined,
      orderId: order.id,
      callback: callbackUrl,
    })

    return NextResponse.json({
      config,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('POST /api/paiement/initier error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'initialisation du paiement' },
      { status: 500 }
    )
  }
}
