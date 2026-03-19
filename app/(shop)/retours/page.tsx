'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'

/**
 * Raisons de retour proposees au client.
 */
const RAISONS_RETOUR = [
  { value: 'defectueux', label: 'Produit defectueux' },
  { value: 'ne_correspond_pas', label: 'Ne correspond pas a la description' },
  { value: 'autre', label: 'Autre raison' },
] as const

/** Reponse de l'API apres creation d'un retour */
interface RetourSuccessResponse {
  id: string
  orderNumber: string
  status: string
  message: string
}

/**
 * Page de demande de retour produit.
 * Le client saisit son numero de commande, une raison et une description.
 * Style identique au checkout : cards blanches, border-l-4 primary, rounded-2xl.
 */
export default function RetoursPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [reason, setReason] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<RetourSuccessResponse | null>(null)

  /** Soumettre la demande de retour */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(null)

    // Validation cote client
    if (!orderNumber.trim()) {
      setError('Veuillez saisir votre numero de commande.')
      return
    }

    if (!reason) {
      setError('Veuillez selectionner une raison.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/retours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderNumber.trim().toUpperCase(),
          reason,
          description: description.trim() || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Une erreur est survenue.')
        return
      }

      setSuccess(data as RetourSuccessResponse)
      // Reinitialiser le formulaire
      setOrderNumber('')
      setReason('')
      setDescription('')
    } catch {
      setError('Erreur de connexion. Verifiez votre connexion internet.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-500/90 text-white">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Demande de retour
          </h1>
          <p className="text-white/70 mt-1">
            Retour possible dans les 7 jours suivant la livraison
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Message de succes */}
        {success && (
          <div className="bg-white rounded-2xl p-6 border border-green-200 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">
                  Demande enregistree
                </h3>
                <p className="text-green-700 text-sm mt-1">
                  {success.message}
                </p>
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-warm-600">
                    <span className="font-medium">Commande :</span> {success.orderNumber}
                  </p>
                  <p className="text-sm text-warm-600">
                    <span className="font-medium">Numero de suivi :</span> {success.id}
                  </p>
                  <p className="text-sm text-warm-600">
                    <span className="font-medium">Statut :</span>{' '}
                    <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      En attente
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire de retour */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Numero de commande */}
            <div className="bg-white rounded-2xl p-6 border border-warm-100">
              <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                Votre commande
              </h2>

              <div>
                <label
                  htmlFor="orderNumber"
                  className="block text-sm font-medium text-warm-600 mb-1"
                >
                  Numero de commande *
                </label>
                <input
                  id="orderNumber"
                  type="text"
                  value={orderNumber}
                  onChange={(e) => {
                    setOrderNumber(e.target.value)
                    setError('')
                  }}
                  className="form-input"
                  placeholder="Ex: TOK-20260307-AB12"
                />
                <p className="text-xs text-warm-400 mt-1">
                  Vous trouverez ce numero dans votre message WhatsApp de confirmation.
                </p>
              </div>
            </div>

            {/* Raison du retour */}
            <div className="bg-white rounded-2xl p-6 border border-warm-100">
              <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                Raison du retour
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="reason"
                    className="block text-sm font-medium text-warm-600 mb-1"
                  >
                    Motif *
                  </label>
                  <select
                    id="reason"
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value)
                      setError('')
                    }}
                    className="form-input"
                  >
                    <option value="">Selectionnez une raison</option>
                    {RAISONS_RETOUR.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-warm-600 mb-1"
                  >
                    Description (optionnel)
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="form-input"
                    placeholder="Decrivez le probleme rencontre avec votre produit..."
                  />
                </div>
              </div>
            </div>

            {/* Erreur globale */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Bouton de soumission */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Soumettre la demande de retour
            </Button>

            {/* Informations complementaires */}
            <div className="bg-white rounded-2xl p-6 border border-warm-100">
              <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                Informations utiles
              </h2>
              <ul className="space-y-2 text-sm text-warm-600">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Les retours sont acceptes dans un delai de 7 jours apres livraison.
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Le produit doit etre dans son emballage d&apos;origine.
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Nous vous contacterons par WhatsApp sous 48h pour organiser la reprise.
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Le remboursement est effectue sous 5 jours ouvrables apres validation.
                </li>
              </ul>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
