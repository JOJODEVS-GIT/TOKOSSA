import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { checkRateLimit, getClientIP, RATE_LIMIT_PROMOS } from '@/lib/rate-limit'

/**
 * POST /api/promos/validate
 * Valide un code promo et retourne les details de la reduction.
 * Body : { code: string, orderTotal: number }
 */
export async function POST(request: Request) {
  try {
    // SECURITE : Rate limiting — max 10 validations par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'promos-validate', RATE_LIMIT_PROMOS))) {
      return NextResponse.json(
        { error: 'Trop de tentatives. Reessayez dans une minute.' },
        { status: 429 }
      )
    }

    const { code, orderTotal } = await request.json()

    if (!code || typeof code !== 'string') {
      return NextResponse.json(
        { error: 'Code promo requis' },
        { status: 400 }
      )
    }

    const promo = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase().trim() },
    })

    if (!promo) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      )
    }

    // Verifier si le code est actif
    if (!promo.isActive) {
      return NextResponse.json(
        { error: 'Ce code promo a expire' },
        { status: 400 }
      )
    }

    // Verifier la date d'expiration
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Ce code promo a expire' },
        { status: 400 }
      )
    }

    // Verifier le nombre max d'utilisations
    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return NextResponse.json(
        { error: 'Ce code promo a atteint son nombre maximum d\'utilisations' },
        { status: 400 }
      )
    }

    // Verifier le montant minimum de commande
    if (promo.minOrder && orderTotal < promo.minOrder) {
      return NextResponse.json(
        { error: `Commande minimum de ${promo.minOrder} FCFA requise pour ce code` },
        { status: 400 }
      )
    }

    // Calculer la reduction
    let discount = 0
    if (promo.type === 'percent') {
      discount = Math.round((orderTotal * promo.discount) / 100)
    } else {
      discount = promo.discount
    }

    // Ne pas depasser le total de la commande
    discount = Math.min(discount, orderTotal)

    return NextResponse.json({
      valid: true,
      code: promo.code,
      type: promo.type,
      discount,
      discountValue: promo.discount,
      label: promo.type === 'percent'
        ? `-${promo.discount}%`
        : `-${promo.discount} FCFA`,
    })
  } catch (error) {
    console.error('Erreur validation promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
