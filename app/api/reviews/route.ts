import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { checkRateLimit, getClientIP, RATE_LIMIT_REVIEWS } from '@/lib/rate-limit'
import { isValidBeninPhone } from '@/lib/utils'

/**
 * GET /api/reviews?productId=xxx
 * Retourne les avis verifies pour un produit.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const productId = searchParams.get('productId')

  if (!productId) {
    return NextResponse.json({ error: 'productId requis' }, { status: 400 })
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId, isVerified: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        rating: true,
        comment: true,
        createdAt: true,
      },
    })

    // Calculer la moyenne
    const avg = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      reviews,
      average: Math.round(avg * 10) / 10,
      count: reviews.length,
    })
  } catch (error) {
    console.error('Erreur reviews:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/**
 * POST /api/reviews
 * Soumettre un nouvel avis (sera verifie par l'admin avant publication).
 * Body: { productId, phone, name, rating, comment }
 */
export async function POST(request: Request) {
  try {
    // SECURITE : Rate limiting — max 3 avis par minute par IP
    const clientIP = getClientIP(request)
    if (!(await checkRateLimit(clientIP, 'reviews', RATE_LIMIT_REVIEWS))) {
      return NextResponse.json(
        { error: 'Trop de requetes. Reessayez dans une minute.' },
        { status: 429 }
      )
    }

    const { productId, phone, name, rating, comment } = await request.json()

    if (!productId || !phone || !name || !rating || !comment) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      )
    }

    // SECURITE : Valider le telephone
    if (!isValidBeninPhone(phone)) {
      return NextResponse.json(
        { error: 'Numero de telephone invalide' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'La note doit etre entre 1 et 5' },
        { status: 400 }
      )
    }

    // SECURITE : Sanitizer le nom et le commentaire
    const safeName = typeof name === 'string' ? name.trim().slice(0, 100) : ''
    const safeComment = typeof comment === 'string' ? comment.trim().slice(0, 500) : ''

    if (!safeName || !safeComment) {
      return NextResponse.json(
        { error: 'Nom et commentaire requis' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        phone,
        name: safeName,
        rating: Math.round(rating),
        comment: safeComment,
        isVerified: false, // En attente de moderation
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Merci pour votre avis ! Il sera publie apres verification.',
      id: review.id,
    })
  } catch (error) {
    console.error('Erreur creation review:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
