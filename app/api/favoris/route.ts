// API Favoris — TOKOSSA
// Gestion des favoris persistés en base de données par numéro de téléphone.
// Synchronise avec le store Zustand côté client.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// Sélection des champs produit pour éviter de charger des données inutiles
const productSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  oldPrice: true,
  images: true,
  stock: true,
  category: true,
} as const

// GET /api/favoris?phone=xxx
// Retourne tous les favoris d'un client avec les détails produit
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const phone = searchParams.get('phone')

  if (!phone || phone.trim().length < 8) {
    return NextResponse.json(
      { error: 'Paramètre phone requis (minimum 8 caractères)' },
      { status: 400 }
    )
  }

  try {
    const favoris = await prisma.favorite.findMany({
      where: { phone: phone.trim() },
      include: {
        product: {
          select: productSelect,
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      favoris,
      count: favoris.length,
    })
  } catch (error) {
    console.error('[API Favoris GET] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des favoris' },
      { status: 500 }
    )
  }
}

// POST /api/favoris
// Ajoute un favori (upsert pour éviter les doublons)
export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corps de la requête JSON invalide' },
      { status: 400 }
    )
  }

  const { phone, productId } = body as { phone?: string; productId?: string }

  if (!phone || phone.trim().length < 8 || !productId) {
    return NextResponse.json(
      { error: 'phone et productId requis' },
      { status: 400 }
    )
  }

  try {
    // Vérifier que le produit existe et est actif
    const produit = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, isActive: true },
    })

    if (!produit) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    // Upsert : crée si absent, ne fait rien si déjà présent
    const favori = await prisma.favorite.upsert({
      where: {
        phone_productId: { phone, productId },
      },
      create: { phone, productId },
      update: {}, // Rien à mettre à jour, on veut juste s'assurer qu'il existe
      include: {
        product: { select: productSelect },
      },
    })

    return NextResponse.json({ favori }, { status: 201 })
  } catch (error) {
    console.error('[API Favoris POST] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de l\'ajout du favori' },
      { status: 500 }
    )
  }
}

// DELETE /api/favoris
// Supprime un favori spécifique (phone + productId)
export async function DELETE(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Corps de la requête JSON invalide' },
      { status: 400 }
    )
  }

  const { phone, productId } = body as { phone?: string; productId?: string }

  if (!phone || !productId) {
    return NextResponse.json(
      { error: 'phone et productId requis' },
      { status: 400 }
    )
  }

  try {
    await prisma.favorite.delete({
      where: {
        phone_productId: { phone, productId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    // P2025 = enregistrement introuvable dans Prisma
    if (
      error !== null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'P2025'
    ) {
      return NextResponse.json(
        { error: 'Favori introuvable' },
        { status: 404 }
      )
    }

    console.error('[API Favoris DELETE] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du favori' },
      { status: 500 }
    )
  }
}
