import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { isValidBeninPhone } from '@/lib/utils'

/**
 * POST /api/loyalty/redeem
 * Verifier et preparer une reduction de points (sans debiter).
 * Le debit reel se fait dans POST /api/commandes cote serveur.
 * Body: { phone, pointsToRedeem }
 * Regles : minimum 500 points, 1 point = 1 FCFA
 */
export async function POST(request: Request) {
  try {
    const { phone, pointsToRedeem } = await request.json()

    if (!phone || !pointsToRedeem) {
      return NextResponse.json({ error: 'Donnees manquantes' }, { status: 400 })
    }

    // SECURITE : Valider le format du telephone
    if (!isValidBeninPhone(phone)) {
      return NextResponse.json(
        { error: 'Numero de telephone invalide' },
        { status: 400 }
      )
    }

    // SECURITE : Valider pointsToRedeem est un entier positif
    const points = Math.floor(Number(pointsToRedeem))
    if (!Number.isFinite(points) || points <= 0) {
      return NextResponse.json(
        { error: 'Nombre de points invalide' },
        { status: 400 }
      )
    }

    if (points < 500) {
      return NextResponse.json(
        { error: 'Minimum 500 points pour utiliser vos points' },
        { status: 400 }
      )
    }

    // SECURITE : Limiter le nombre de points max par redemption
    if (points > 50000) {
      return NextResponse.json(
        { error: 'Maximum 50 000 points par utilisation' },
        { status: 400 }
      )
    }

    // Verifier le solde
    const user = await prisma.user.findUnique({
      where: { phone },
      select: { id: true, loyaltyPoints: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'Client introuvable' }, { status: 404 })
    }

    if (user.loyaltyPoints < points) {
      return NextResponse.json(
        { error: `Solde insuffisant. Vous avez ${user.loyaltyPoints} points.` },
        { status: 400 }
      )
    }

    // SECURITE : Ne PAS debiter ici. Le debit se fait dans /api/commandes
    // On retourne seulement le discount disponible pour que le frontend l'affiche
    const discount = points

    return NextResponse.json({
      discount,
      pointsToUse: points,
      remainingPoints: user.loyaltyPoints - points,
    })
  } catch (error) {
    console.error('Loyalty redeem error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
