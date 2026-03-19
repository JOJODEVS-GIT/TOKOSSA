'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'

/**
 * Page admin des demandes de retour TOKOSSA.
 * Permet de gerer les retours : approuver, refuser, rembourser, supprimer.
 */

interface ReturnRequest {
  id: string
  orderId: string
  reason: string
  description: string | null
  status: string
  createdAt: string
  updatedAt: string
  order: {
    orderNumber: string
    customerName: string
    phone: string
    total: number
  }
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  approved: 'Approuve',
  rejected: 'Refuse',
  refunded: 'Rembourse',
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  refunded: 'bg-blue-100 text-blue-700',
}

const reasonLabels: Record<string, string> = {
  defectueux: 'Produit defectueux',
  ne_correspond_pas: 'Ne correspond pas',
  autre: 'Autre raison',
}

export default function RetoursPage() {
  const [returns, setReturns] = useState<ReturnRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('tous')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

  const fetchReturns = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/returns')
      if (res.ok) {
        const data = await res.json()
        setReturns(data)
      }
    } catch (err) {
      console.error('Erreur chargement retours:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchReturns()
  }, [fetchReturns])

  /** Changer le statut d'une demande */
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/returns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setReturns((prev) =>
          prev.map((r) => (r.id === id ? { ...r, ...updated } : r))
        )
      }
    } catch {
      console.error('Erreur changement statut')
    }
  }

  /** Supprimer une demande */
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/returns/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setReturns((prev) => prev.filter((r) => r.id !== id))
        setDeleteConfirmId(null)
      }
    } catch {
      console.error('Erreur suppression')
    }
  }

  /** Supprimer toutes les demandes */
  const handleDeleteAll = async () => {
    try {
      const res = await fetch('/api/admin/returns', { method: 'DELETE' })
      if (res.ok) {
        setReturns([])
        setDeleteAllConfirm(false)
      }
    } catch {
      console.error('Erreur suppression globale')
    }
  }

  const filteredReturns = returns.filter((r) => {
    if (filter === 'tous') return true
    return r.status === filter
  })

  const counts = {
    tous: returns.length,
    pending: returns.filter((r) => r.status === 'pending').length,
    approved: returns.filter((r) => r.status === 'approved').length,
    rejected: returns.filter((r) => r.status === 'rejected').length,
    refunded: returns.filter((r) => r.status === 'refunded').length,
  }

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
          <h1 className="text-2xl font-bold text-gray-900">Retours & Reclamations</h1>
          <p className="text-gray-600">{counts.pending} demande{counts.pending > 1 ? 's' : ''} en attente</p>
        </div>
        {returns.length > 0 && (
          deleteAllConfirm ? (
            <div className="flex gap-2">
              <button onClick={handleDeleteAll} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">
                Confirmer
              </button>
              <button onClick={() => setDeleteAllConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">
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
          )
        )}
      </div>

      {/* Filtres */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['tous', 'pending', 'approved', 'rejected', 'refunded'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f === 'tous' ? 'Tous' : statusLabels[f]} ({counts[f]})
          </button>
        ))}
      </div>

      {/* Liste */}
      {filteredReturns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
          </svg>
          <p className="text-gray-500 text-lg">Aucune demande de retour</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReturns.map((ret) => (
            <div
              key={ret.id}
              className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${
                ret.status === 'pending'
                  ? 'border-l-yellow-400'
                  : ret.status === 'approved'
                    ? 'border-l-green-500'
                    : ret.status === 'refunded'
                      ? 'border-l-blue-500'
                      : 'border-l-red-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-3 flex-wrap mb-2">
                    <span className="font-mono text-sm font-bold text-gray-900">
                      #{ret.order.orderNumber}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[ret.status]}`}>
                      {statusLabels[ret.status]}
                    </span>
                    <span className="inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
                      {reasonLabels[ret.reason] || ret.reason}
                    </span>
                  </div>

                  {/* Client info */}
                  <p className="text-sm text-gray-700 mb-1">
                    <span className="font-medium">{ret.order.customerName}</span>
                    {' - '}
                    <span>{ret.order.phone}</span>
                    {' - '}
                    <span className="font-semibold">{formatPrice(ret.order.total)}</span>
                  </p>

                  {/* Description */}
                  {ret.description && (
                    <p className="text-sm text-gray-500 italic mb-2">&quot;{ret.description}&quot;</p>
                  )}

                  {/* Date */}
                  <p className="text-xs text-gray-400">
                    {new Date(ret.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  {ret.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(ret.id, 'approved')}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-medium hover:bg-green-100 transition-colors"
                      >
                        Approuver
                      </button>
                      <button
                        onClick={() => handleStatusChange(ret.id, 'rejected')}
                        className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors"
                      >
                        Refuser
                      </button>
                    </>
                  )}
                  {ret.status === 'approved' && (
                    <button
                      onClick={() => handleStatusChange(ret.id, 'refunded')}
                      className="px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium hover:bg-blue-100 transition-colors"
                    >
                      Marquer rembourse
                    </button>
                  )}

                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${ret.order.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </a>

                  {/* Supprimer */}
                  {deleteConfirmId === ret.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => handleDelete(ret.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Oui</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Non</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(ret.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
