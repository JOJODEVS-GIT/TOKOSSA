import { NextResponse } from 'next/server'
import prisma from '@/lib/db'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * API Route : Export CSV de toutes les commandes.
 * GET retourne un fichier CSV avec les colonnes :
 * Numero, Date, Client, Telephone, Quartier, Total, Statut, Paiement
 */

/** Labels lisibles des statuts */
const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmee',
  PREPARING: 'En preparation',
  DELIVERING: 'En livraison',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
}

/** Labels lisibles des methodes de paiement */
const paymentLabels: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  MTN_MOBILE_MONEY: 'MTN MoMo',
  MOOV_MONEY: 'Moov Money',
  CELTIS_MONEY: 'Celtis',
  CASH_ON_DELIVERY: 'Cash a la livraison',
}

/** Echapper une valeur CSV (guillemets si virgule ou guillemet present) */
function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function GET() {
  try {
    const session = await requireAdmin()
    if (!session) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        createdAt: true,
        customerName: true,
        phone: true,
        quarter: true,
        total: true,
        status: true,
        paymentMethod: true,
      },
    })

    // En-tete CSV
    const header = 'Numero,Date,Client,Telephone,Quartier,Total (FCFA),Statut,Paiement'

    // Lignes CSV
    const rows = orders.map((order) => {
      const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      return [
        escapeCsv(order.orderNumber),
        escapeCsv(date),
        escapeCsv(order.customerName),
        escapeCsv(order.phone),
        escapeCsv(order.quarter),
        order.total.toString(),
        escapeCsv(statusLabels[order.status] || order.status),
        escapeCsv(paymentLabels[order.paymentMethod] || order.paymentMethod),
      ].join(',')
    })

    // Assembler le CSV avec BOM UTF-8 pour compatibilite Excel
    const bom = '\uFEFF'
    const csv = bom + header + '\n' + rows.join('\n')

    // Nom du fichier avec la date du jour
    const today = new Date().toISOString().slice(0, 10)
    const filename = `tokossa-commandes-${today}.csv`

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Erreur export CSV:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    )
  }
}
