'use client'

import { useState, useEffect } from 'react'

/**
 * DeliveryTimer — Bandeau de livraison meme jour.
 *
 * Avant 14h00 : affiche un countdown jusqu'a 14h00 avec le message
 *   "Commandez avant 14h pour etre livre aujourd'hui !"
 *
 * Apres 14h00 : affiche "Commandez maintenant, livre demain matin !"
 *
 * Le composant se re-rend chaque seconde pour mettre a jour le countdown.
 */

/** Calcule le temps restant avant 14h00 du jour en cours */
function getTimeUntilCutoff(): { hours: number; minutes: number; seconds: number; isPastCutoff: boolean } {
  const now = new Date()
  const cutoff = new Date()
  cutoff.setHours(14, 0, 0, 0) // 14h00 pile

  const diff = cutoff.getTime() - now.getTime()

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, isPastCutoff: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds, isPastCutoff: false }
}

/** Formate un nombre sur 2 chiffres (ex: 5 -> "05") */
function pad(n: number): string {
  return n.toString().padStart(2, '0')
}

export default function DeliveryTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilCutoff)

  // Mise a jour chaque seconde
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilCutoff())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-md shadow-green-600/20">
      <div className="flex items-center gap-3">
        {/* Icone camion */}
        <div className="flex-shrink-0 bg-white/20 rounded-xl p-2.5">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
            />
          </svg>
        </div>

        {/* Contenu textuel */}
        <div className="flex-1 min-w-0">
          {timeLeft.isPastCutoff ? (
            /* Apres 14h : message livraison demain */
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Commandez maintenant
              </p>
              <p className="text-white/90 text-xs mt-0.5">
                Livre demain matin !
              </p>
            </div>
          ) : (
            /* Avant 14h : countdown jusqu'a 14h */
            <div>
              <p className="text-white font-semibold text-sm leading-tight">
                Commandez avant 14h pour etre livre aujourd&apos;hui !
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {/* Heures */}
                <span className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px]">
                  <span className="text-white font-bold text-sm tabular-nums">
                    {pad(timeLeft.hours)}
                  </span>
                </span>
                <span className="text-white/80 font-bold text-xs">:</span>
                {/* Minutes */}
                <span className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px]">
                  <span className="text-white font-bold text-sm tabular-nums">
                    {pad(timeLeft.minutes)}
                  </span>
                </span>
                <span className="text-white/80 font-bold text-xs">:</span>
                {/* Secondes */}
                <span className="inline-flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 min-w-[36px]">
                  <span className="text-white font-bold text-sm tabular-nums animate-pulse">
                    {pad(timeLeft.seconds)}
                  </span>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
