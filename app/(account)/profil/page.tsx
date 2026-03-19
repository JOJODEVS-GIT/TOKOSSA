'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { formatPrice, formatPhone, isValidBeninPhone } from '@/lib/utils'

// Types pour les donnees du profil client
interface CustomerProfile {
  id: string
  firstName: string
  lastName: string
  phone: string
  email: string | null
  address: string | null
  quarter: string | null
  _count: {
    orders: number
  }
}

/**
 * Page profil client.
 * Le client entre son numero de telephone pour retrouver ses informations.
 * Pas d'authentification requise — recherche par telephone uniquement.
 */
export default function ProfilPage() {
  const [phone, setPhone] = useState('')
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formater le numero pendant la saisie (espaces automatiques)
  const handlePhoneChange = useCallback((value: string) => {
    // Ne garder que les chiffres
    const digits = value.replace(/\D/g, '')

    // Limiter a 10 chiffres (format benin sans indicatif)
    const limited = digits.slice(0, 10)

    // Formater avec espaces : 01 90 00 00 00
    let formatted = ''
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += ' '
      formatted += limited[i]
    }

    setPhone(formatted)
    setError(null)
  }, [])

  // Rechercher le profil par telephone
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanPhone = phone.replace(/\s/g, '')

    if (!isValidBeninPhone(cleanPhone)) {
      setError('Numero invalide. Format attendu : 01 90 00 00 00')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/api/profil?phone=${encodeURIComponent('+229' + cleanPhone)}`
      )

      if (response.ok) {
        const data: CustomerProfile = await response.json()
        setProfile(data)
      } else {
        setProfile(null)
      }

      setSearched(true)
    } catch {
      setError('Erreur de connexion. Verifiez votre reseau et reessayez.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      {/* En-tete */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Mon Profil</h1>
          <p className="text-sm text-warm-500">
            Retrouvez vos informations client
          </p>
        </div>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm mb-6">
        <p className="text-warm-600 text-sm mb-4">
          Entrez votre numero de telephone pour acceder a votre profil
        </p>

        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <label
              htmlFor="phone-input"
              className="block text-sm font-medium text-warm-700 mb-2"
            >
              Numero de telephone
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">
                +229
              </span>
              <input
                id="phone-input"
                type="tel"
                inputMode="numeric"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="01 90 00 00 00"
                className="w-full pl-16 pr-4 py-3.5 rounded-xl border border-warm-200 bg-warm-50/50 text-warm-900 placeholder:text-warm-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                autoComplete="tel"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            className="w-full"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Rechercher mon profil
          </Button>
        </form>
      </div>

      {/* Resultat : profil trouve */}
      {searched && profile && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Carte profil */}
          <div className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm">
            {/* Avatar et nom */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
                {profile.firstName.charAt(0).toUpperCase()}
                {profile.lastName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-lg font-bold text-warm-900">
                  {profile.firstName} {profile.lastName}
                </h2>
                <p className="text-sm text-warm-500">Client TOKOSSA</p>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-4">
              {/* Telephone */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-4.5 h-4.5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                    Telephone
                  </p>
                  <p className="text-warm-900 font-medium">
                    {formatPhone(profile.phone)}
                  </p>
                </div>
              </div>

              {/* Email */}
              {profile.email && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                      Email
                    </p>
                    <p className="text-warm-900 font-medium">
                      {profile.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Adresse */}
              {profile.address && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                      Adresse
                    </p>
                    <p className="text-warm-900 font-medium">
                      {profile.address}
                    </p>
                  </div>
                </div>
              )}

              {/* Quartier */}
              {profile.quarter && (
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4.5 h-4.5 text-purple-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-warm-400 uppercase tracking-wider font-medium">
                      Quartier
                    </p>
                    <p className="text-warm-900 font-medium">
                      {profile.quarter}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques commandes */}
          <div className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-50 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-secondary-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-warm-500">Total commandes</p>
                  <p className="text-2xl font-bold text-warm-900">
                    {profile._count.orders}
                  </p>
                </div>
              </div>

              <Link href="/commandes">
                <Button variant="outline" size="sm">
                  Voir mes commandes
                </Button>
              </Link>
            </div>
          </div>

          {/* Lien retour boutique */}
          <div className="text-center pt-2">
            <Link
              href="/produits"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      )}

      {/* Resultat : profil non trouve */}
      {searched && !profile && !error && (
        <div className="bg-white rounded-2xl border border-warm-100 p-8 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Illustration */}
          <div className="w-20 h-20 rounded-full bg-warm-100 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-warm-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-warm-900 mb-2">
            Aucun profil trouve
          </h3>
          <p className="text-warm-500 text-sm mb-6">
            Ce numero n&apos;est associe a aucun compte.
            Passez votre premiere commande pour creer votre profil.
          </p>

          <Link href="/produits">
            <Button variant="primary">
              Decouvrir nos produits
            </Button>
          </Link>
        </div>
      )}

      {/* Etat initial : avant recherche */}
      {!searched && (
        <div className="bg-white rounded-2xl border border-warm-100 p-8 shadow-sm text-center">
          <div className="w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-10 h-10 text-primary-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-warm-800 mb-2">
            Votre profil en un clic
          </h3>
          <p className="text-warm-500 text-sm">
            Entrez votre numero de telephone ci-dessus
            pour retrouver vos informations et vos commandes.
          </p>
        </div>
      )}
    </div>
  )
}
