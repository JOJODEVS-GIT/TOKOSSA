import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { isValidBeninPhone } from '@/lib/utils'

/**
 * GET /api/profil?phone=+22901XXXXXXXX
 * Recherche un profil client par numero de telephone.
 * Retourne les informations du client avec le nombre de commandes.
 * SECURITE : Valide le format du telephone pour limiter l'enumeration.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone) {
    return NextResponse.json(
      { error: 'Le parametre phone est requis' },
      { status: 400 }
    )
  }

  // SECURITE : Valider le format du telephone beninois
  if (!isValidBeninPhone(phone)) {
    return NextResponse.json(
      { error: 'Format de telephone invalide' },
      { status: 400 }
    )
  }

  try {
    // Chercher la derniere commande de ce numero pour extraire les infos client
    const latestOrder = await prisma.order.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      select: {
        customerName: true,
        phone: true,
        email: true,
        address: true,
        quarter: true,
      },
    })

    if (!latestOrder) {
      return NextResponse.json(
        { error: 'Aucun profil trouve pour ce numero' },
        { status: 404 }
      )
    }

    // Compter le nombre total de commandes
    const orderCount = await prisma.order.count({
      where: { phone },
    })

    // Extraire prenom et nom depuis customerName
    const nameParts = latestOrder.customerName.split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''

    // SECURITE : Ne pas retourner l'email complet, le masquer partiellement
    let maskedEmail: string | null = null
    if (latestOrder.email) {
      const [localPart, domain] = latestOrder.email.split('@')
      if (localPart && domain) {
        const visibleChars = Math.min(3, localPart.length)
        maskedEmail = localPart.slice(0, visibleChars) + '***@' + domain
      }
    }

    return NextResponse.json({
      id: phone,
      firstName,
      lastName,
      phone: latestOrder.phone,
      email: maskedEmail,
      address: latestOrder.address,
      quarter: latestOrder.quarter,
      _count: {
        orders: orderCount,
      },
    })
  } catch (error) {
    console.error('Erreur API profil:', error)
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
