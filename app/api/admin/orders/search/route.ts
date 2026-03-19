import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'
import { Prisma } from '@prisma/client'

/**
 * API admin pour rechercher et filtrer les commandes avec pagination.
 * GET : recherche avec filtres (statut, paiement, date, recherche texte) + pagination
 */

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const payment = searchParams.get('payment') || ''
    const dateRange = searchParams.get('dateRange') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Construire le filtre Prisma
    const where: Prisma.OrderWhereInput = {}

    if (status) {
      where.status = status as Prisma.EnumOrderStatusFilter
    }

    if (payment) {
      where.paymentMethod = payment as Prisma.EnumPaymentMethodFilter
    }

    // Filtre date
    if (dateRange) {
      const now = new Date()
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())

      if (dateRange === 'today') {
        where.createdAt = { gte: startOfDay }
      } else if (dateRange === 'week') {
        const startOfWeek = new Date(startOfDay)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1)
        where.createdAt = { gte: startOfWeek }
      } else if (dateRange === 'month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        where.createdAt = { gte: startOfMonth }
      }
    }

    // Recherche texte (numero, nom, telephone)
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ]
    }

    // Requetes en parallele : total + commandes paginées
    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          deliveryPerson: { select: { id: true, name: true, phone: true, zone: true } },
          items: {
            include: {
              product: { select: { name: true, images: true } },
            },
          },
        },
      }),
    ])

    // Stats rapides (toujours sur toutes les commandes, pas filtrées)
    const today = new Date()
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

    const [stats] = await Promise.all([
      prisma.order.groupBy({
        by: ['status'],
        _count: true,
        _sum: { total: true },
      }),
    ])

    const todayOrders = await prisma.order.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _sum: { total: true },
      _count: true,
    })

    return NextResponse.json({
      orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: {
        byStatus: stats,
        today: {
          count: todayOrders._count,
          revenue: todayOrders._sum.total || 0,
        },
      },
    })
  } catch (error) {
    console.error('GET /api/admin/orders/search error:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
