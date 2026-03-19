'use client'

import { useEffect } from 'react'

/**
 * Composant PWARegister
 *
 * Enregistre le Service Worker pour activer le mode PWA.
 * Ce composant ne rend rien visuellement, il gere uniquement
 * l'enregistrement du SW au montage.
 *
 * Fonctionnalites :
 * - Enregistre le SW apres le chargement de la page (non bloquant)
 * - Gere les mises a jour du SW
 * - Log les erreurs en console pour le debug
 */
export default function PWARegister() {
  useEffect(() => {
    // Verifier que le navigateur supporte les Service Workers
    // Ne pas enregistrer en developpement (le SW cacherait les chunks webpack et casserait le HMR)
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') {
      return
    }

    /**
     * Enregistre le Service Worker apres le chargement complet de la page
     * pour ne pas bloquer le rendu initial (important sur 3G)
     */
    const enregistrerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })

        console.log(
          '[TOKOSSA PWA] Service Worker enregistre avec succes, scope:',
          registration.scope
        )

        // Verifier les mises a jour du SW periodiquement (toutes les heures)
        setInterval(
          () => {
            registration.update().catch(() => {
              // Silencieux : pas de reseau disponible
            })
          },
          60 * 60 * 1000 // 1 heure
        )

        // Ecouter les mises a jour du SW
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (!newWorker) return

          newWorker.addEventListener('statechange', () => {
            if (
              newWorker.state === 'installed' &&
              navigator.serviceWorker.controller
            ) {
              // Nouveau SW disponible, informer l'utilisateur
              console.log(
                '[TOKOSSA PWA] Nouvelle version disponible. Rechargez la page.'
              )
            }
          })
        })
      } catch (error) {
        console.error(
          '[TOKOSSA PWA] Erreur lors de l\'enregistrement du Service Worker:',
          error
        )
      }
    }

    // Attendre le chargement complet avant d'enregistrer le SW
    if (document.readyState === 'complete') {
      enregistrerSW()
    } else {
      window.addEventListener('load', enregistrerSW, { once: true })
    }

    // Nettoyage
    return () => {
      window.removeEventListener('load', enregistrerSW)
    }
  }, [])

  // Ce composant ne rend rien visuellement
  return null
}
