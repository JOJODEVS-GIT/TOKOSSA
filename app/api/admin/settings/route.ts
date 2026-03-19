import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API admin pour les reglages du site TOKOSSA.
 * GET  : recupere tous les reglages
 * PUT  : met a jour un ou plusieurs reglages
 */

/** GET - Recuperer tous les reglages */
export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const settings = await prisma.siteSettings.findMany()
    const result: Record<string, string> = {}
    for (const s of settings) {
      result[s.key] = s.value
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('GET /api/admin/settings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** PUT - Mettre a jour les reglages (objet cle/valeur) */
export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = (await request.json()) as Record<string, string>

    // Upsert chaque paire cle/valeur
    const updates = Object.entries(body).map(([key, value]) =>
      prisma.siteSettings.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      })
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/admin/settings error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
