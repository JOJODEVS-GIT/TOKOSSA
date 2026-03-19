export const dynamic = 'force-dynamic'

import prisma from '@/lib/db'
import { formatPrice, generateWhatsAppLink } from '@/lib/utils'

/**
 * Page de gestion des clients admin TOKOSSA.
 * Server Component async qui regroupe les commandes par telephone/nom
 * pour afficher la liste des clients avec leur nombre de commandes
 * et total depense. Tri par total depense decroissant.
 */

/** Type pour un client agrege depuis les commandes */
interface ClientRow {
  phone: string
  customerName: string
  orderCount: number
  totalSpent: number
  lastOrderDate: Date
}

export default async function ClientsPage() {
  // Recuperer toutes les commandes non annulees avec les infos client
  const orders = await prisma.order.findMany({
    where: {
      status: { not: 'CANCELLED' },
    },
    select: {
      phone: true,
      customerName: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  // Agreger par telephone pour obtenir la liste des clients
  const clientsMap = new Map<string, ClientRow>()

  for (const order of orders) {
    const existing = clientsMap.get(order.phone)
    if (existing) {
      existing.orderCount += 1
      existing.totalSpent += order.total
      // Garder le nom le plus recent
      if (order.createdAt > existing.lastOrderDate) {
        existing.customerName = order.customerName
        existing.lastOrderDate = order.createdAt
      }
    } else {
      clientsMap.set(order.phone, {
        phone: order.phone,
        customerName: order.customerName,
        orderCount: 1,
        totalSpent: order.total,
        lastOrderDate: order.createdAt,
      })
    }
  }

  // Convertir en tableau et trier par total depense decroissant
  const clients = Array.from(clientsMap.values()).sort(
    (a, b) => b.totalSpent - a.totalSpent
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
        <p className="text-gray-600">{clients.length} client{clients.length > 1 ? 's' : ''} identifies</p>
      </div>

      {/* Liste des clients */}
      {clients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-gray-500 text-lg">Aucun client pour le moment</p>
          <p className="text-gray-400 text-sm mt-2">
            Les clients apparaitront ici apres leur premiere commande
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* En-tete (desktop) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-3">Client</div>
            <div className="col-span-3">Telephone</div>
            <div className="col-span-2">Commandes</div>
            <div className="col-span-2">Total depense</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Lignes clients */}
          <div className="divide-y">
            {clients.map((client) => (
              <div
                key={client.phone}
                className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0"
              >
                {/* Nom et avatar initiale */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm flex-shrink-0">
                    {client.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{client.customerName}</p>
                    <p className="text-xs text-gray-400">
                      Derniere commande :{' '}
                      {client.lastOrderDate.toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {/* Telephone */}
                <div className="col-span-3">
                  <p className="text-sm text-gray-700">{client.phone}</p>
                </div>

                {/* Nombre de commandes */}
                <div className="col-span-2">
                  <span className="inline-flex px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                    {client.orderCount} commande{client.orderCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Total depense */}
                <div className="col-span-2">
                  <p className="font-semibold text-gray-900">{formatPrice(client.totalSpent)}</p>
                </div>

                {/* Actions */}
                <div className="col-span-2">
                  <a
                    href={generateWhatsAppLink(
                      client.phone,
                      `Bonjour ${client.customerName.split(' ')[0]}, nous vous contactons depuis TOKOSSA.`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
