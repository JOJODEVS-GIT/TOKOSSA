import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Routes admin pour les alertes de reapprovisionnement.
 * GET  : renvoie les produits avec stock < seuil
 * POST : envoie une alerte WhatsApp a l'admin pour les produits en rupture
 */

/** GET - Liste les produits sous le seuil de stock */
export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') ?? '5', 10)

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lt: threshold },
      },
      select: {
        id: true,
        name: true,
        stock: true,
        slug: true,
        category: true,
      },
      orderBy: { stock: 'asc' },
    })

    return NextResponse.json({
      threshold,
      count: products.length,
      products,
    })
  } catch (error) {
    console.error('Erreur lors de la recuperation des alertes stock:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

/** POST - Envoie une alerte WhatsApp a l'admin pour le stock bas */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') ?? '5', 10)

    // Recuperer les produits sous le seuil
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        stock: { lt: threshold },
      },
      select: {
        name: true,
        stock: true,
      },
      orderBy: { stock: 'asc' },
    })

    if (products.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Aucun produit sous le seuil de stock',
      })
    }

    // Construire le message WhatsApp
    const ruptures = products.filter((p) => p.stock === 0)
    const stockBas = products.filter((p) => p.stock > 0)

    let message = `🚨 *ALERTE STOCK TOKOSSA*\n\n`

    if (ruptures.length > 0) {
      message += `❌ *RUPTURE DE STOCK (${ruptures.length}):*\n`
      for (const p of ruptures) {
        message += `  - ${p.name}\n`
      }
      message += `\n`
    }

    if (stockBas.length > 0) {
      message += `⚠️ *STOCK BAS (${stockBas.length}):*\n`
      for (const p of stockBas) {
        message += `  - ${p.name} (${p.stock} restant${p.stock > 1 ? 's' : ''})\n`
      }
    }

    message += `\n📦 Pensez a reapprovisionner rapidement !`

    // Enregistrer le log WhatsApp en base
    const adminPhone = process.env.ADMIN_WHATSAPP_PHONE ?? ''

    if (!adminPhone) {
      // Si pas de numero admin configure, renvoyer le lien WhatsApp
      return NextResponse.json({
        success: true,
        message: 'Numero admin non configure. Lien WhatsApp genere.',
        whatsappMessage: message,
        productsCount: products.length,
      })
    }

    // Enregistrer dans les logs WhatsApp
    await prisma.whatsAppLog.create({
      data: {
        phone: adminPhone,
        messageType: 'stock_alert',
        content: message,
        status: 'pending',
      },
    })

    // Generer le lien WhatsApp pour ouverture manuelle
    const cleanPhone = adminPhone.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`

    return NextResponse.json({
      success: true,
      message: `Alerte preparee pour ${products.length} produit(s)`,
      whatsappUrl,
      productsCount: products.length,
    })
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'alerte stock:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
