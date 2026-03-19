export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import prisma from '@/lib/db'

/**
 * API pour les notifications de vente en temps reel (social proof).
 * Retourne les 10 dernieres notifications de vente
 * pour alimenter le composant LiveNotification.
 */
export async function GET() {
  const notifications = await prisma.saleNotification.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(notifications)
}
