'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { formatPrice, cn } from '@/lib/utils'

/** Liens de navigation desktop */
const navLinks = [
  { href: '/', label: 'Accueil' },
  { href: '/produits', label: 'Produits' },
  { href: '/commandes', label: 'Suivi commande' },
]

/**
 * Type pour un resultat de recherche retourne par l'API /api/search.
 */
interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  images: string[]
  category: string
}

export default function Navbar() {
  const { openCart, totalItems } = useCartStore()
  const router = useRouter()
  const pathname = usePathname()

  // Differer le compteur panier pour eviter le mismatch d'hydratation SSR/client
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const itemCount = mounted ? totalItems() : 0

  // States pour la recherche
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  // State pour l'overlay de recherche mobile
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const mobileSearchInputRef = useRef<HTMLInputElement>(null)

  // Ref pour detecter les clics en dehors du dropdown
  const searchContainerRef = useRef<HTMLDivElement>(null)

  // Debounce : fetch les resultats apres 300ms d'inactivite
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    setIsSearching(true)
    const debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
          setShowResults(true)
        }
      } catch {
        // Erreur reseau : on ne montre rien
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Auto-focus sur l'input mobile quand l'overlay s'ouvre
  useEffect(() => {
    if (showMobileSearch && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus()
    }
  }, [showMobileSearch])

  // Fermer la recherche mobile quand on navigue
  useEffect(() => {
    setShowMobileSearch(false)
  }, [pathname])

  // Soumission du formulaire de recherche (Enter)
  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (searchQuery.trim()) {
        setShowResults(false)
        router.push(`/produits?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    },
    [searchQuery, router]
  )

  // Click sur un resultat
  const handleResultClick = useCallback(() => {
    setShowResults(false)
    setSearchQuery('')
    setShowMobileSearch(false)
  }, [])

  return (
    <header className="sticky top-0 z-40 glass border-b border-warm-100 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo bicolore */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-secondary-500">TO</span>
              <span className="text-primary-500">KOSSA</span>
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 ml-6">
            {navLinks.map((link) => {
              const isActive = link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href.split('?')[0]) && link.href !== '/'
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'text-primary-500 bg-primary-50'
                      : 'text-warm-600 hover:text-secondary-500 hover:bg-warm-50'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Search - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchContainerRef}>
            <div className="relative w-full">
              <form onSubmit={handleSearchSubmit}>
                <input
                  type="search"
                  placeholder="Rechercher un produit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) setShowResults(true)
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-warm-50 rounded-2xl text-sm border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all"
                />
              </form>
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Indicateur de chargement */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}

              {/* Dropdown resultats de recherche */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-warm-100 overflow-hidden z-50 max-h-[400px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produits/${product.slug}`}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors border-b border-warm-50 last:border-0"
                    >
                      {/* Image miniature */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-warm-100 flex-shrink-0">
                        <Image
                          src={product.images[0] || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>

                      {/* Infos produit */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-500 truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-sm font-bold text-primary-500">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-xs text-warm-400">
                            {product.category}
                          </span>
                        </div>
                      </div>

                      {/* Fleche */}
                      <svg className="w-4 h-4 text-warm-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}

                  {/* Lien voir tous les resultats */}
                  <Link
                    href={`/produits?search=${encodeURIComponent(searchQuery)}`}
                    onClick={handleResultClick}
                    className="block px-4 py-3 text-center text-sm font-medium text-primary-500 hover:bg-primary-50 transition-colors bg-warm-50/50"
                  >
                    Voir tous les resultats
                  </Link>
                </div>
              )}

              {/* Message aucun resultat */}
              {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/10 border border-warm-100 overflow-hidden z-50">
                  <div className="px-4 py-6 text-center">
                    <svg className="w-10 h-10 mx-auto text-warm-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-sm text-warm-500">
                      Aucun produit trouve pour &laquo;{searchQuery}&raquo;
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Bouton loupe recherche - Mobile uniquement */}
            <button
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2.5 hover:bg-warm-100 rounded-xl transition-colors"
              aria-label="Rechercher"
            >
              <svg
                className="w-6 h-6 text-secondary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* WhatsApp - Desktop */}
            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-2 text-sm text-warm-600 hover:text-green-600 transition-colors"
            >
              <span className="relative">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white" />
              </span>
              <span className="font-medium">Assistance</span>
            </a>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative p-2.5 hover:bg-warm-100 rounded-xl transition-colors"
              aria-label="Panier"
            >
              <svg
                className="w-6 h-6 text-secondary-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[20px] h-5 flex items-center justify-center bg-primary-500 text-white text-[11px] font-bold rounded-full px-1">
                  {itemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Overlay de recherche mobile */}
      {showMobileSearch && (
        <div className="md:hidden fixed inset-0 z-50 bg-white animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-warm-100">
            {/* Formulaire de recherche mobile */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <input
                ref={mobileSearchInputRef}
                type="search"
                placeholder="Rechercher un produit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-warm-50 rounded-2xl text-sm border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 focus:bg-white transition-all"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-warm-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>

              {/* Indicateur de chargement */}
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </form>

            {/* Bouton fermer */}
            <button
              onClick={() => {
                setShowMobileSearch(false)
                setShowResults(false)
                setSearchQuery('')
              }}
              className="p-2.5 hover:bg-warm-100 rounded-xl transition-colors flex-shrink-0"
              aria-label="Fermer la recherche"
            >
              <svg
                className="w-6 h-6 text-warm-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Resultats de recherche mobile */}
          <div className="overflow-y-auto max-h-[calc(100vh-64px)]">
            {showResults && searchResults.length > 0 && (
              <div>
                {searchResults.map((product) => (
                  <Link
                    key={product.id}
                    href={`/produits/${product.slug}`}
                    onClick={handleResultClick}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-warm-50 transition-colors border-b border-warm-50"
                  >
                    {/* Image miniature */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-warm-100 flex-shrink-0">
                      <Image
                        src={product.images[0] || '/images/placeholder.jpg'}
                        alt={product.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>

                    {/* Infos produit */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-secondary-500 truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm font-bold text-primary-500">
                          {formatPrice(product.price)}
                        </span>
                        <span className="text-xs text-warm-400">
                          {product.category}
                        </span>
                      </div>
                    </div>

                    {/* Fleche */}
                    <svg className="w-4 h-4 text-warm-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}

                {/* Lien voir tous les resultats */}
                <Link
                  href={`/produits?search=${encodeURIComponent(searchQuery)}`}
                  onClick={handleResultClick}
                  className="block px-4 py-3 text-center text-sm font-medium text-primary-500 hover:bg-primary-50 transition-colors bg-warm-50/50"
                >
                  Voir tous les resultats
                </Link>
              </div>
            )}

            {/* Message aucun resultat */}
            {showResults && searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <div className="px-4 py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-warm-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-warm-500">
                  Aucun produit trouve pour &laquo;{searchQuery}&raquo;
                </p>
              </div>
            )}

            {/* Etat initial : suggestion */}
            {!showResults && searchQuery.length < 2 && (
              <div className="px-4 py-12 text-center">
                <svg className="w-12 h-12 mx-auto text-warm-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-sm text-warm-400">
                  Tapez au moins 2 caracteres pour rechercher
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
