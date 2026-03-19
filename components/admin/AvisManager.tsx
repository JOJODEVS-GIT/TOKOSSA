'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Composant Client pour la moderation des avis clients.
 * Gere : filtrage (tous/en attente/approuves), approbation et rejet.
 * Recoit la liste initiale des avis depuis le Server Component parent.
 */

/** Type avis serialise depuis le Server Component */
interface ReviewItem {
  id: string
  productName: string
  phone: string
  name: string
  rating: number
  comment: string
  isVerified: boolean
  createdAt: string
}

interface AvisManagerProps {
  initialAvis: ReviewItem[]
}

/** Types de filtre disponibles */
type FilterType = 'tous' | 'en_attente' | 'approuves'

export default function AvisManager({ initialAvis }: AvisManagerProps) {
  const router = useRouter()
  const [avis, setAvis] = useState<ReviewItem[]>(initialAvis)
  const [filter, setFilter] = useState<FilterType>('tous')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  /** Filtrer les avis selon le filtre actif */
  const filteredAvis = avis.filter((a) => {
    if (filter === 'en_attente') return !a.isVerified
    if (filter === 'approuves') return a.isVerified
    return true
  })

  /** Nombre d'avis par filtre */
  const counts = {
    tous: avis.length,
    en_attente: avis.filter((a) => !a.isVerified).length,
    approuves: avis.filter((a) => a.isVerified).length,
  }

  /** Approuver un avis */
  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified: true }),
      })

      if (res.ok) {
        setAvis((prev) =>
          prev.map((a) => (a.id === id ? { ...a, isVerified: true } : a))
        )
        router.refresh()
      }
    } catch {
      console.error('Erreur lors de l\'approbation')
    }
  }

  /** Rejeter (supprimer) un avis */
  const handleReject = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setAvis((prev) => prev.filter((a) => a.id !== id))
        setDeleteConfirmId(null)
        router.refresh()
      }
    } catch {
      console.error('Erreur lors de la suppression')
    }
  }

  /** Afficher les etoiles pour une note donnee */
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tete */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Avis clients</h1>
        <p className="text-gray-600">
          {counts.en_attente} avis en attente de moderation
        </p>
      </div>

      {/* Filtres */}
      <div className="flex gap-2">
        {([
          { key: 'tous' as FilterType, label: 'Tous', count: counts.tous },
          { key: 'en_attente' as FilterType, label: 'En attente', count: counts.en_attente },
          { key: 'approuves' as FilterType, label: 'Approuves', count: counts.approuves },
        ]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Liste des avis */}
      {filteredAvis.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          <p className="text-gray-500 text-lg">Aucun avis dans cette categorie</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAvis.map((review) => (
            <div
              key={review.id}
              className={`bg-white rounded-2xl shadow-sm p-6 border-l-4 ${
                review.isVerified ? 'border-l-green-500' : 'border-l-yellow-400'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                {/* Contenu de l'avis */}
                <div className="flex-1 min-w-0">
                  {/* Produit et statut */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-gray-900 text-sm">{review.productName}</span>
                    <span
                      className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        review.isVerified
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {review.isVerified ? 'Approuve' : 'En attente'}
                    </span>
                  </div>

                  {/* Note en etoiles */}
                  <div className="mb-2">
                    {renderStars(review.rating)}
                  </div>

                  {/* Commentaire */}
                  <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

                  {/* Auteur et date */}
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>Par {review.name}</span>
                    <span>-</span>
                    <span>
                      {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {!review.isVerified && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approuver
                    </button>
                  )}

                  {deleteConfirmId === review.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReject(review.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-xl text-xs font-medium hover:bg-red-600 transition-colors"
                      >
                        Confirmer
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-medium hover:bg-gray-200 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(review.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rejeter
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
