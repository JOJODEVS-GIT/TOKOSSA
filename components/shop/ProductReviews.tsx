'use client'

import { useState, useEffect, useCallback } from 'react'
import { isValidBeninPhone } from '@/lib/utils'
import Button from '@/components/ui/Button'

interface Review {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

interface ReviewData {
  reviews: Review[]
  average: number
  count: number
}

/**
 * Section avis clients pour la page produit.
 * Affiche les avis existants et un formulaire pour en ajouter.
 */
export default function ProductReviews({ productId }: { productId: string }) {
  const [data, setData] = useState<ReviewData | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rating: 5,
    comment: '',
  })

  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${productId}`)
      if (res.ok) {
        const json: ReviewData = await res.json()
        setData(json)
      }
    } catch {
      // silently fail
    }
  }, [productId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const [phoneError, setPhoneError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidBeninPhone(formData.phone)) {
      setPhoneError('Numero invalide. Format attendu : 01 XX XX XX XX')
      return
    }
    setPhoneError('')

    setSubmitting(true)
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, ...formData }),
      })

      if (res.ok) {
        setSubmitted(true)
        setShowForm(false)
        setFormData({ name: '', phone: '', rating: 5, comment: '' })
      }
    } catch {
      // silently fail
    } finally {
      setSubmitting(false)
    }
  }

  if (!data) return null

  return (
    <div className="mt-8">
      {/* En-tete avis */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-warm-900">Avis clients</h3>
          {data.count > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    className={`w-4 h-4 ${s <= Math.round(data.average) ? 'text-accent-500' : 'text-warm-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm text-warm-500">
                {data.average}/5 ({data.count})
              </span>
            </div>
          )}
        </div>

        {!showForm && !submitted && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
          >
            Donner mon avis
          </button>
        )}
      </div>

      {/* Message de remerciement */}
      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
          <p className="text-sm text-green-700 font-medium">
            Merci pour votre avis ! Il sera publie apres verification.
          </p>
        </div>
      )}

      {/* Formulaire d'avis */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-warm-50 rounded-xl p-4 mb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="review-name" className="sr-only">Votre nom</label>
              <input
                id="review-name"
                type="text"
                placeholder="Votre nom"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                autoComplete="name"
                required
              />
            </div>
            <div>
              <label htmlFor="review-phone" className="sr-only">Votre numéro</label>
              <input
                id="review-phone"
                type="tel"
                placeholder="01 90 00 00 00"
                value={formData.phone}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, phone: e.target.value }))
                  setPhoneError('')
                }}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-primary-500 ${phoneError ? 'border-red-400' : 'border-warm-200'}`}
                autoComplete="tel"
                required
                aria-describedby={phoneError ? 'review-phone-error' : undefined}
                aria-invalid={phoneError ? true : undefined}
              />
              {phoneError && (
                <p id="review-phone-error" className="text-xs text-red-500 mt-1" role="alert">{phoneError}</p>
              )}
            </div>
          </div>

          {/* Note */}
          <div className="flex items-center gap-2">
            <label htmlFor="review-rating-group" className="text-sm font-medium text-secondary-700">
              Note *
            </label>
            <div id="review-rating-group" className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setFormData((p) => ({ ...p, rating: s }))}
                  className="p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
                  aria-label={`${s} etoile${s > 1 ? 's' : ''}`}
                  aria-current={formData.rating === s ? 'true' : undefined}
                >
                  <svg
                    className={`w-7 h-7 transition-colors ${s <= formData.rating ? 'text-accent-500' : 'text-warm-200'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          {/* Label accessible masque visuellement (WCAG AA) */}
          <label htmlFor="review-comment" className="sr-only">Votre avis sur ce produit</label>
          <textarea
            id="review-comment"
            placeholder="Votre avis sur ce produit..."
            value={formData.comment}
            onChange={(e) => setFormData((p) => ({ ...p, comment: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 text-sm rounded-lg border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            required
          />

          <div className="flex gap-2">
            <Button type="submit" size="sm" isLoading={submitting}>
              Envoyer
            </Button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-warm-500 hover:text-warm-700 transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Liste des avis */}
      {data.reviews.length > 0 ? (
        <div className="space-y-3">
          {data.reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border border-warm-100 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-bold text-xs">
                    {review.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-warm-900">{review.name}</p>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <svg
                          key={s}
                          className={`w-3 h-3 ${s <= review.rating ? 'text-accent-500' : 'text-warm-200'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-warm-400">
                  {new Date(review.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
              <p className="text-sm text-warm-600 leading-relaxed">{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-warm-400 text-center py-4">
          Aucun avis pour le moment. Soyez le premier a donner votre avis !
        </p>
      )}
    </div>
  )
}
