'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'

/**
 * Composant Client complet pour la gestion des commandes admin TOKOSSA.
 * Features : recherche, filtres (statut, paiement, date), stats KPI,
 * pagination, modal detail, assignation livreur, actions groupees,
 * boutons suppression (individuel + tout supprimer).
 */

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: { name: string; images: string[] } | null
}

interface Order {
  id: string
  orderNumber: string
  customerName: string
  phone: string
  email: string | null
  address: string
  quarter: string
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  status: string
  paymentMethod: string
  paymentRef: string | null
  paidAt: string | null
  deliveredAt: string | null
  notes: string | null
  createdAt: string
  deliveryPerson: { id: string; name: string; phone: string; zone: string } | null
}

interface DeliveryPerson {
  id: string
  name: string
  phone: string
  zone: string
  isActive: boolean
}

interface CommandesManagerProps {
  initialDeliveryPersons: DeliveryPerson[]
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PREPARING: 'bg-indigo-100 text-indigo-800',
  DELIVERING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmee',
  PREPARING: 'Preparation',
  DELIVERING: 'En livraison',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
}

const paymentLabels: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  MTN_MOBILE_MONEY: 'MTN MoMo',
  MOOV_MONEY: 'Moov Money',
  CELTIS_MONEY: 'Celtis',
  CASH_ON_DELIVERY: 'Cash',
}

