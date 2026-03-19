'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'

/**
 * Page de gestion des codes promo TOKOSSA.
 * Client Component pour gerer les interactions (formulaire, toggle, etc.).
 * Communique avec /api/admin/promotions pour CRUD.
 */

/** Type d'un code promo retourne par l'API */
interface PromoCode {
  id: string
  code: string
  discount: number
  type: string
  minOrder: number | null
  maxUses: number | null
  usedCount: number
  isActive: boolean
  expiresAt: string | null
  createdAt: string
}

/** Etat initial du formulaire de creation */
const initialForm = {
  code: '',
  discount: '',
  type: 'percent' as 'percent' | 'fixed',
  minOrder: '',
  maxUses: '',
  expiresAt: '',
}

export default function PromotionsPage() {
  const [promos, setPromos] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false)

  /** Charger la liste des promotions */
  const fetchPromos = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/promotions')
      if (res.ok) {
        const data = (await res.json()) as PromoCode[]
        setPromos(data)
      }
    } catch (err) {
      console.error('Erreur chargement promos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchPromos()
  }, [fetchPromos])

  /** Creer une nouvelle promotion */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)

    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          discount: Number(form.discount),
          type: form.type,
          minOrder: form.minOrder ? Number(form.minOrder) : undefined,
          maxUses: form.maxUses ? Number(form.maxUses) : undefined,
          expiresAt: form.expiresAt || undefined,
        }),
      })

      if (!res.ok) {
        const data = (await res.json()) as { error: string }
        setError(data.error || 'Erreur lors de la creation')
        return
      }

      // Reinitialiser le formulaire et recharger
      setForm(initialForm)
      setShowForm(false)
      await fetchPromos()
    } catch (err) {
      console.error('Erreur creation promo:', err)
      setError('Erreur de connexion au serveur')
    } finally {
      setSaving(false)
    }
  }

  /** Toggle activer/desactiver une promotion */
  const togglePromo = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch('/api/admin/promotions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !isActive }),
      })

      if (res.ok) {
        // Mettre a jour localement pour reactivite instantanee
        setPromos((prev) =>
          prev.map((p) =>
            p.id === id ? { ...p, isActive: !isActive } : p
          )
        )
      }
    } catch (err) {
      console.error('Erreur toggle promo:', err)
    }
  }

  /** Supprimer une promotion */
  const deletePromo = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        setPromos((prev) => prev.filter((p) => p.id !== id))
        setDeleteConfirmId(null)
      }
    } catch (err) {
      console.error('Erreur suppression promo:', err)
    }
  }

  /** Supprimer toutes les promotions */
  const deleteAllPromos = async () => {
    try {
      const res = await fetch('/api/admin/promotions', { method: 'DELETE' })
      if (res.ok) {
        setPromos([])
        setDeleteAllConfirm(false)
      }
    } catch (err) {
      console.error('Erreur suppression toutes promos:', err)
    }
  }

  /** Formater la reduction pour l'affichage */
  const formatDiscount = (promo: PromoCode): string => {
    if (promo.type === 'percent') {
      return `-${promo.discount}%`
    }
    return `-${formatPrice(promo.discount)}`
  }

  /** Verifier si une promo est expiree */
  const isExpired = (promo: PromoCode): boolean => {
    if (!promo.expiresAt) return false
    return new Date(promo.expiresAt) < new Date()
  }

  /** Verifier si le quota est atteint */
  const isMaxedOut = (promo: PromoCode): boolean => {
    if (!promo.maxUses) return false
    return promo.usedCount >= promo.maxUses
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Promotions</h1>
          <p className="text-gray-600">{promos.length} code{promos.length > 1 ? 's' : ''} promo</p>
        </div>
        <div className="flex gap-2">
          {promos.length > 0 && (
            deleteAllConfirm ? (
              <div className="flex gap-2">
                <button onClick={deleteAllPromos} className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium">Confirmer</button>
                <button onClick={() => setDeleteAllConfirm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium">Annuler</button>
              </div>
            ) : (
              <button
                onClick={() => setDeleteAllConfirm(true)}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Tout supprimer
              </button>
            )
          )}
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Annuler
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Creer une promo
            </>
          )}
        </button>
        </div>
      </div>

      {/* Formulaire de creation */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Nouveau code promo</h2>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label htmlFor="promo-code" className="block text-sm font-medium text-gray-700 mb-1">
                Code promo
              </label>
              <input
                id="promo-code"
                type="text"
                required
                placeholder="ex: BIENVENUE20"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm uppercase"
              />
            </div>

            {/* Type de reduction */}
            <div>
              <label htmlFor="promo-type" className="block text-sm font-medium text-gray-700 mb-1">
                Type de reduction
              </label>
              <select
                id="promo-type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'percent' | 'fixed' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe (FCFA)</option>
              </select>
            </div>

            {/* Valeur de la reduction */}
            <div>
              <label htmlFor="promo-discount" className="block text-sm font-medium text-gray-700 mb-1">
                {form.type === 'percent' ? 'Reduction (%)' : 'Reduction (FCFA)'}
              </label>
              <input
                id="promo-discount"
                type="number"
                required
                min="1"
                max={form.type === 'percent' ? '100' : undefined}
                placeholder={form.type === 'percent' ? 'ex: 20' : 'ex: 5000'}
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Commande minimum */}
            <div>
              <label htmlFor="promo-min" className="block text-sm font-medium text-gray-700 mb-1">
                Commande minimum (FCFA)
                <span className="text-gray-400 ml-1">optionnel</span>
              </label>
              <input
                id="promo-min"
                type="number"
                min="0"
                placeholder="ex: 10000"
                value={form.minOrder}
                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Nombre max d'utilisations */}
            <div>
              <label htmlFor="promo-max" className="block text-sm font-medium text-gray-700 mb-1">
                Utilisations max
                <span className="text-gray-400 ml-1">optionnel</span>
              </label>
              <input
                id="promo-max"
                type="number"
                min="1"
                placeholder="ex: 100"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>

            {/* Date d'expiration */}
            <div>
              <label htmlFor="promo-expires" className="block text-sm font-medium text-gray-700 mb-1">
                Expire le
                <span className="text-gray-400 ml-1">optionnel</span>
              </label>
              <input
                id="promo-expires"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-500 text-white px-6 py-2 rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creation...' : 'Creer le code promo'}
            </button>
          </div>
        </form>
      )}

      {/* Liste des promotions */}
      {promos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          <p className="text-gray-500 text-lg">Aucun code promo</p>
          <p className="text-gray-400 text-sm mt-1">Creez votre premier code promo pour booster les ventes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {promos.map((promo) => {
            const expired = isExpired(promo)
            const maxed = isMaxedOut(promo)
            const effectivelyActive = promo.isActive && !expired && !maxed

            return (
              <div
                key={promo.id}
                className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 transition-colors ${
                  effectivelyActive
                    ? 'border-l-green-500'
                    : 'border-l-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Info promo */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Code promo */}
                      <span className="font-mono text-lg font-bold text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">
                        {promo.code}
                      </span>

                      {/* Badge reduction */}
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-lg text-sm font-semibold">
                        {formatDiscount(promo)}
                      </span>

                      {/* Badges d'etat */}
                      {expired && (
                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded-lg text-xs font-medium">
                          Expire
                        </span>
                      )}
                      {maxed && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-lg text-xs font-medium">
                          Quota atteint
                        </span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      {promo.minOrder && (
                        <span>Min. {formatPrice(promo.minOrder)}</span>
                      )}
                      {promo.maxUses && (
                        <span>{promo.usedCount}/{promo.maxUses} utilisations</span>
                      )}
                      {!promo.maxUses && (
                        <span>{promo.usedCount} utilisation{promo.usedCount > 1 ? 's' : ''}</span>
                      )}
                      {promo.expiresAt && (
                        <span>
                          Expire le{' '}
                          {new Date(promo.expiresAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                      <span>
                        Cree le{' '}
                        {new Date(promo.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions : toggle + supprimer */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => togglePromo(promo.id, promo.isActive)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        promo.isActive ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                      title={promo.isActive ? 'Desactiver' : 'Activer'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          promo.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {deleteConfirmId === promo.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => deletePromo(promo.id)} className="px-2 py-1 bg-red-500 text-white rounded text-xs">Oui</button>
                        <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">Non</button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(promo.id)}
                        className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
