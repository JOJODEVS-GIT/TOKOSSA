export const dynamic = 'force-dynamic'

import Link from 'next/link'
import dynamicImport from 'next/dynamic'
import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import StockAlertButton from '@/components/admin/StockAlertButton'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * Chargement dynamique du panneau analytics avances.
 * Evite d'alourdir le bundle initial du dashboard — charge en parallele apres le rendu serveur.
 */
const AnalyticsPanel = dynamicImport(
  () => import('@/components/admin/AnalyticsPanel'),
  {
    loading: () => (
      <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-48 mb-2" />
        <div className="h-3 bg-gray-200 rounded w-72 mb-6" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-24" />
          ))}
        </div>
        <div className="h-48 bg-gray-100 rounded-xl" />
      </div>
    ),
    ssr: false,
  }
)

/**
 * Dashboard admin TOKOSSA - Analytics complet.
 * Server Component qui recupere les stats depuis Prisma :
 * - Chiffre d'affaires (jour, semaine, mois)
 * - Commandes du jour, en attente, clients total
 * - Top 5 produits les plus vendus avec barres de progression
 * - 5 dernieres commandes
 * - Alertes stock bas
 */

/** Couleurs de badges par statut de commande */
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-indigo-100 text-indigo-800',
  DELIVERING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

/** Labels lisibles par statut */
const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmee',
  PREPARING: 'Preparation',
  DELIVERING: 'En livraison',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
}

