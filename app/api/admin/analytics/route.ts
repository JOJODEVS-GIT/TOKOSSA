import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * Type des periodes acceptees par l'API analytics.
 */
type Period = 7 | 30 | 90

/**
 * Reponse typee de l'endpoint analytics.
 */
export interface AnalyticsResponse {
  revenue: number
  orders: number
  averageCart: number
  conversionRate: number
  previousRevenue: number
  previousOrders: number
  revenueVariation: number
  ordersVariation: number
  dailyRevenue: { date: string; label: string; amount: number }[]
  topProducts: { name: string; quantity: number; revenue: number }[]
  topQuarters: { name: string; orders: number; revenue: number }[]
}

/**
 * Calcule la variation en pourcentage entre deux valeurs.
 * Retourne 100 si la valeur precedente est 0 mais la valeur actuelle > 0.
 */
function calcVariation(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

/**
 * Construit un tableau de labels pour le graphique en barres.
 * - 7 jours  : label = "Lun", "Mar", ...
 * - 30 jours : label = "01/03", "02/03", ...
 * - 90 jours : label = "S1", "S2", ... (semaines)
 */
function buildDateBuckets(
  period: Period,
  now: Date,
): { date: string; label: string; amount: number }[] {
  const joursFR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  if (period === 7) {
    // Un bucket par jour sur 7 jours
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (6 - i))
      d.setHours(0, 0, 0, 0)
      return {
        date: d.toISOString().slice(0, 10),
        label: joursFR[d.getDay()] ?? '',
        amount: 0,
      }
    })
  }

  if (period === 30) {
    // Un bucket par jour sur 30 jours
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now)
      d.setDate(d.getDate() - (29 - i))
      d.setHours(0, 0, 0, 0)
      const iso = d.toISOString().slice(0, 10)
      // Label court : "01/03"
      const [, mm, dd] = iso.split('-')
      return {
        date: iso,
        label: `${dd}/${mm}`,
        amount: 0,
      }
    })
  }

  // 90 jours : un bucket par semaine (13 semaines)
  const buckets: { date: string; label: string; amount: number }[] = []
  for (let w = 12; w >= 0; w--) {
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - w * 7)
    weekStart.setHours(0, 0, 0, 0)
    buckets.push({
      date: weekStart.toISOString().slice(0, 10),
      label: `S${13 - w}`,
      amount: 0,
    })
  }
  return buckets
}

/**
 * GET /api/admin/analytics?period=7|30|90
 *
 * Retourne les analytics avances pour la periode selectionnee.
 * Necessite une session admin valide.
 */
