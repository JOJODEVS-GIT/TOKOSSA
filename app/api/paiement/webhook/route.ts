import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'
import prisma from '@/lib/db'
import { verifyTransaction } from '@/lib/kkiapay'
import { sendWhatsAppMessage, notifyAdminNewOrder } from '@/lib/whatsapp'
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email'
import { formatPrice } from '@/lib/utils'
import { checkRateLimit, getClientIP, RATE_LIMIT_WEBHOOK } from '@/lib/rate-limit'

/**
 * Verifie la signature HMAC du webhook KKiaPay.
 * Empeche un attaquant d'envoyer un faux webhook pour confirmer une commande sans payer.
 */
function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.KKIAPAY_PRIVATE_KEY
  if (!secret) return false
  if (!signature) return false

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    )
  } catch {
    return false
  }
}

// POST /api/paiement/webhook - Webhook KKiaPay
export async function POST(request: NextRequest) {
  try {
    // SECURITE : Rate limiting — max 30 webhooks par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'webhook', RATE_LIMIT_WEBHOOK))) {
      console.warn(`SECURITE: Rate limit webhook depasse pour IP ${clientIP}`)
      return NextResponse.json(
        { error: 'Trop de requetes' },
        { status: 429 }
      )
    }

    // SECURITE : Verification signature HMAC du webhook
    const rawBody = await request.text()
    const signature = request.headers.get('x-kkiapay-signature')

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn(`SECURITE: Signature webhook invalide depuis IP ${clientIP}`)
      return NextResponse.json(
        { error: 'Signature invalide' },
        { status: 401 }
      )
    }

    const body = JSON.parse(rawBody)
    const { transactionId, data: orderId } = body

    console.log('KKiaPay webhook received:', { transactionId, orderId })

    if (!transactionId || !orderId) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    // Vérifier la transaction auprès de KKiaPay
    const transaction = await verifyTransaction(transactionId)

    if (!transaction) {
      console.error('Transaction verification failed')
      return NextResponse.json(
        { error: 'Impossible de vérifier la transaction' },
        { status: 400 }
      )
    }

    if (transaction.status !== 'SUCCESS') {
      console.log('Transaction not successful:', transaction.status)
      return NextResponse.json(
        { error: 'Transaction non réussie', status: transaction.status },
        { status: 400 }
      )
    }

    // Récupérer la commande — select minimal pour éviter un N+1 sur product
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          select: {
            quantity: true,
            price: true,
            product: {
              select: { name: true, images: true },
            },
          },
        },
      },
    })

    if (!order) {
      console.error('Order not found:', orderId)
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    // S1: Idempotence — si deja confirme avec le meme transactionId, succes immediat
    if (order.status === 'CONFIRMED' && order.paymentRef === transactionId) {
      return NextResponse.json({ success: true, orderNumber: order.orderNumber })
    }

    // SECURITE : Verifier que la commande est bien en attente de paiement
    if (order.status !== 'PENDING') {
      console.warn(
        `SECURITE: Tentative de re-confirmation commande ${order.orderNumber} (statut actuel: ${order.status})`
      )
      return NextResponse.json(
        { error: 'Commande deja traitee' },
        { status: 400 }
      )
    }

    // SECURITE : Verifier que le montant paye correspond au montant attendu
    const expectedAmount = order.isSplitPayment && order.splitFirstAmount
      ? order.splitFirstAmount
      : order.total

    if (transaction.amount !== expectedAmount) {
      console.error(
        `SECURITE FRAUDE: Montant transaction (${transaction.amount} FCFA) != montant attendu (${expectedAmount} FCFA) pour commande ${order.orderNumber}`
      )
      return NextResponse.json(
        { error: 'Montant de la transaction incorrect' },
        { status: 400 }
      )
    }

    // S1: Transaction atomique — updateMany garantit l'idempotence si webhook double-fire
    const confirmed = await prisma.$transaction(async (tx) => {
      const result = await tx.order.updateMany({
        where: { id: orderId, status: 'PENDING' },
        data: {
          status: 'CONFIRMED',
          paymentRef: transactionId,
          paidAt: new Date(),
        },
      })

      if (result.count === 0) return false

      // Crediter les points de fidelite dans la meme transaction (idempotence)
      const pointsEarned = Math.floor(order.total / 100)
      if (pointsEarned > 0) {
        const existingPoints = await tx.loyaltyPoint.findFirst({
          where: { orderId: order.id, type: 'EARN' },
        })

        if (!existingPoints) {
          const user = await tx.user.upsert({
            where: { phone: order.phone },
            update: { loyaltyPoints: { increment: pointsEarned } },
            create: { phone: order.phone, name: order.customerName, loyaltyPoints: pointsEarned },
            select: { id: true },
          })

          await tx.loyaltyPoint.create({
            data: {
              userId: user.id,
              points: pointsEarned,
              type: 'EARN',
              reason: 'order_purchase',
              orderId: order.id,
            },
          })
        }
      }

      return true
    })

    if (!confirmed) {
      // Race condition: un autre webhook a confirme en meme temps
      return NextResponse.json({ success: true, orderNumber: order.orderNumber })
    }

    // Invalider le cache ISR des pages produits (stock mis a jour apres paiement)
    revalidatePath('/produits', 'page')
    revalidatePath('/', 'page')

    // Envoyer confirmation WhatsApp au client
    const productsList = order.items
      .map((item) => `${item.quantity}x ${item.product.name}`)
      .join(', ')

    // Notifications fire-and-forget pour ne pas bloquer le webhook
    sendWhatsAppMessage(order.phone, 'order_confirmation', {
      name: order.customerName.split(' ')[0],
      orderNumber: order.orderNumber,
      products: productsList,
      total: formatPrice(order.total),
      address: order.address,
      quarter: order.quarter,
    }).catch(console.error)

    // Envoyer email si disponible
    if (order.email) {
      const emailHtml = getOrderConfirmationEmail({
        customerName: order.customerName,
        orderNumber: order.orderNumber,
        items: order.items.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price,
        })),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        total: order.total,
        address: order.address,
        quarter: order.quarter,
      })

      sendEmail({
        to: order.email,
        subject: `Commande TOKOSSA #${order.orderNumber} confirmee`,
        html: emailHtml,
      }).catch(console.error)
    }

    // Creer une notification de vente (social proof)
    prisma.saleNotification.create({
      data: {
        productName: order.items[0]?.product.name || 'Produit',
        customerName: order.customerName.split(' ')[0],
        quarter: order.quarter,
      },
    }).catch(console.error)

    // Notifier l'admin par WhatsApp
    notifyAdminNewOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      total: order.total,
      quarter: order.quarter,
      paymentMethod: 'MOBILE_MONEY',
    }).catch(console.error)

    console.log('Order confirmed:', order.orderNumber)

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('POST /api/paiement/webhook error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement du webhook' },
      { status: 500 }
    )
  }
}

// GET - Pour vérification KKiaPay
export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