export default async function DashboardPage() {
  const session = await requireAdmin()
  if (!session) redirect('/login')

  // Calcul des bornes temporelles
  const now = new Date()

  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // Debut de la semaine (lundi)
  const weekStart = new Date(now)
  const dayOfWeek = weekStart.getDay()
  const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  weekStart.setDate(weekStart.getDate() - diffToMonday)
  weekStart.setHours(0, 0, 0, 0)

  // Debut du mois
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  // Filtre commun : exclure les commandes annulees pour les stats de CA
  const notCancelled = { status: { not: 'CANCELLED' as const } }

  // Calcul des bornes pour les 7 derniers jours (graphique CA)
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  sevenDaysAgo.setHours(0, 0, 0, 0)

  // Semaine precedente (pour comparaison)
  const lastWeekStart = new Date(weekStart)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeekEnd = new Date(weekStart)

  // Requetes Prisma en parallele
  const [
    todaySalesResult,
    weekSalesResult,
    monthSalesResult,
    todayOrdersCount,
    pendingOrdersCount,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    topProductsRaw,
    last7DaysOrders,
    statusCounts,
    lastWeekSalesResult,
    topQuartiersRaw,
  ] = await Promise.all([
    // CA du jour
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: todayStart }, ...notCancelled },
    }),
    // CA de la semaine
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: weekStart }, ...notCancelled },
    }),
    // CA du mois
    prisma.order.aggregate({
      _sum: { total: true },
      where: { createdAt: { gte: monthStart }, ...notCancelled },
    }),
    // Nombre de commandes du jour
    prisma.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // Commandes en attente
    prisma.order.count({
      where: { status: 'PENDING' },
    }),
    // Nombre total de clients uniques
    prisma.user.count({
      where: { role: 'customer' },
    }),
    // 5 commandes les plus recentes
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: { select: { name: true, images: true } },
          },
        },
      },
    }),
    // Produits avec stock bas (< 5)
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: 5 } },
      select: { id: true, name: true, stock: true, slug: true },
      orderBy: { stock: 'asc' },
    }),
    // Top 5 produits les plus vendus (groupBy sur OrderItem)
    prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
    // Commandes des 7 derniers jours pour le graphique CA
    prisma.order.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
        ...notCancelled,
      },
      select: { total: true, createdAt: true },
    }),
    // Repartition des statuts de commande
    prisma.order.groupBy({
      by: ['status'],
      _count: { status: true },
    }),
    // CA semaine precedente (comparaison)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        createdAt: { gte: lastWeekStart, lt: lastWeekEnd },
        ...notCancelled,
      },
    }),
    // Top quartiers de livraison
    prisma.order.groupBy({
      by: ['quarter'],
      _count: true,
      _sum: { total: true },
      where: notCancelled,
      orderBy: { _count: { quarter: 'desc' } },
      take: 5,
    }),
  ])

  const todaySales = todaySalesResult._sum.total ?? 0
  const weekSales = weekSalesResult._sum.total ?? 0
  const monthSales = monthSalesResult._sum.total ?? 0
  const lastWeekSales = lastWeekSalesResult._sum.total ?? 0

  // Calcul variation semaine
  const weekVariation = lastWeekSales > 0
    ? Math.round(((weekSales - lastWeekSales) / lastWeekSales) * 100)
    : weekSales > 0 ? 100 : 0

  // Top quartiers
  const topQuartiers = topQuartiersRaw.map((q) => ({
    quarter: q.quarter,
    orders: q._count,
    revenue: q._sum.total ?? 0,
  }))

  // Recuperer les details des top produits
  const topProductIds = topProductsRaw.map((p) => p.productId)
  const topProductDetails = topProductIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topProductIds } },
        select: { id: true, name: true, images: true, price: true },
      })
    : []

  // Fusionner les quantites avec les details produits
  const topProducts = topProductsRaw.map((raw) => {
    const detail = topProductDetails.find((p) => p.id === raw.productId)
    return {
      id: raw.productId,
      name: detail?.name ?? 'Produit supprime',
      image: detail?.images?.[0] ?? null,
      price: detail?.price ?? 0,
      totalSold: raw._sum.quantity ?? 0,
    }
  })

  // Valeur max pour les barres de progression
  const maxSold = topProducts.length > 0 ? topProducts[0].totalSold : 1

  // ==============================
  // Graphique CA des 7 derniers jours
  // ==============================
  const joursFR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']

  // Initialiser les 7 jours avec CA = 0
  const dailyCA: { label: string; date: string; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const dateKey = d.toISOString().slice(0, 10)
    dailyCA.push({
      label: joursFR[d.getDay()] ?? '',
      date: dateKey,
      total: 0,
    })
  }

  // Remplir avec les donnees reelles
  for (const order of last7DaysOrders) {
    const dateKey = new Date(order.createdAt).toISOString().slice(0, 10)
    const dayEntry = dailyCA.find((d) => d.date === dateKey)
    if (dayEntry) {
      dayEntry.total += order.total
    }
  }

  const maxDailyCA = Math.max(...dailyCA.map((d) => d.total), 1)

  // ==============================
  // Repartition des statuts de commande
  // ==============================
  const allStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED'] as const

  const statusBarColors: Record<string, string> = {
    PENDING: 'bg-yellow-400',
    CONFIRMED: 'bg-blue-500',
    PREPARING: 'bg-indigo-500',
    DELIVERING: 'bg-purple-500',
    DELIVERED: 'bg-green-500',
    CANCELLED: 'bg-red-500',
  }

  const totalOrders = statusCounts.reduce((acc, s) => acc + s._count.status, 0)

  const statusDistribution = allStatuses.map((status) => {
    const found = statusCounts.find((s) => s.status === status)
    const count = found ? found._count.status : 0
    const percentage = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0
    return {
      status,
      label: statusLabels[status] ?? status,
      count,
      percentage,
      colorClass: statusBarColors[status] ?? 'bg-gray-400',
    }
  })

  return (
    <div className="space-y-8">
      {/* En-tete */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bienvenue sur TOKOSSA Admin</p>
      </div>

      {/* Alertes stock bas */}
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="font-semibold text-red-800">Alertes Stock ({lowStockProducts.length})</h2>
            </div>
            <StockAlertButton />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {lowStockProducts.map((p) => (
              <Link
                key={p.id}
                href={`/dashboard/produits/${p.id}`}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
                  p.stock <= 2
                    ? 'bg-red-100 border-red-300 hover:bg-red-200'
                    : 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                }`}
              >
                <span className="text-sm font-medium text-gray-800 truncate mr-2">{p.name}</span>
                <span className={`text-sm font-bold flex-shrink-0 ${
                  p.stock <= 2 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {p.stock === 0 ? 'Rupture !' : `${p.stock} restant${p.stock > 1 ? 's' : ''}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Cartes statistiques principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CA du jour */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">CA aujourd&apos;hui</p>
          <p className="text-xl font-bold text-primary-500 mt-1">
            {formatPrice(todaySales)}
          </p>
        </div>

        {/* Commandes du jour */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Commandes aujourd&apos;hui</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{todayOrdersCount}</p>
        </div>

        {/* Commandes en attente */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">En attente</p>
          <p className="text-xl font-bold text-yellow-600 mt-1">{pendingOrdersCount}</p>
        </div>

        {/* Total clients */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Clients total</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{totalCustomers}</p>
        </div>
      </div>

      {/* CA Semaine et Mois */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">CA cette semaine</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(weekSales)}</p>
              <p className="text-xs text-white/70 mt-1">
                {weekVariation >= 0 ? '+' : ''}{weekVariation}% vs semaine derniere
                {lastWeekSales > 0 && ` (${formatPrice(lastWeekSales)})`}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              {weekVariation >= 0 ? (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/80">CA ce mois</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(monthSales)}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graphique CA des 7 derniers jours - Barres verticales CSS */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">CA des 7 derniers jours</h2>
          <p className="text-sm text-gray-500 mb-6">Chiffre d&apos;affaires quotidien</p>

          {maxDailyCA <= 1 ? (
            <p className="text-center text-gray-400 py-8">Aucune donnee pour cette periode</p>
          ) : (
            <div className="flex items-end justify-between gap-2" style={{ height: '200px' }}>
              {dailyCA.map((day) => {
                const heightPercent = maxDailyCA > 0 ? (day.total / maxDailyCA) * 100 : 0
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    {/* Valeur au-dessus */}
                    <span className="text-xs font-medium text-gray-600 whitespace-nowrap">
                      {day.total > 0 ? formatPrice(day.total) : '-'}
                    </span>
                    {/* Barre */}
                    <div className="w-full flex items-end" style={{ height: '160px' }}>
                      <div
                        className="w-full rounded-t-lg"
                        style={{
                          height: `${Math.max(heightPercent, 2)}%`,
                          background: 'linear-gradient(to top, #f97316, #fb923c)',
                        }}
                      />
                    </div>
                    {/* Label jour */}
                    <span className="text-xs font-medium text-gray-500">{day.label}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Repartition des statuts de commande - Barres horizontales CSS */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Repartition des commandes</h2>
          <p className="text-sm text-gray-500 mb-6">{totalOrders} commande{totalOrders > 1 ? 's' : ''} au total</p>

          {totalOrders === 0 ? (
            <p className="text-center text-gray-400 py-8">Aucune commande pour le moment</p>
          ) : (
            <div className="space-y-3">
              {statusDistribution.map((s) => (
                <div key={s.status}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{s.label}</span>
                    <span className="text-sm text-gray-500">
                      {s.count} ({s.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${s.colorClass} transition-all`}
                      style={{ width: `${Math.max(s.percentage, s.count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top quartiers de livraison */}
      {topQuartiers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Top quartiers</h2>
          <p className="text-sm text-gray-500 mb-4">Zones les plus actives</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topQuartiers.map((q, i) => (
              <div key={q.quarter} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-bold text-gray-300">#{i + 1}</span>
                  <p className="font-medium text-gray-900 text-sm">{q.quarter}</p>
                </div>
                <p className="text-xs text-gray-500">{q.orders} commande{q.orders > 1 ? 's' : ''}</p>
                <p className="text-sm font-semibold text-primary-500">{formatPrice(q.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top 5 produits les plus vendus */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Produits les plus vendus</h2>
          <p className="text-sm text-gray-500 mt-1">Top 5 par quantite vendue</p>
        </div>

        <div className="p-6">
          {topProducts.length === 0 ? (
            <p className="text-center text-gray-500 py-4">Aucune vente pour le moment</p>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product, index) => {
                const percentage = maxSold > 0 ? (product.totalSold / maxSold) * 100 : 0
                // Couleurs alternees pour les barres
                const barColors = [
                  'bg-primary-500',
                  'bg-blue-500',
                  'bg-green-500',
                  'bg-yellow-500',
                  'bg-purple-500',
                ]
                return (
                  <div key={product.id} className="flex items-center gap-4">
                    {/* Rang */}
                    <span className="text-lg font-bold text-gray-300 w-6 text-right flex-shrink-0">
                      {index + 1}
                    </span>

                    {/* Image miniature */}
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Nom + barre de progression */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                        <span className="text-sm font-semibold text-gray-600 ml-2 flex-shrink-0">
                          {product.totalSold} vendu{product.totalSold > 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${barColors[index] ?? 'bg-gray-400'} transition-all`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Commandes recentes (5 dernieres) */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Commandes recentes</h2>
          <Link
            href="/dashboard/commandes"
            className="text-sm text-primary-500 hover:text-primary-600"
          >
            Voir tout &rarr;
          </Link>
        </div>

        <div className="divide-y">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Aucune commande pour le moment
            </div>
          ) : (
            recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/commandes?status=${order.status}`}
                className="p-4 sm:p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900 truncate">{order.customerName}</p>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                        statusColors[order.status] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    #{order.orderNumber} &middot; {order.items.length} article{order.items.length > 1 ? 's' : ''} &middot;{' '}
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <p className="font-semibold text-gray-900 ml-4 flex-shrink-0">
                  {formatPrice(order.total)}
                </p>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Analytics avances — chargement dynamique (Client Component) */}
      <AnalyticsPanel />

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/produits/nouveau"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Ajouter un produit</p>
            <p className="text-sm text-gray-500">Creer un nouveau produit</p>
          </div>
        </Link>

        <Link
          href="/dashboard/commandes?status=PENDING"
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Commandes en attente</p>
            <p className="text-sm text-gray-500">{pendingOrdersCount} commande{pendingOrdersCount > 1 ? 's' : ''} a traiter</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
