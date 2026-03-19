'use client'

import { useEffect, useState } from 'react'

/**
 * Type pour une notification de vente (social proof).
 * Compatible avec le modele SaleNotification de Prisma
 * et les donnees de demonstration en fallback.
 */
interface Notification {
  productName: string
  customerName: string
  quarter: string
}

export default function LiveNotification() {
  const [isVisible, setIsVisible] = useState(false)
  const [notification, setNotification] = useState<Notification | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loaded, setLoaded] = useState(false)

  // U8: Fetch les notifications reelles depuis la DB — pas de fallback fictif
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch('/api/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data)
        }
      } catch {
        // En cas d'erreur reseau, on n'affiche rien
      } finally {
        setLoaded(true)
      }
    }

    fetchNotifications()
  }, [])

  useEffect(() => {
    if (!loaded || notifications.length === 0) return

    const showNotification = () => {
      const randomNotif = notifications[Math.floor(Math.random() * notifications.length)]
      setNotification(randomNotif)
      setIsVisible(true)

      setTimeout(() => {
        setIsVisible(false)
      }, 5000)
    }

    const initialTimeout = setTimeout(showNotification, 10000)

    const interval = setInterval(() => {
      showNotification()
    }, 20000 + Math.random() * 20000)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [notifications, loaded])

  if (!isVisible || !notification) return null

  return (
    <div role="status" aria-live="polite" aria-atomic="true" className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-30 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-warm-100 overflow-hidden flex">
        {/* Accent strip */}
        <div className="w-1 bg-gradient-to-b from-green-500 to-primary-500 flex-shrink-0" />

        <div className="flex items-start gap-3 p-4 flex-1">
          {/* Icon */}
          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-bold text-secondary-500">{notification.customerName}</span>
              {' '}a{' '}
              <span className="inline-flex items-center bg-warm-100 rounded-full px-2 py-0.5 text-xs text-warm-600 font-medium">
                {notification.quarter}
              </span>
            </p>
            <p className="text-sm text-primary-600 font-medium truncate mt-0.5">
              vient d&apos;acheter {notification.productName}
            </p>
            <p className="text-xs text-warm-400 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Il y a quelques secondes
            </p>
          </div>

          {/* Close */}
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 p-1.5 hover:bg-warm-100 rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-4 h-4 text-warm-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
