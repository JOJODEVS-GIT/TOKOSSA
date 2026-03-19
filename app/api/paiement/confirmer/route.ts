import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { verifyTransaction } from '@/lib/kkiapay'
import { sendWhatsAppMessage, notifyAdminNewOrder } from '@/lib/whatsapp'
import { sendEmail, getOrderConfirmationEmail } from '@/lib/email'
import { formatPrice } from '@/lib/utils'
import { checkRateLimit, getClientIP } from '@/lib/rate-limit'

const RATE_LIMIT_CONFIRMER = { max: 10, windowMs: 60 * 1000 }

// POST /api/paiement/confirmer - Confirmation client-side (backup du webhook)
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'paiement-confirmer', RATE_LIMIT_CONFIRMER))) {
      return NextResponse.json(
        { error: 'Trop de requetes' },
        { status: 429 }
      )
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

    if (!transaction) {
      return NextResponse.json(
        { error: 'Impossible de verifier la transaction' },
        { status: 400 }
      )
    }

    if (transaction.status !== 'SUCCESS') {
      return NextResponse.json(
        { error: 'Transaction non reussie', status: transaction.status },
        { status: 400 }
      )
    }

    // Recuperer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { product: true },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvee' },
        { status: 404 }
      )
    }

    // Si deja confirmee (le webhook etait plus rapide), retourner succes
    if (order.status === 'CONFIRMED') {
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyConfirmed: true,
      })
    }

    // Si la commande n'est pas PENDING, ne rien faire
    if (order.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Commande dans un statut inattendu', status: order.status },
        { status: 400 }
      )
    }

    // Verifier que le montant paye correspond au montant attendu
    const expectedAmount = order.isSplitPayment && order.splitFirstAmount
      ? order.splitFirstAmount
      : order.total

    if (transaction.amount !== expectedAmount) {
      console.error(
        `SECURITE FRAUDE (confirmer): Montant transaction (${transaction.amount} FCFA) != attendu (${expectedAmount} FCFA) pour commande ${order.orderNumber}`
      )
      return NextResponse.json(
        { error: 'Montant de la transaction incorrect' },
        { status: 400 }
      )
    }

    // P3: Transaction atomique — updateMany + credit points (idempotence avec webhook)
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

      // Crediter les points seulement si le webhook ne les a pas deja credites
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
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        alreadyConfirmed: true,
      })
    }

    // Envoyer confirmation WhatsApp au client (fire-and-forget)
    const productsList = order.items
      .map((item) => `${item.quantity}x ${item.product.name}`)
      .join(', ')

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

    // Notification admin
    notifyAdminNewOrder({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      phone: order.phone,
      total: order.total,
      quarter: order.quarter,
      paymentMethod: 'MOBILE_MONEY',
    }).catch(console.error)

    // Social proof
    prisma.saleNotification.create({
      data: {
        productName: order.items[0]?.product.name || 'Produit',
        customerName: order.customerName.split(' ')[0],
        quarter: order.quarter,
      },
    }).catch(console.error)

    console.log('Confirmer: commande confirmee', order.orderNumber)

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
    })
  } catch (error) {
    console.error('POST /api/paiement/confirmer error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la confirmation du paiement' },
      { status: 500 }
    )
  }
}
