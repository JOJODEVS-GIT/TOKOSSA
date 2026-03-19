import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { formatPrice } from '@/lib/utils'

// POST /api/whatsapp/confirmer - Envoyer confirmation WhatsApp
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, type = 'confirmation' } = body

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande requis' },
        { status: 400 }
      )
    }

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Commande non trouvée' },
        { status: 404 }
      )
    }

    const productsList = order.items
      .map((item) => `${item.quantity}x ${item.product.name}`)
      .join(', ')

    let success = false

    switch (type) {
      case 'confirmation':
        success = await sendWhatsAppMessage(order.phone, 'order_confirmation', {
          name: order.customerName.split(' ')[0],
          orderNumber: order.orderNumber,
          products: productsList,
          total: formatPrice(order.total),
          address: order.address,
          quarter: order.quarter,
        })
        break

      case 'delivering':
        success = await sendWhatsAppMessage(order.phone, 'order_delivering', {
          name: order.customerName.split(' ')[0],
          orderNumber: order.orderNumber,
          duration: '30-45 minutes',
          deliveryPhone: process.env.DELIVERY_PHONE || '+229 00 00 00 00',
        })
        break

      case 'delivered':
        success = await sendWhatsAppMessage(order.phone, 'order_delivered', {
          name: order.customerName.split(' ')[0],
          reviewLink: `${process.env.NEXT_PUBLIC_APP_URL}/avis/${order.orderNumber}`,
        })
        break

      default:
        return NextResponse.json(
          { error: 'Type de message invalide' },
          { status: 400 }
        )
    }

    // Log le message
    await prisma.whatsAppLog.create({
      data: {
        phone: order.phone,
        messageType: type,
        content: `Message ${type} pour commande ${order.orderNumber}`,
        status: success ? 'sent' : 'failed',
        orderId: order.id,
        sentAt: success ? new Date() : null,
      },
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Échec de l\'envoi du message' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/whatsapp/confirmer error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du message' },
      { status: 500 }
    )
  }
}
