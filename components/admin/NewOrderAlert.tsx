'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { formatPrice } from '@/lib/utils'

/**
 * Composant de notification des nouvelles commandes.
 * - Polling toutes les 30 secondes vers /api/admin/orders/check-new
 * - Joue un son de notification via Web Audio API (bip genere, pas de fichier)
 * - Affiche un toast en haut a droite avec le numero de commande
 * - Le toast disparait apres 10 secondes ou au clic
 */

/** Type d'une commande retournee par l'API check-new */
interface NewOrder {
  id: string
  orderNumber: string
  customerName: string
  total: number
  createdAt: string
}

/** Type de la reponse de l'API */
interface CheckNewResponse {
  count: number
  orders: NewOrder[]
}

/** Toast affiche pour une nouvelle commande */
interface Toast {
  id: string
  orderNumber: string
  customerName: string
  total: number
  createdAt: number // timestamp pour le timeout
}

/** Intervalle de polling en millisecondes (30 secondes) */
const POLL_INTERVAL = 30_000

/** Duree d'affichage d'un toast en millisecondes (10 secondes) */
const TOAST_DURATION = 10_000

/**
 * Generer un son de notification avec Web Audio API.
 * Produit un double bip court et melodique.
 */
function playNotificationSound(): void {
  try {
    const audioContext = new AudioContext()

    // Premier bip (note haute)
    const osc1 = audioContext.createOscillator()
    const gain1 = audioContext.createGain()
    osc1.connect(gain1)
    gain1.connect(audioContext.destination)
    osc1.frequency.setValueAtTime(880, audioContext.currentTime) // La5
    osc1.type = 'sine'
    gain1.gain.setValueAtTime(0.3, audioContext.currentTime)
    gain1.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15)
    osc1.start(audioContext.currentTime)
    osc1.stop(audioContext.currentTime + 0.15)

    // Second bip (note plus haute, apres le premier)
    const osc2 = audioContext.createOscillator()
    const gain2 = audioContext.createGain()
    osc2.connect(gain2)
    gain2.connect(audioContext.destination)
    osc2.frequency.setValueAtTime(1174.66, audioContext.currentTime + 0.18) // Re6
    osc2.type = 'sine'
    gain2.gain.setValueAtTime(0, audioContext.currentTime)
    gain2.gain.setValueAtTime(0.3, audioContext.currentTime + 0.18)
    gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35)
    osc2.start(audioContext.currentTime + 0.18)
    osc2.stop(audioContext.currentTime + 0.35)

    // Fermer le contexte audio apres les sons
    setTimeout(() => {
      void audioContext.close()
    }, 500)
  } catch (error) {
    // Web Audio API peut ne pas etre disponible sur certains navigateurs
    console.warn('Web Audio API non disponible:', error)
  }
}

export default function NewOrderAlert() {
  const [toasts, setToasts] = useState<Toast[]>([])
  // Stocker les IDs de commandes deja notifiees pour eviter les doublons
  const notifiedOrdersRef = useRef<Set<string>>(new Set())

  /** Supprimer un toast par son id */
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /** Verifier les nouvelles commandes */
  const checkNewOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders/check-new')
      if (!res.ok) return

      const data = (await res.json()) as CheckNewResponse

      if (data.count > 0) {
        // Filtrer les commandes pas encore notifiees
        const newOrders = data.orders.filter(
          (order) => !notifiedOrdersRef.current.has(order.id)
        )

        if (newOrders.length > 0) {
          // Jouer le son une seule fois pour le lot
          playNotificationSound()

          // Creer les toasts
          const newToasts: Toast[] = newOrders.map((order) => ({
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.customerName,
            total: order.total,
            createdAt: Date.now(),
          }))

          setToasts((prev) => [...newToasts, ...prev])

          // Marquer comme notifiees
          newOrders.forEach((order) => {
            notifiedOrdersRef.current.add(order.id)
          })
        }
      }
    } catch (error) {
      // Ignorer les erreurs de connexion silencieusement
      console.warn('Erreur polling nouvelles commandes:', error)
    }
  }, [])

  // Polling toutes les 30 secondes
  useEffect(() => {
    // Premier check apres 5 secondes (laisser le temps au chargement initial)
    const initialTimeout = setTimeout(() => {
      void checkNewOrders()
    }, 5000)

    const interval = setInterval(() => {
      void checkNewOrders()
    }, POLL_INTERVAL)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [checkNewOrders])

  // Auto-suppression des toasts apres 10 secondes
  useEffect(() => {
    if (toasts.length === 0) return

    const timers = toasts.map((toast) => {
      const elapsed = Date.now() - toast.createdAt
      const remaining = Math.max(TOAST_DURATION - elapsed, 0)
      return setTimeout(() => removeToast(toast.id), remaining)
    })

    return () => timers.forEach(clearTimeout)
  }, [toasts, removeToast])

  // Ne rien rendre s'il n'y a pas de toasts
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <button
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          className="pointer-events-auto bg-white rounded-2xl shadow-lg border border-green-200 p-4 flex items-start gap-3 animate-slide-in-right hover:shadow-xl transition-shadow cursor-pointer w-full text-left"
        >
          {/* Icone notification */}
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Contenu */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Nouvelle commande !
            </p>
            <p className="text-sm text-gray-600 mt-0.5">
              #{toast.orderNumber}
            </p>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500 truncate">{toast.customerName}</span>
              <span className="text-sm font-bold text-primary-500 flex-shrink-0 ml-2">
                {formatPrice(toast.total)}
              </span>
            </div>
          </div>

          {/* Bouton fermer */}
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  )
}