export async function GET(req: NextRequest) {
  // Verification admin
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
  }

  // Validation du parametre period
  const url = new URL(req.url)
  const periodParam = url.searchParams.get('period')
  const validPeriods: Period[] = [7, 30, 90]
  const period: Period = validPeriods.includes(Number(periodParam) as Period)
    ? (Number(periodParam) as Period)
    : 7

  const now = new Date()

  // Bornes de la periode actuelle
  const periodStart = new Date(now)
  periodStart.setDate(periodStart.getDate() - period)
  periodStart.setHours(0, 0, 0, 0)

  // Bornes de la periode precedente (pour comparaison)
  const previousStart = new Date(periodStart)
  previousStart.setDate(previousStart.getDate() - period)
  const previousEnd = new Date(periodStart)

  // Filtre commun : exclure les commandes annulees pour le CA
  const notCancelled = { status: { not: 'CANCELLED' as const } }

  // ============================================================
  // Requetes Prisma en parallele pour minimiser la latence
  // ============================================================
  const [
    currentRevenueResult,
    currentOrdersCount,
    deliveredOrdersCount,
    previousRevenueResult,
    previousOrdersCount,
    ordersForChart,
    topProductsRaw,
    topQuartersRaw,
  ] = await Promise.all([
    // CA periode actuelle (sans annulations)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: periodStart },
        ...notCancelled,
      },
    }),

    // Nombre total de commandes sur la periode
    prisma.order.count({
      where: { createdAt: { gte: periodStart } },
    }),

    // Commandes DELIVERED sur la periode (pour taux de conversion)
    prisma.order.count({
      where: {
        createdAt: { gte: periodStart },
        status: 'DELIVERED',
      },
    }),

    // CA periode precedente
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: previousStart, lt: previousEnd },
        ...notCancelled,
      },
    }),

    // Commandes periode precedente
    prisma.order.count({
      where: {
        createdAt: { gte: previousStart, lt: previousEnd },
      },
    }),

    // Toutes les commandes de la periode pour le graphique
    prisma.order.findMany({
      where: {
        createdAt: { gte: periodStart },
        ...notCancelled,
      },
      select: { total: true, createdAt: true },
    }),

    // Top 5 produits vendus sur la periode
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true, price: true },
      where: {
        order: {
          createdAt: { gte: periodStart },
          ...notCancelled,
        },
      },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),

    // Top 5 quartiers par volume de commandes
    prisma.order.groupBy({
      by: ['quarter'],
      _count: true,
      _sum: { total: true },
      where: {
        createdAt: { gte: periodStart },
        ...notCancelled,
      },
      orderBy: { _count: { quarter: 'desc' } },
      take: 5,
    }),
  ])

  // Recuperer les noms des top produits
  const topProductIds = topProductsRaw.map((p) => p.productId)
  const topProductDetails =
    topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds } },
          select: { id: true, name: true },
        })
      : []

  // ============================================================
  // Calculs derives
  // ============================================================
  const revenue = currentRevenueResult._sum.total ?? 0
  const orders = currentOrdersCount
  const averageCart = orders > 0 ? Math.round(revenue / orders) : 0
  const conversionRate =
    orders > 0 ? Math.round((deliveredOrdersCount / orders) * 100) : 0

  const previousRevenue = previousRevenueResult._sum.total ?? 0
  const previousOrders = previousOrdersCount

  const revenueVariation = calcVariation(revenue, previousRevenue)
  const ordersVariation = calcVariation(orders, previousOrders)

  // ============================================================
  // Construction du graphique en barres
  // ============================================================
  const buckets = buildDateBuckets(period, now)

  for (const order of ordersForChart) {
    const orderDate = new Date(order.createdAt).toISOString().slice(0, 10)

    if (period === 90) {
      // Pour 90 jours : trouver le bucket semaine correspondant
      // Le bucket semaine couvre [bucketDate, bucketDate + 7 jours[
      for (let i = 0; i < buckets.length; i++) {
        const bucketStart = new Date(buckets[i]!.date)
        const bucketEnd = new Date(bucketStart)
        bucketEnd.setDate(bucketEnd.getDate() + 7)

        const orderTs = new Date(orderDate)
        if (orderTs >= bucketStart && orderTs < bucketEnd) {
          buckets[i]!.amount += order.total
          break
        }
      }
    } else {
      // Pour 7 et 30 jours : match exact sur la date
      const bucket = buckets.find((b) => b.date === orderDate)
      if (bucket) {
        bucket.amount += order.total
      }
    }
  }

  // ============================================================
  // Construction du top produits
  // ============================================================
  const topProducts = topProductsRaw.map((raw) => {
    const detail = topProductDetails.find((p) => p.id === raw.productId)
    // Le revenue par item = price (champ prix unitaire) * quantity
    // On utilise _sum.price qui est la somme de (prixUnitaire * quantite)
    return {
      name: detail?.name ?? 'Produit supprime',
      quantity: raw._sum.quantity ?? 0,
      revenue: raw._sum.price ?? 0,
    }
  })

  // ============================================================
  // Construction du top quartiers
  // ============================================================
  const topQuarters = topQuartersRaw.map((q) => ({
    name: q.quarter ?? 'Inconnu',
    orders: q._count,
    revenue: q._sum.total ?? 0,
  }))

  const response: AnalyticsResponse = {
    revenue,
    orders,
    averageCart,
    conversionRate,
    previousRevenue,
    previousOrders,
    revenueVariation,
    ordersVariation,
    dailyRevenue: buckets,
    topProducts,
    topQuarters,
  }

  return NextResponse.json(response)
}
