import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'

// GET /api/whatsapp/suivi - Générer lien de suivi WhatsApp
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderNumber = searchParams.get('order')

    if (!orderNumber) {
      return NextResponse.json(
        { error: 'Numéro de commande requis' },
        { status: 400 }
      )
    }

    // Récupérer la commande
    const order = await prisma.order.findUnique({
      where: { orderNumber },
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

    // Générer le message de suivi
    const statusMessages: Record<string, string> = {
      PENDING: 'En attente de confirmation',
      CONFIRMED: 'Confirmée, en préparation',
      PREPARING: 'En cours de préparation',
      DELIVERING: 'En cours de livraison 🛵',
      DELIVERED: 'Livrée ✅',
      CANCELLED: 'Annulée ❌',
    }

    const productsList = order.items
      .map((item) => `• ${item.quantity}x ${item.product.name}`)
      .join('\n')

    const message = `📦 SUIVI COMMANDE TOKOSSA

Commande: #${order.orderNumber}
Statut: ${statusMessages[order.status] || order.status}

Détails:
${productsList}

Total: ${formatPrice(order.total)}

📍 Livraison: ${order.address}, ${order.quarter}

Des questions ? Répondez à ce message !`

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'
    const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        statusText: statusMessages[order.status],
        total: order.total,
        createdAt: order.createdAt,
      },
      whatsappLink,
    })
  } catch (error) {
    console.error('GET /api/whatsapp/suivi error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la génération du lien' },
      { status: 500 }
    )
  }
}
