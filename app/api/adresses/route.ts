// API Adresses — TOKOSSA
// Gestion des adresses de livraison multi-adresses par numéro de téléphone.
// Permet aux clients de sauvegarder domicile, bureau, etc.

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'

// GET /api/adresses?phone=xxx
// Retourne toutes les adresses d'un client, par défaut d'abord
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
    const adresses = await prisma.address.findMany({
      where: { phone: phone.trim() },
      orderBy: [
        { isDefault: 'desc' }, // L'adresse par défaut en premier
        { createdAt: 'desc' },
      ],
    })

    return NextResponse.json({
      adresses,
      count: adresses.length,
    })
  } catch (error) {
    console.error('[API Adresses GET] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la récupération des adresses' },
      { status: 500 }
    )
  }
}

// POST /api/adresses
// Crée une nouvelle adresse. Si isDefault = true, désactive les autres adresses par défaut.
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

  const { phone, label, address, quarter, isDefault } = body as {
    phone?: string; label?: string; address?: string; quarter?: string; isDefault?: boolean
  }

  if (!phone || phone.trim().length < 8 || !address || !quarter) {
    return NextResponse.json(
      { error: 'phone, address et quarter requis' },
      { status: 400 }
    )
  }

  try {
    // Vérifier la limite : max 5 adresses par client
    const compteAdresses = await prisma.address.count({
      where: { phone },
    })

    if (compteAdresses >= 5) {
      return NextResponse.json(
        { error: 'Limite de 5 adresses atteinte. Supprimez une adresse pour en ajouter une nouvelle.' },
        { status: 422 }
      )
    }

    // Si cette adresse est définie comme défaut, ou si c'est la première adresse du client,
    // on désactive toutes les autres adresses par défaut pour ce téléphone.
    const estDefaut = isDefault || compteAdresses === 0

    if (estDefaut) {
      await prisma.address.updateMany({
        where: { phone },
        data: { isDefault: false },
      })
    }

    const nouvelleAdresse = await prisma.address.create({
      data: {
        phone,
        label: label || 'Domicile',
        address,
        quarter,
        isDefault: estDefaut,
      },
    })

    return NextResponse.json({ adresse: nouvelleAdresse }, { status: 201 })
  } catch (error) {
    console.error('[API Adresses POST] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de l\'adresse' },
      { status: 500 }
    )
  }
}

// DELETE /api/adresses?id=xxx&phone=xxx
// Supprime une adresse. Si c'était l'adresse par défaut, la plus récente devient défaut.
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const phone = searchParams.get('phone')

  if (!id || !phone) {
    return NextResponse.json(
      { error: 'Paramètres id et phone requis' },
      { status: 400 }
    )
  }

  if (phone.trim().length < 8) {
    return NextResponse.json(
      { error: 'Numéro de téléphone invalide' },
      { status: 400 }
    )
  }

  try {
    // Vérifier que l'adresse appartient bien à ce client (sécurité)
    const adresse = await prisma.address.findFirst({
      where: { id, phone: phone.trim() },
    })

    if (!adresse) {
      return NextResponse.json(
        { error: 'Adresse introuvable ou non autorisée' },
        { status: 404 }
      )
    }

    await prisma.address.delete({
      where: { id },
    })

    // Si l'adresse supprimée était celle par défaut,
    // on définit la plus récente des adresses restantes comme défaut
    if (adresse.isDefault) {
      const prochaineAdresse = await prisma.address.findFirst({
        where: { phone: phone.trim() },
        orderBy: { createdAt: 'desc' },
      })

      if (prochaineAdresse) {
        await prisma.address.update({
          where: { id: prochaineAdresse.id },
          data: { isDefault: true },
        })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API Adresses DELETE] Erreur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression de l\'adresse' },
      { status: 500 }
    )
  }
}
