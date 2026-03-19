'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'

/**
 * Page admin des paniers abandonnes TOKOSSA.
 * Affiche les clients qui ont commence le checkout sans finaliser.
 * Permet de relancer par WhatsApp et de supprimer.
 */

interface AbandonedCartItem {
  productId?: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface AbandonedCart {
  id: string
  phone: string
  email: string | null
  customerName: string | null
  items: AbandonedCartItem[]
  subtotal: number
  quarter: string | null
  status: string
  remindedAt: string | null
  recoveredAt: string | null
  createdAt: string
  updatedAt: string
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  reminded_1: 'Relance 1',
  reminded_2: 'Relance 2',
  recovered: 'Recupere',
  expired: 'Expire',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  reminded_1: 'bg-blue-100 text-blue-700',
  reminded_2: 'bg-indigo-100 text-indigo-700',
  recovered: 'bg-green-100 text-green-700',
  expired: 'bg-gray-100 text-gray-500',
}

export default function PaniersAbandonnesPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

  const fetchCarts = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/abandoned-carts')
      if (res.ok) {
        const data = await res.json()
        setCarts(data)
      }
    } catch (err) {
      console.error('Erreur chargement paniers:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchCarts()
  }, [fetchCarts])

  /** Relancer un client par WhatsApp */
  const handleRelance = async (cart: AbandonedCart) => {
    const items = (cart.items as AbandonedCartItem[])
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(', ')

    const message = `Bonjour${cart.customerName ? ` ${cart.customerName}` : ''} ! Vous avez laisse des articles dans votre panier TOKOSSA : ${items} (${formatPrice(cart.subtotal)}). Finalisez votre commande maintenant !`

    const phone = cart.phone.replace(/\D/g, '')
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank')

    // Marquer comme relance
    const nextStatus = cart.status === 'pending' ? 'reminded_1' : 'reminded_2'
    try {
      const res = await fetch(`/api/admin/abandoned-carts/${cart.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (res.ok) {
        setCarts((prev) =>
          prev.map((c) => (c.id === cart.id ? { ...c, status: nextStatus } : c))
        )
      }
    } catch {
      console.error('Erreur mise a jour statut')
    }
  }

  /** Supprimer un panier */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/abandoned-carts/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setCarts((prev) => prev.filter((c) => c.id !== id))
        setDeleteConfirmId(null)
        selectedIds.delete(id)
        setSelectedIds(new Set(selectedIds))
      }
    } catch {
      console.error('Erreur suppression')
    }
  }

  /** Supprimer tous les paniers */
  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/admin/abandoned-carts', { method: 'DELETE' })
      if (res.ok) {
        setCarts([])
        setSelectedIds(new Set())
        setDeleteAllConfirm(false)
      }
    } catch {
      console.error('Erreur suppression globale')
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
    if (selectedIds.size === carts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(carts.map((c) => c.id)))
    }
  }

  /** Supprimer les selectionnes */
  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedIds)
    for (const id of ids) {
      await fetch(`/api/admin/abandoned-carts/${id}`, { method: 'DELETE' })
    }
    setCarts((prev) => prev.filter((c) => !selectedIds.has(c.id)))
    setSelectedIds(new Set())
  }

  // Stats
  const totalAmount = carts.reduce((sum, c) => sum + c.subtotal, 0)
  const pendingCount = carts.filter((c) => c.status === 'pending').length
  const recoveredCount = carts.filter((c) => c.status === 'recovered').length

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paniers abandonnes</h1>
          <p className="text-gray-600">{carts.length} panier{carts.length > 1 ? 's' : ''} abandonne{carts.length > 1 ? 's' : ''}</p>
        </div>
        {carts.length > 0 && (
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
              >
                Supprimer ({selectedIds.size})
              </button>
            )}
            {deleteAllConfirm ? (
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAll}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setDeleteAllConfirm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tout supprimer
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total paniers</p>
          <p className="text-2xl font-bold text-gray-900">{carts.length}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Montant total</p>
          <p className="text-2xl font-bold text-primary-500">{formatPrice(totalAmount)}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">A relancer</p>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-sm text-gray-500">Recuperes</p>
          <p className="text-2xl font-bold text-green-600">{recoveredCount}</p>
        </div>
      </div>

      {/* Liste des paniers */}
      {carts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
          <p className="text-gray-500 text-lg">Aucun panier abandonne</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* Header avec checkbox globale */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedIds.size === carts.length && carts.length > 0}
                onChange={toggleSelectAll}
                className="rounded border-gray-300"
              />
            </div>
            <div className="col-span-2">Client</div>
            <div className="col-span-3">Articles</div>
            <div className="col-span-1">Montant</div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Actions</div>
          </div>

          <div className="divide-y">
            {carts.map((cart) => {
              const items = cart.items as AbandonedCartItem[]

              return (
                <div
                  key={cart.id}
                  className="px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0"
                >
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(cart.id)}
                      onChange={() => toggleSelect(cart.id)}
                      className="rounded border-gray-300"
                    />
                  </div>

                  <div className="col-span-2">
                    <p className="font-medium text-gray-900 text-sm">{cart.customerName || 'Anonyme'}</p>
                    <p className="text-xs text-gray-400">{cart.phone}</p>
                  </div>

                  <div className="col-span-3">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="col-span-1">
                    <p className="font-semibold text-gray-900">{formatPrice(cart.subtotal)}</p>
                  </div>

                  <div className="col-span-1">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusColors[cart.status] || 'bg-gray-100 text-gray-500'}`}>
                      {statusLabels[cart.status] || cart.status}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">
                      {new Date(cart.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center gap-2">
                    {cart.status !== 'recovered' && cart.status !== 'expired' && (
                      <button
                        onClick={() => handleRelance(cart)}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                        title="Relancer par WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                        </svg>
                      </button>
                    )}

                    {deleteConfirmId === cart.id ? (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleDelete(cart.id)}
                          className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                        >
                          Oui
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          Non
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(cart.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