const STATUS_OPTIONS = ['', 'PENDING', 'CONFIRMED', 'PREPARING', 'DELIVERING', 'DELIVERED', 'CANCELLED']
const PAYMENT_OPTIONS = ['', 'MOBILE_MONEY', 'MTN_MOBILE_MONEY', 'MOOV_MONEY', 'CELTIS_MONEY', 'CASH_ON_DELIVERY']
const DATE_OPTIONS = [
  { value: '', label: 'Toutes les dates' },
  { value: 'today', label: 'Aujourd\'hui' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
]

export default function CommandesManager({ initialDeliveryPersons }: CommandesManagerProps) {
  const router = useRouter()

  // Donnees
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [livreurs] = useState<DeliveryPerson[]>(initialDeliveryPersons)

  // Filtres
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('')
  const [dateRange, setDateRange] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Stats
  const [stats, setStats] = useState<{
    byStatus: { status: string; _count: number; _sum: { total: number | null } }[]
    today: { count: number; revenue: number }
  } | null>(null)

  // Selection & actions groupees
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState('')

  // Modal detail
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showLivreurSelect, setShowLivreurSelect] = useState<string | null>(null)

  // Suppression
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

  /** Charger les commandes avec filtres et pagination */
  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      if (paymentFilter) params.set('payment', paymentFilter)
      if (dateRange) params.set('dateRange', dateRange)
      params.set('page', String(page))
      params.set('limit', '20')

      const res = await fetch(`/api/admin/orders/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders)
        setTotalPages(data.pagination.totalPages)
        setTotal(data.pagination.total)
        setStats(data.stats)
      }
    } catch (err) {
      console.error('Erreur chargement commandes:', err)
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, paymentFilter, dateRange, page])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  // Reset page quand les filtres changent
  useEffect(() => {
    setPage(1)
  }, [search, statusFilter, paymentFilter, dateRange])

  /** Changer le statut d'une commande */
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/commandes/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        await fetchOrders()
      }
    } catch {
      console.error('Erreur changement statut')
    }
  }

  /** Action groupee */
  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return

    if (bulkAction === 'DELETE') {
      const ids = Array.from(selectedIds).join(',')
      await fetch(`/api/admin/orders/bulk?ids=${ids}`, { method: 'DELETE' })
    } else {
      await fetch('/api/admin/orders/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds), status: bulkAction }),
      })
    }

    setSelectedIds(new Set())
    setBulkAction('')
    await fetchOrders()
  }

  /** Supprimer une commande */
  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/orders/bulk?ids=${id}`, { method: 'DELETE' })
    setDeleteConfirmId(null)
    await fetchOrders()
  }

  /** Supprimer toutes les commandes */
  const handleDeleteAll = async () => {
    await fetch('/api/admin/orders/bulk', { method: 'DELETE' })
    setDeleteAllConfirm(false)
    await fetchOrders()
  }

  /** Assigner un livreur : sauvegarde en DB puis ouvre WhatsApp */
  const handleAssignLivreur = async (livreur: DeliveryPerson, order: Order) => {
    try {
      const res = await fetch(`/api/commandes/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPersonId: livreur.id }),
      })
      if (res.ok) {
        // Mettre a jour localement sans recharger
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, deliveryPerson: { id: livreur.id, name: livreur.name, phone: livreur.phone, zone: livreur.zone } }
              : o
          )
        )
      }
    } catch {
      console.error('Erreur affectation livreur')
    }

    // Ouvrir WhatsApp avec les details de livraison
    const message =
      `Bonjour ${livreur.name.split(' ')[0]}, nouvelle livraison TOKOSSA :\n` +
      `Commande: #${order.orderNumber}\n` +
      `Client: ${order.customerName}\n` +
      `Adresse: ${order.address}, ${order.quarter}\n` +
      `Tel client: ${order.phone}\n` +
      `Total: ${formatPrice(order.total)}`

    window.open(
      `https://wa.me/${livreur.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`,
      '_blank'
    )
    setShowLivreurSelect(null)
  }

  /** Désaffecter un livreur d'une commande */
  const handleUnassignLivreur = async (orderId: string) => {
    try {
      const res = await fetch(`/api/commandes/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPersonId: null }),
      })
      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, deliveryPerson: null } : o))
        )
      }
    } catch {
      console.error('Erreur désaffectation livreur')
    }
  }

  /** Toggle selection */
  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(orders.map((o) => o.id)))
    }
  }

  // Stats calculees
  const pendingCount = stats?.byStatus.find((s) => s.status === 'PENDING')?._count || 0
  const deliveringCount = stats?.byStatus.find((s) => s.status === 'DELIVERING')?._count || 0
  const todayRevenue = stats?.today.revenue || 0
  const todayCount = stats?.today.count || 0

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
          <p className="text-gray-600">{total} commande{total > 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              const params = new URLSearchParams()
              if (statusFilter) params.set('status', statusFilter)
              const url = `/api/admin/orders/export?${params}`
              const a = document.createElement('a')
              a.href = url
              a.download = ''
              a.click()
            }}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exporter CSV
          </button>
          {orders.length > 0 && (
            deleteAllConfirm ? (
              <div className="flex gap-2">
                <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">Confirmer</button>
                <button onClick={() => setDeleteAllConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Annuler</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tout supprimer
              </button>
            )
          )}
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">CA aujourd&apos;hui</p>
          <p className="text-xl font-bold text-primary-500">{formatPrice(todayRevenue)}</p>
          <p className="text-xs text-gray-400">{todayCount} commande{todayCount > 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">En attente</p>
          <p className="text-xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">En livraison</p>
          <p className="text-xl font-bold text-purple-600">{deliveringCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total filtre</p>
          <p className="text-xl font-bold text-gray-900">{total}</p>
        </div>
      </div>

      {/* Barre de recherche + filtres */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Recherche */}
          <div className="relative flex-1">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par numero, client, telephone..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Filtre statut */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Tous les statuts</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{statusLabels[s]}</option>
            ))}
          </select>

          {/* Filtre paiement */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            <option value="">Tous les paiements</option>
            {PAYMENT_OPTIONS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{paymentLabels[p]}</option>
            ))}
          </select>

          {/* Filtre date */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none"
          >
            {DATE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>{d.label}</option>
            ))}
          </select>
        </div>

        {/* Actions groupees */}
        {selectedIds.size > 0 && (
          <div className="mt-3 flex items-center gap-3 p-3 bg-primary-50 rounded-xl">
            <span className="text-sm font-medium text-primary-700">
              {selectedIds.size} selectionnee{selectedIds.size > 1 ? 's' : ''}
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-1.5 border border-primary-200 rounded-lg text-sm bg-white"
            >
              <option value="">Action groupee...</option>
              <option value="CONFIRMED">Confirmer</option>
              <option value="PREPARING">En preparation</option>
              <option value="DELIVERING">En livraison</option>
              <option value="DELIVERED">Livree</option>
              <option value="CANCELLED">Annuler</option>
              <option value="DELETE">Supprimer</option>
            </select>
            <button
              onClick={handleBulkAction}
              disabled={!bulkAction}
              className="px-4 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary-600"
            >
              Appliquer
            </button>
          </div>
        )}
      </div>

      {/* Tableau des commandes */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500 text-lg">Aucune commande trouvee</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase">
            <div className="col-span-1">
              <input type="checkbox" checked={selectedIds.size === orders.length} onChange={toggleSelectAll} className="rounded border-gray-300" />
            </div>
            <div className="col-span-2">Commande</div>
            <div className="col-span-2">Client</div>
            <div className="col-span-1">Paiement</div>
            <div className="col-span-1">Total</div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-1">Date</div>
            <div className="col-span-3">Actions</div>
          </div>

          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="px-4 py-3 lg:grid lg:grid-cols-12 lg:gap-2 lg:items-center space-y-2 lg:space-y-0 hover:bg-gray-50">
                <div className="col-span-1">
                  <input type="checkbox" checked={selectedIds.has(order.id)} onChange={() => toggleSelect(order.id)} className="rounded border-gray-300" />
                </div>

                <div className="col-span-2">
                  <button onClick={() => setSelectedOrder(order)} className="text-left">
                    <p className="font-mono text-sm font-medium text-primary-600 hover:text-primary-700">#{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items.length} article{order.items.length > 1 ? 's' : ''}</p>
                  </button>
                </div>

                <div className="col-span-2">
                  <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                  <a href={`https://wa.me/${order.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs text-green-600 hover:text-green-700">{order.phone}</a>
                </div>

                <div className="col-span-1">
                  <span className="text-xs font-medium text-gray-600">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                </div>

                <div className="col-span-1">
                  <p className="font-semibold text-gray-900 text-sm">{formatPrice(order.total)}</p>
                </div>

                <div className="col-span-1">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs font-medium rounded-lg px-2 py-1 border-0 cursor-pointer ${statusColors[order.status] || 'bg-gray-100'}`}
                  >
                    {STATUS_OPTIONS.filter(Boolean).map((s) => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-1">
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                  </p>
                </div>

                <div className="col-span-3 flex items-center gap-1 flex-wrap">
                  {/* Voir detail */}
                  <button onClick={() => setSelectedOrder(order)} className="p-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors" title="Detail">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </button>

                  {/* Assigner / changer livreur */}
                  {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                    <div className="relative">
                      {/* Badge livreur affecte ou bouton d'affectation */}
                      {order.deliveryPerson ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setShowLivreurSelect(showLivreurSelect === order.id ? null : order.id)}
                            className="flex items-center gap-1.5 px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-200 transition-colors"
                            title="Changer de livreur"
                          >
                            <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                              {order.deliveryPerson.name.charAt(0)}
                            </span>
                            {order.deliveryPerson.name.split(' ')[0]}
                          </button>
                          <button
                            onClick={() => handleUnassignLivreur(order.id)}
                            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                            title="Retirer le livreur"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowLivreurSelect(showLivreurSelect === order.id ? null : order.id)}
                          className="flex items-center gap-1.5 p-1.5 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
                          title="Affecter un livreur"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>
                          <span className="text-xs font-medium">Livreur</span>
                        </button>
                      )}

                      {/* Dropdown de sélection */}
                      {showLivreurSelect === order.id && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-20 w-60 py-2">
                          <p className="px-4 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            {order.deliveryPerson ? 'Changer le livreur' : 'Affecter un livreur'}
                          </p>
                          {livreurs.filter((l) => l.isActive).length === 0 ? (
                            <p className="px-4 py-2 text-sm text-gray-500">Aucun livreur actif</p>
                          ) : (
                            livreurs.filter((l) => l.isActive).map((l) => (
                              <button
                                key={l.id}
                                onClick={() => handleAssignLivreur(l, order)}
                                className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 flex items-center gap-3 transition-colors ${
                                  order.deliveryPerson?.id === l.id ? 'bg-purple-50' : ''
                                }`}
                              >
                                <span className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                  {l.name.charAt(0)}
                                </span>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{l.name}</p>
                                  <p className="text-xs text-gray-400">{l.zone} · {l.phone}</p>
                                </div>
                                {order.deliveryPerson?.id === l.id && (
                                  <svg className="w-4 h-4 text-purple-500 flex-shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* WhatsApp client */}
                  <a href={`https://wa.me/${order.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors" title="WhatsApp">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </a>

                  {/* Supprimer */}
                  {deleteConfirmId === order.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(order.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Oui</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Non</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(order.id)} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors" title="Supprimer">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {page} sur {totalPages} ({total} resultats)
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Precedent
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = page <= 3 ? i + 1 : page + i - 2
                  if (p < 1 || p > totalPages) return null
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`px-3 py-1.5 rounded-lg text-sm ${
                        p === page ? 'bg-primary-500 text-white' : 'bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  )
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal detail commande */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <h2 className="text-lg font-bold text-gray-900 mb-1">Commande #{selectedOrder.orderNumber}</h2>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedOrder.status]}`}>
              {statusLabels[selectedOrder.status]}
            </span>

            {/* Info client */}
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm">Client</h3>
              <div className="bg-gray-50 rounded-xl p-3 text-sm space-y-1">
                <p><span className="text-gray-500">Nom :</span> {selectedOrder.customerName}</p>
                <p><span className="text-gray-500">Tel :</span> {selectedOrder.phone}</p>
                {selectedOrder.email && <p><span className="text-gray-500">Email :</span> {selectedOrder.email}</p>}
                <p><span className="text-gray-500">Adresse :</span> {selectedOrder.address}, {selectedOrder.quarter}</p>
              </div>
            </div>

            {/* Articles */}
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-gray-700 text-sm">Articles</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                    <div>
                      <p className="text-sm font-medium">{item.product?.name || 'Produit'}</p>
                      <p className="text-xs text-gray-400">x{item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totaux */}
            <div className="mt-4 border-t pt-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(selectedOrder.subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{formatPrice(selectedOrder.deliveryFee)}</span></div>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span className="text-primary-500">{formatPrice(selectedOrder.total)}</span></div>
            </div>

            {/* Livreur affecte */}
            {selectedOrder.deliveryPerson && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-1">Livreur affecté</h3>
                <div className="bg-purple-50 rounded-xl p-3 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">
                    {selectedOrder.deliveryPerson.name.charAt(0)}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{selectedOrder.deliveryPerson.name}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.deliveryPerson.zone} · {selectedOrder.deliveryPerson.phone}</p>
                  </div>
                  <a
                    href={`https://wa.me/${selectedOrder.deliveryPerson.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  </a>
                </div>
              </div>
            )}

            {/* Paiement */}
            <div className="mt-4 text-sm space-y-1">
              <p><span className="text-gray-500">Paiement :</span> {paymentLabels[selectedOrder.paymentMethod]}</p>
              {selectedOrder.paymentRef && <p><span className="text-gray-500">Ref :</span> {selectedOrder.paymentRef}</p>}
              {selectedOrder.paidAt && <p><span className="text-gray-500">Paye le :</span> {new Date(selectedOrder.paidAt).toLocaleDateString('fr-FR')}</p>}
              {selectedOrder.deliveredAt && <p><span className="text-gray-500">Livre le :</span> {new Date(selectedOrder.deliveredAt).toLocaleDateString('fr-FR')}</p>}
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="mt-4">
                <h3 className="font-semibold text-gray-700 text-sm mb-1">Notes</h3>
                <p className="text-sm text-gray-600 bg-yellow-50 rounded-xl p-3">{selectedOrder.notes}</p>
              </div>
            )}

            {/* Timeline */}
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 text-sm mb-2">Historique</h3>
              <div className="space-y-2 text-xs text-gray-500">
                <p>Creee le {new Date(selectedOrder.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                {selectedOrder.paidAt && <p>Payee le {new Date(selectedOrder.paidAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>}
                {selectedOrder.deliveredAt && <p>Livree le {new Date(selectedOrder.deliveredAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-2">
              <a
                href={`https://wa.me/${selectedOrder.phone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium text-center hover:bg-green-600"
              >
                WhatsApp client
              </a>
              <button
                onClick={() => { setSelectedOrder(null); router.refresh() }}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
