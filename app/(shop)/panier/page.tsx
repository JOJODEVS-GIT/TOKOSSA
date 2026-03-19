'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

// --- Icones SVG inline ---

/** Icone panier vide */
function ShoppingBagIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
      />
    </svg>
  )
}

/** Icone corbeille (supprimer article) */
function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  )
}

/** Icone cadenas (paiement securise) */
function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  )
}

/** Icone camion (livraison) */
function TruckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2-1h7zm0 0l6-3m-6 3v4m6-7v7m0 0H7m12 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0m-9 0a2 2 0 11-4 0m4 0a2 2 0 10-4 0"
      />
    </svg>
  )
}

/** Icone carte bancaire / mobile money */
function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  )
}

/** Icone moins */
function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  )
}

/** Icone plus */
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  )
}

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore()
  const total = subtotal()

  // Redirect si panier vide
  useEffect(() => {
    if (items.length === 0) {
      // Pas de redirect immediat pour permettre d'afficher le message
    }
  }, [items])

  // --- Etat vide ---
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-warm-50 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBagIcon className="w-24 h-24 mx-auto text-warm-300 mb-6" />
          <h1 className="text-3xl font-bold tracking-tight text-secondary-500 mb-2">
            Votre panier est vide
          </h1>
          <p className="text-warm-500 mb-6">
            Decouvrez nos produits et commencez vos achats
          </p>
          <Link href="/produits">
            <Button variant="primary" size="lg">
              Voir les produits
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // --- Panier avec articles ---
  return (
    <div className="min-h-screen bg-warm-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold tracking-tight text-secondary-500 mb-6">
          Mon Panier
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Liste des articles */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 flex gap-4 border border-warm-100 hover:border-warm-200 transition-colors"
              >
                {/* Image */}
                <Link
                  href={`/produits/${item.slug}`}
                  className="relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden bg-warm-100"
                >
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/produits/${item.slug}`}
                    className="font-medium text-secondary-500 hover:text-primary-500 line-clamp-2"
                  >
                    {item.name}
                  </Link>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-primary-500 font-semibold">
                      {formatPrice(item.price)}
                    </span>
                    {item.oldPrice && (
                      <span className="text-sm text-warm-400 line-through">
                        {formatPrice(item.oldPrice)}
                      </span>
                    )}
                  </div>

                  {/* Controles de quantite */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-warm-100 rounded-xl hover:bg-warm-200 transition-colors"
                        aria-label="Diminuer la quantite"
                      >
                        <MinusIcon className="w-4 h-4 text-warm-600" />
                      </button>
                      <span className="w-8 text-center font-medium text-secondary-500">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-8 h-8 flex items-center justify-center bg-warm-100 rounded-xl hover:bg-warm-200 transition-colors disabled:opacity-50"
                        aria-label="Augmenter la quantite"
                      >
                        <PlusIcon className="w-4 h-4 text-warm-600" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-semibold text-secondary-500">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="hover:text-red-500 hover:bg-red-50 rounded-xl p-2 text-warm-400 transition-colors"
                        aria-label="Supprimer"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Vider le panier */}
            <button
              onClick={clearCart}
              className="text-sm text-warm-500 hover:text-red-500 transition-colors"
            >
              Vider le panier
            </button>
          </div>

          {/* Recapitulatif commande */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 shadow-lg shadow-primary-500/5 sticky top-24">
              <h2 className="text-lg font-semibold text-secondary-500 mb-4">
                Recapitulatif
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-warm-500">
                    Sous-total ({items.length} article{items.length > 1 ? 's' : ''})
                  </span>
                  <span className="font-medium text-secondary-500">
                    {formatPrice(total)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-warm-500">Livraison</span>
                  <span className="text-green-600 font-medium">
                    {total >= 5000 ? 'Gratuite' : 'Calculee au checkout'}
                  </span>
                </div>
              </div>

              <div className="border-t border-warm-100 mt-4 pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-bold text-secondary-500">Total</span>
                  <span className="text-2xl font-bold text-primary-500">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6">
                <Button variant="primary" size="lg" className="w-full">
                  Passer la commande
                </Button>
              </Link>

              <Link href="/produits" className="block mt-3">
                <Button variant="ghost" className="w-full">
                  Continuer mes achats
                </Button>
              </Link>

              {/* Badges de confiance */}
              <div className="mt-6 pt-6 border-t border-warm-100">
                <div className="flex flex-wrap gap-3 text-xs text-warm-500">
                  <span className="flex items-center gap-1.5">
                    <LockIcon className="w-4 h-4 text-warm-400" />
                    Paiement securise
                  </span>
                  <span className="flex items-center gap-1.5">
                    <TruckIcon className="w-4 h-4 text-warm-400" />
                    Livraison 24h
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CreditCardIcon className="w-4 h-4 text-warm-400" />
                    MTN / Moov / Cash
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
