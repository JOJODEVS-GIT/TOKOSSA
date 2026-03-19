'use client'

import { useState } from 'react'

const announcements = [
  'Livraison GRATUITE a Cotonou et environs des 5000 FCFA',
  '-20% sur tous les articles cette semaine',
  'Paiement Mobile Money accepte (MTN, Moov, Celtis)',
  'Assistance WhatsApp 7j/7 — Reponse en 5 min',
]

export default function AnnounceBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-secondary-500 text-white py-2 overflow-hidden border-b border-white/10">
      {/* Ticker continu CSS */}
      <div className="flex animate-ticker whitespace-nowrap">
        {[...announcements, ...announcements].map((text, idx) => (
          <span key={idx} className="inline-flex items-center mx-8 text-sm font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mr-3 flex-shrink-0" />
            {text}
          </span>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-white/20 rounded-full transition-colors z-10"
        aria-label="Fermer"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
