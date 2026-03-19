'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Bouton/select de changement de statut pour une commande.
 * Envoie un PUT /api/commandes/[id] avec le nouveau statut,
 * puis rafraichit la page via router.refresh().
 */

/** Statuts disponibles et leurs labels */
const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'En attente' },
  { value: 'CONFIRMED', label: 'Confirmee' },
  { value: 'PREPARING', label: 'Preparation' },
  { value: 'DELIVERING', label: 'En livraison' },
  { value: 'DELIVERED', label: 'Livree' },
  { value: 'CANCELLED', label: 'Annulee' },
] as const

interface OrderStatusButtonProps {
  orderId: string
  currentStatus: string
}

export default function OrderStatusButton({ orderId, currentStatus }: OrderStatusButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value
    if (newStatus === currentStatus) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/commandes/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors de la mise a jour')
      }

      // Rafraichir les donnees du Server Component
      router.refresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={loading}
        className={`
          text-xs font-medium rounded-lg px-3 py-2 border
          focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed
          appearance-none pr-8 cursor-pointer
          ${loading ? 'bg-gray-100' : 'bg-white'}
        `}
      >
        {STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Chevron indicateur */}
      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
        {loading ? (
          <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      {/* Message d'erreur */}
      {error && (
        <p className="absolute top-full left-0 mt-1 text-xs text-red-500 whitespace-nowrap">
          {error}
        </p>
      )}
    </div>
  )
}
