'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * Cle localStorage pour stocker l'etat de la demande de notification
 * Evite de montrer la banniere plusieurs fois
 */
const NOTIFICATION_STORAGE_KEY = 'tokossa_push_notification_asked'

/**
 * Etats possibles de la permission de notification
 */
type EtatNotification = 'idle' | 'affiche' | 'accepte' | 'refuse' | 'non-supporte'

/**
 * PushNotificationBanner
 *
 * Banniere mobile-first qui invite l'utilisateur a activer les
 * notifications push pour recevoir :
 * - Les mises a jour de commande
 * - Les promotions exclusives
 * - Les alertes de stock
 *
 * Comportement :
 * - Affichee une seule fois (etat sauvegarde en localStorage)
 * - Apparait 5 secondes apres le chargement (non intrusif)
 * - Animation d'entree fluide depuis le bas
 * - Design coherent avec la charte TOKOSSA
 */
export default function PushNotificationBanner() {
  const [etat, setEtat] = useState<EtatNotification>('idle')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Verifier si le navigateur supporte les notifications
    if (typeof window === 'undefined') return
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      setEtat('non-supporte')
      return
    }

    // Verifier si on a deja demande la permission
    const dejaDemandeRaw = localStorage.getItem(NOTIFICATION_STORAGE_KEY)
    if (dejaDemandeRaw) {
      try {
        const dejaDemande = JSON.parse(dejaDemandeRaw) as { asked: boolean }
        if (dejaDemande.asked) {
          setEtat('idle')
          return
        }
      } catch {
        // JSON invalide, on continue normalement
      }
    }

    // Verifier si la permission est deja accordee ou refusee
    if (Notification.permission === 'granted') {
      setEtat('accepte')
      return
    }
    if (Notification.permission === 'denied') {
      setEtat('refuse')
      return
    }

    // Afficher la banniere apres un delai (non intrusif)
    const delai = setTimeout(() => {
      setEtat('affiche')
      // Petit delai pour l'animation d'entree
      requestAnimationFrame(() => {
        setVisible(true)
      })
    }, 5000) // 5 secondes apres le chargement

    return () => clearTimeout(delai)
  }, [])

  /**
   * L'utilisateur accepte les notifications
   * Demande la permission au navigateur et enregistre l'etat
   */
  const accepterNotifications = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission()

      if (permission === 'granted') {
        setEtat('accepte')

        // Enregistrer la souscription push (pour l'instant juste l'etat)
        // TODO: Envoyer la souscription au serveur quand le backend push sera pret
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          console.log(
            '[TOKOSSA Push] Notifications activees, SW pret:',
            registration.scope
          )

          // Stocker l'etat d'acceptation
          localStorage.setItem(
            NOTIFICATION_STORAGE_KEY,
            JSON.stringify({ asked: true, accepted: true, date: new Date().toISOString() })
          )
        }
      } else {
        setEtat('refuse')
        localStorage.setItem(
          NOTIFICATION_STORAGE_KEY,
          JSON.stringify({ asked: true, accepted: false, date: new Date().toISOString() })
        )
      }
    } catch (error) {
      console.error('[TOKOSSA Push] Erreur lors de la demande de permission:', error)
      setEtat('refuse')
    }

    // Cacher la banniere avec animation
    setVisible(false)
  }, [])

  /**
   * L'utilisateur refuse / ferme la banniere
   * Enregistre l'etat pour ne plus montrer la banniere
   */
  const refuserNotifications = useCallback(() => {
    setEtat('refuse')
    setVisible(false)

    // Sauvegarder le refus pour ne plus afficher
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify({ asked: true, accepted: false, date: new Date().toISOString() })
    )
  }, [])

  // Ne rien afficher si la banniere ne doit pas etre montree
  if (etat !== 'affiche') {
    return null
  }

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 z-50
        transition-transform duration-500 ease-out
        ${visible ? 'translate-y-0' : 'translate-y-full'}
      `}
      role="dialog"
      aria-label="Activer les notifications"
    >
      {/* Overlay semi-transparent */}
      <div
        className={`
          fixed inset-0 bg-black/20 transition-opacity duration-500
          ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={refuserNotifications}
        aria-hidden="true"
      />

      {/* Contenu de la banniere */}
      <div className="relative bg-white rounded-t-2xl shadow-2xl p-5 pb-8 max-w-[430px] mx-auto">
        {/* Poignee de glissement (design mobile) */}
        <div className="flex justify-center mb-4">
          <div className="w-10 h-1 bg-warm-200 rounded-full" />
        </div>

        {/* Bouton fermer */}
        <button
          onClick={refuserNotifications}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-warm-400 hover:text-warm-600 hover:bg-warm-100 transition-colors"
          aria-label="Fermer"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Icone de notification */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="text-primary-500"
            >
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M13.73 21a2 2 0 0 1-3.46 0"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Point rouge de notification */}
              <circle cx="18" cy="4" r="3" fill="#ef4444" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-secondary-500 leading-tight">
              Restez informe !
            </h3>
            <p className="text-sm text-warm-500 mt-0.5 leading-snug">
              Recevez vos promos et le suivi de vos commandes
            </p>
          </div>
        </div>

        {/* Avantages (liste courte pour mobile) */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-600 bg-warm-50 px-2.5 py-1.5 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success-500">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Suivi commande
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-600 bg-warm-50 px-2.5 py-1.5 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success-500">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Promos exclusives
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-warm-600 bg-warm-50 px-2.5 py-1.5 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-success-500">
              <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Alertes stock
          </span>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-3">
          <button
            onClick={refuserNotifications}
            className="flex-1 py-3 px-4 text-sm font-semibold text-warm-500 bg-warm-50 rounded-xl hover:bg-warm-100 active:scale-[0.98] transition-all"
          >
            Plus tard
          </button>
          <button
            onClick={accepterNotifications}
            className="flex-[2] py-3 px-4 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 active:scale-[0.98] transition-all"
          >
            Activer les notifications
          </button>
        </div>

        {/* Mention rassurante */}
        <p className="text-center text-[11px] text-warm-400 mt-3">
          Vous pouvez desactiver a tout moment dans les parametres
        </p>
      </div>
    </div>
  )
}
