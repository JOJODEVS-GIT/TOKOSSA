'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Barre promotionnelle pour les visiteurs venant de Meta Ads.
 * Detecte les parametres UTM (utm_source=facebook/instagram, utm_medium=paid)
 * et affiche une offre speciale avec code promo.
 * Sauvegarde l'origine dans sessionStorage pour persistance au checkout.
 *
 * Affichage : sticky en haut, fond primary-500, texte blanc.
 * Si pas de UTM pub, rien n'est affiche.
 */

/** Cle sessionStorage pour sauvegarder l'origine pub */
const UTM_STORAGE_KEY = 'tokossa_utm_ad_source'

export default function AdPromoBanner() {
  const searchParams = useSearchParams()
  const [showBanner, setShowBanner] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Verifier si le visiteur vient d'une publicite Meta
    const utmSource = searchParams.get('utm_source')?.toLowerCase()
    const utmMedium = searchParams.get('utm_medium')?.toLowerCase()

    const isFromAd =
      utmSource === 'facebook' ||
      utmSource === 'instagram' ||
      utmMedium === 'paid'

    if (isFromAd) {
      // Sauvegarder l'origine dans sessionStorage
      try {
        sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify({
          source: utmSource || '',
          medium: utmMedium || '',
          timestamp: Date.now(),
        }))
      } catch {
        // sessionStorage indisponible (navigation privee)
      }
      setShowBanner(true)
      return
    }

    // Verifier si l'utilisateur vient d'une pub dans cette session
    try {
      const stored = sessionStorage.getItem(UTM_STORAGE_KEY)
      if (stored) {
        setShowBanner(true)
      }
    } catch {
      // sessionStorage indisponible
    }
  }, [searchParams])

  // Ne rien afficher si pas d'UTM pub ou si le bandeau est ferme
  if (!showBanner || dismissed) {
    return null
  }

  return (
    <div className="sticky top-0 z-50 bg-primary-500 text-white py-2.5 px-4 relative">
      <div className="container mx-auto flex items-center justify-center gap-3 text-center">
        <p className="text-sm font-semibold">
          Offre speciale : -10% avec le code{' '}
          <span className="bg-white/20 px-2 py-0.5 rounded font-bold tracking-wider">
            TOKOSSA10
          </span>
        </p>

        {/* Bouton fermer */}
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Fermer la banniere promotionnelle"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
