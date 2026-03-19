import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

// GET /api/admin/stats — Statistiques du dashboard admin
export async function GET() {
  try {
    // Verification admin
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json(
        { error: 'Non autorise' },
        { status: 401 }
      )
    }

    // Debut du jour courant (minuit)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Debut de la semaine (lundi)
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1)

    // Debut du mois
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    // Executer toutes les requetes en parallele pour la performance
    const [
      todaySalesResult,
      todayOrdersCount,
      pendingOrdersCount,
      totalProductsCount,
      lowStockCount,
      recentOrders,
      ordersByStatus,
      monthSalesResult,
      weekSalesResult,
    ] = await Promise.all([
      // Chiffre d'affaires du jour (hors annulations)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
      }),

      // Nombre de commandes du jour
      prisma.order.count({
        where: { createdAt: { gte: today } },
      }),

      // Commandes en attente (a traiter)
      prisma.order.count({
        where: { status: 'PENDING' },
      }),

      // Nombre de produits actifs
      prisma.product.count({
        where: { isActive: true },
      }),

      // Produits en stock faible (< 5 unites)
      prisma.product.count({
        where: {
          isActive: true,
          stock: { lt: 5 },
        },
      }),

      // 10 dernieres commandes avec details
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: { name: true, images: true },
              },
            },
          },
        },
      }),

      // Repartition des commandes par statut
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        _sum: { total: true },
      }),

      // Chiffre d'affaires du mois (hors annulations)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfMonth },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: { id: true },
      }),

      // Chiffre d'affaires de la semaine (hors annulations)
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startOfWeek },
          status: { not: 'CANCELLED' },
        },
        _sum: { total: true },
        _count: { id: true },
      }),
    ])

    return NextResponse.json({
      // Metriques du jour
      todaySales: todaySalesResult._sum.total || 0,
      todayOrders: todayOrdersCount,

      // Metriques de la semaine
      weekSales: weekSalesResult._sum.total || 0,
      weekOrders: weekSalesResult._count.id || 0,

      // Metriques du mois
      monthSales: monthSalesResult._sum.total || 0,
      monthOrders: monthSalesResult._count.id || 0,

      // Indicateurs cles
      pendingOrders: pendingOrdersCount,
      totalProducts: totalProductsCount,
      lowStockProducts: lowStockCount,

      // Repartition par statut
      ordersByStatus: ordersByStatus.map((group) => ({
        status: group.status,
        count: group._count.id,
        total: group._sum.total || 0,
      })),

      // Dernieres commandes
      recentOrders,
    })
  } catch (error) {
    console.error('GET /api/admin/stats error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la recuperation des statistiques' },
      { status: 500 }
    )
  }
}
