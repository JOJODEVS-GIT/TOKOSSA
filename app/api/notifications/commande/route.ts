import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'

/**
 * POST /api/notifications/commande
 * Envoie une notification WhatsApp au client et a l'admin apres commande.
 * Body : { orderId: string, orderNumber: string }
 *
 * Note: En production, integrer Twilio WhatsApp Business API.
 * Pour l'instant, on log le message et on retourne le lien WhatsApp.
 */
export async function POST(request: Request) {
  try {
    const { orderId, orderNumber } = await request.json()

    if (!orderId || !orderNumber) {
      return NextResponse.json(
        { error: 'orderId et orderNumber sont requis' },
        { status: 400 }
      )
    }

    // Recuperer les details de la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvee' },
        { status: 404 }
      )
    }

    // Construire le message de confirmation client
    const itemsList = order.items
      .map((item) => `• ${item.product.name} x${item.quantity} — ${formatPrice(item.price * item.quantity)}`)
      .join('\n')

    const paymentLabelsMap: Record<string, string> = {
      MOBILE_MONEY: 'Mobile Money',
      MTN_MOBILE_MONEY: 'MTN Mobile Money',
      MOOV_MONEY: 'Moov Money',
      CELTIS_MONEY: 'Celtis Money',
      CASH_ON_DELIVERY: 'Paiement a la livraison',
    }
    const paymentLabel = paymentLabelsMap[order.paymentMethod] || order.paymentMethod

    const clientMessage = [
      `✅ *Commande confirmee !*`,
      ``,
      `Numero: *#${order.orderNumber}*`,
      ``,
      `📦 Articles:`,
      itemsList,
      ``,
      `💰 Total: *${formatPrice(order.total)}*`,
      `💳 Paiement: ${paymentLabel}`,
      `📍 Livraison: ${order.address}, ${order.quarter}`,
      ``,
      `Merci pour votre confiance ! 🙏`,
      `Suivi: tokossa.bj/commandes`,
    ].join('\n')

    // Message pour l'admin
    const adminMessage = [
      `🔔 *Nouvelle commande !*`,
      ``,
      `#${order.orderNumber}`,
      `Client: ${order.customerName}`,
      `Tel: ${order.phone}`,
      ``,
      itemsList,
      ``,
      `Total: *${formatPrice(order.total)}*`,
      `Paiement: ${paymentLabel}`,
      `Adresse: ${order.address}, ${order.quarter}`,
      order.notes ? `Notes: ${order.notes}` : '',
    ].filter(Boolean).join('\n')

    // Logger les messages (en production, envoyer via Twilio)
    await prisma.whatsAppLog.create({
      data: {
        phone: order.phone,
        content: clientMessage,
        messageType: 'ORDER_CONFIRMATION',
        status: 'pending',
        orderId: order.id,
      },
    })

    console.log('[WhatsApp] Message client:', clientMessage)
    console.log('[WhatsApp] Message admin:', adminMessage)

    return NextResponse.json({
      success: true,
      clientMessage,
      adminMessage,
      whatsappLink: `https://wa.me/${order.phone.replace('+', '')}?text=${encodeURIComponent(clientMessage)}`,
    })
  } catch (error) {
    console.error('Erreur notification commande:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
