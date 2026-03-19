'use client'

import { useState, useCallback } from 'react'
import Button from '@/components/ui/Button'
import { formatPrice } from '@/lib/utils'

// --- Types ---

interface KKiapayPaymentProps {
  /** Identifiant unique de la commande */
  orderId: string
  /** Numero de commande affichable (ex: TOK-20240304-A1B2) */
  orderNumber: string
  /** Montant total en FCFA */
  amount: number
  /** Nom du client pour l'affichage */
  customerName: string
  /** Callback appele apres un paiement reussi */
  onSuccess: (transactionId: string) => void
  /** Callback appele quand l'utilisateur ferme la modale */
  onClose: () => void
}

/** Configuration retournee par l'API /api/paiement/initier */
interface KKiapayWidgetConfig {
  amount: number
  key: string
  sandbox: boolean
  phone: string
  name: string
  email: string
  reason: string
  callback: string
}

/** Reponse du SDK KKiaPay apres un paiement reussi */
interface KKiapaySuccessResponse {
  transactionId: string
}

// --- Typage du SDK KKiaPay sur window ---

declare global {
  interface Window {
    openKkiapayWidget?: (config: {
      amount: number
      api_key: string
      sandbox?: boolean
      phone?: string
      name?: string
      email?: string
      reason?: string
      callback?: string
    }) => void
    addKkiapayListener?: (
      event: 'success' | 'failed' | 'close',
      callback: (response?: KKiapaySuccessResponse) => void
    ) => void
  }
}

// --- Composant principal ---

/**
 * Modale de paiement KKiaPay.
 * Affiche le montant, les methodes disponibles (MTN, Moov, Wave)
 * et lance le widget KKiaPay au clic sur "Payer".
 */
export default function KKiapayPayment({
  orderId,
  orderNumber,
  amount,
  customerName,
  onSuccess,
  onClose,
}: KKiapayPaymentProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  /** Initialise le paiement via l'API puis ouvre le widget KKiaPay */
  const initPayment = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      // Appeler l'API pour obtenir la config du widget
      const res = await fetch('/api/paiement/initier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur initialisation paiement')
      }

      const { config } = (await res.json()) as { config: KKiapayWidgetConfig }

      // Verifier que le SDK KKiaPay est charge dans le navigateur
      if (typeof window !== 'undefined' && window.openKkiapayWidget) {
        window.openKkiapayWidget({
          amount: config.amount,
          api_key: config.key,
          sandbox: config.sandbox || false,
          phone: config.phone || '',
          name: config.name || '',
          email: config.email || '',
          reason: config.reason || `Commande TOKOSSA #${orderNumber}`,
          callback: config.callback,
        })

        // Ecouter les events KKiaPay
        if (window.addKkiapayListener) {
          window.addKkiapayListener('success', (response) => {
            if (response?.transactionId) {
              onSuccess(response.transactionId)
            }
          })
          window.addKkiapayListener('failed', () => {
            setError('Le paiement a echoue. Veuillez reessayer.')
            setLoading(false)
          })
          window.addKkiapayListener('close', () => {
            setLoading(false)
          })
        }
      } else {
        throw new Error(
          "Le module de paiement n'est pas encore charge. Veuillez patienter."
        )
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors du paiement'
      setError(message)
      setLoading(false)
    }
  }, [orderId, orderNumber, onSuccess])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Carte modale */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-6 animate-slide-up">
        {/* En-tete */}
        <div className="text-center">
          <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-secondary-500">
            Paiement Mobile Money
          </h3>
          <p className="text-warm-500 mt-1">Commande #{orderNumber}</p>
        </div>

        {/* Montant a payer */}
        <div className="bg-warm-50 rounded-2xl p-4 text-center">
          <p className="text-sm text-warm-500 mb-1">Montant a payer</p>
          <p className="text-3xl font-bold text-primary-500">
            {formatPrice(amount)}
          </p>
        </div>

        {/* Info paiement */}
        <p className="text-sm text-warm-500 text-center">
          Vous allez etre redirige vers KKiaPay pour finaliser votre paiement en toute securite.
        </p>

        {/* Message d'erreur */}
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl text-center">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={initPayment}
            disabled={loading}
          >
            {loading ? 'Chargement...' : `Payer ${formatPrice(amount)}`}
          </Button>

          <button
            onClick={onClose}
            className="w-full text-sm text-warm-500 hover:text-warm-700 py-2 transition-colors"
          >
            Annuler
          </button>
        </div>

        {/* Mention securite */}
        <p className="text-xs text-warm-400 text-center">
          Paiement securise via KKiaPay
        </p>
      </div>
    </div>
  )
}
