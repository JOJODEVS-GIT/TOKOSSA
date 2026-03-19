import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

/**
 * GET /api/cron/relance-panier
 * Cron job pour envoyer des relances WhatsApp aux paniers abandonnes.
 * Appele par Vercel Cron toutes les heures.
 *
 * Logique :
 * - 1ere relance : 1h apres abandon (status: pending -> reminded_1)
 * - 2eme relance : 24h apres abandon (status: reminded_1 -> reminded_2)
 * - Expiration : 72h apres abandon (status: reminded_2 -> expired)
 *
 * Securite : verifier le header Authorization avec CRON_SECRET.
 */
export async function GET(request: Request) {
  // Verifier le secret du cron (Vercel Cron envoie ce header)
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  try {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const seventyTwoHoursAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000)

    // 1. Expirer les paniers trop vieux
    const expired = await prisma.abandonedCart.updateMany({
      where: {
        status: 'reminded_2',
        createdAt: { lt: seventyTwoHoursAgo },
      },
      data: { status: 'expired' },
    })

    // 2. Envoyer la 2eme relance (24h apres)
    const toRemind2 = await prisma.abandonedCart.findMany({
      where: {
        status: 'reminded_1',
        createdAt: { lt: twentyFourHoursAgo },
      },
      take: 50,
    })

    for (const cart of toRemind2) {
      const items = cart.items as Array<{ name: string; price: number; quantity: number }>
      const firstProduct = items[0]?.name || 'tes articles'

      const message = [
        `${cart.customerName || 'Hey'}, ton panier t'attend encore ! 🛒`,
        ``,
        `${firstProduct} est toujours disponible.`,
        `Total : ${formatPrice(cart.subtotal)}`,
        ``,
        `⚡ Finalise ta commande : tokossa.bj`,
        ``,
        `Besoin d'aide ? Reponds ici 😊`,
      ].join('\n')

      // Logger le message
      const log2 = await prisma.whatsAppLog.create({
        data: {
          phone: cart.phone,
          content: message,
          messageType: 'CART_REMINDER_2',
          status: 'pending',
        },
      })

      // Envoyer le message WhatsApp
      try {
        await sendWhatsAppMessage(cart.phone, 'cart_abandoned', {
          name: cart.customerName || '',
          product: firstProduct,
          total: formatPrice(cart.subtotal),
        })
        await prisma.whatsAppLog.update({
          where: { id: log2.id },
          data: { status: 'sent', sentAt: now },
        })
      } catch (err) {
        console.error(`[Relance 2] Erreur envoi WhatsApp ${cart.phone}:`, err)
        await prisma.whatsAppLog.update({
          where: { id: log2.id },
          data: { status: 'failed' },
        })
      }

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: 'reminded_2', remindedAt: now },
      })

      console.log(`[Relance 2] ${cart.phone} - ${firstProduct}`)
    }

    // 3. Envoyer la 1ere relance (1h apres)
    const toRemind1 = await prisma.abandonedCart.findMany({
      where: {
        status: 'pending',
        createdAt: { lt: oneHourAgo },
      },
      take: 50,
    })

    for (const cart of toRemind1) {
      const items = cart.items as Array<{ name: string; price: number; quantity: number; stock?: number }>
      const firstProduct = items[0]?.name || 'tes articles'
      const stock = items[0]?.stock || 5

      const message = [
        `Hey ${cart.customerName || ''} 👋`,
        ``,
        `Tu as laisse ${firstProduct} dans ton panier !`,
        `Il reste seulement ${stock} en stock. ⚡`,
        ``,
        `Commander : tokossa.bj`,
        ``,
        `Des questions ? Reponds ici 😊`,
      ].join('\n')

      const log1 = await prisma.whatsAppLog.create({
        data: {
          phone: cart.phone,
          content: message,
          messageType: 'CART_REMINDER_1',
          status: 'pending',
        },
      })

      // Envoyer le message WhatsApp
      try {
        await sendWhatsAppMessage(cart.phone, 'cart_abandoned', {
          name: cart.customerName || '',
          product: firstProduct,
          total: formatPrice(cart.subtotal),
        })
        await prisma.whatsAppLog.update({
          where: { id: log1.id },
          data: { status: 'sent', sentAt: now },
        })
      } catch (err) {
        console.error(`[Relance 1] Erreur envoi WhatsApp ${cart.phone}:`, err)
        await prisma.whatsAppLog.update({
          where: { id: log1.id },
          data: { status: 'failed' },
        })
      }

      await prisma.abandonedCart.update({
        where: { id: cart.id },
        data: { status: 'reminded_1', remindedAt: now },
      })

      console.log(`[Relance 1] ${cart.phone} - ${firstProduct}`)
    }

    return NextResponse.json({
      success: true,
      stats: {
        reminded1: toRemind1.length,
        reminded2: toRemind2.length,
        expired: expired.count,
      },
    })
  } catch (error) {
    console.error('Erreur cron relance panier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
