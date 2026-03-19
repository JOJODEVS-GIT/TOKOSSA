import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import prisma from '@/lib/db'

/**
 * GET /api/admin/orders/export
 * Exporte les commandes en CSV pour comptabilité / logistique.
 * Params optionnels : status, dateFrom, dateTo
 */
export async function GET(request: NextRequest) {
  const session = await requireAdmin()
  if (!session) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || undefined
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const where: Record<string, unknown> = {}
  if (status && status !== 'ALL') where.status = status
  if (dateFrom || dateTo) {
    where.createdAt = {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo + 'T23:59:59Z') } : {}),
    }
  }

  const orders = await prisma.order.findMany({
    where,
    select: {
      orderNumber: true,
      createdAt: true,
      customerName: true,
      phone: true,
      email: true,
      address: true,
      quarter: true,
      status: true,
      paymentMethod: true,
      paymentRef: true,
      subtotal: true,
      deliveryFee: true,
      total: true,
      paidAt: true,
      deliveredAt: true,
      notes: true,
      deliveryPerson: { select: { name: true, phone: true } },
      items: {
        select: {
          quantity: true,
          price: true,
          product: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 5000,
  })

  // Statuts lisibles
  const statusLabels: Record<string, string> = {
    PENDING: 'En attente',
    CONFIRMED: 'Confirmée',
    PREPARING: 'En préparation',
    DELIVERING: 'En livraison',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
  }

  const paymentLabels: Record<string, string> = {
    MOBILE_MONEY: 'Mobile Money',
    MTN_MOBILE_MONEY: 'MTN Mobile Money',
    MOOV_MONEY: 'Moov Money',
    CELTIS_MONEY: 'Celtis Money',
    CASH_ON_DELIVERY: 'Cash à la livraison',
  }

  // En-têtes CSV
  const headers = [
    'N° Commande',
    'Date',
    'Client',
    'Téléphone',
    'Email',
    'Adresse',
    'Quartier',
    'Statut',
    'Paiement',
    'Réf. Paiement',
    'Sous-total (FCFA)',
    'Livraison (FCFA)',
    'Total (FCFA)',
    'Payé le',
    'Livré le',
    'Livreur',
    'Tel Livreur',
    'Produits',
    'Notes',
  ]

  const formatDate = (d: Date | null | undefined) =>
    d ? new Date(d).toLocaleDateString('fr-FR') : ''

  const escapeCSV = (val: string | null | undefined) => {
    if (!val) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const rows = orders.map((o) => {
    const products = o.items
      .map((i) => `${i.product?.name ?? '?'} x${i.quantity}`)
      .join(' | ')

    return [
      o.orderNumber,
      formatDate(o.createdAt),
      o.customerName,
      o.phone,
      o.email ?? '',
      o.address,
      o.quarter,
      statusLabels[o.status] ?? o.status,
      paymentLabels[o.paymentMethod] ?? o.paymentMethod,
      o.paymentRef ?? '',
      o.subtotal,
      o.deliveryFee,
      o.total,
      formatDate(o.paidAt),
      formatDate(o.deliveredAt),
      o.deliveryPerson?.name ?? '',
      o.deliveryPerson?.phone ?? '',
      products,
      o.notes ?? '',
    ]
      .map((v) => escapeCSV(String(v)))
      .join(',')
  })

  const csv = [headers.join(','), ...rows].join('\r\n')
  const today = new Date().toISOString().slice(0, 10)
  const filename = `tokossa-commandes-${today}.csv`

  return new NextResponse('\uFEFF' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
