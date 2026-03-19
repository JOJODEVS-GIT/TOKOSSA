'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { formatPrice } from '@/lib/utils'
import Button from '@/components/ui/Button'

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal, clearCart } =
    useCartStore()

  const total = subtotal()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart()
        return
      }
      if (e.key === 'Tab' && isOpen) {
        const drawerEl = document.querySelector('[role="dialog"]') as HTMLElement
        if (!drawerEl) return
        const focusable = Array.from(
          drawerEl.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(el => !el.hasAttribute('disabled'))
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, closeCart])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer */}
      <div role="dialog" aria-modal="true" aria-label="Panier" className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-warm-100">
          <h2 className="text-lg font-bold text-secondary-500">
            Panier ({items.length} article{items.length > 1 ? 's' : ''})
          </h2>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-warm-100 rounded-xl transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5 text-warm-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 mx-auto text-warm-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <p className="text-warm-500 mb-4">Votre panier est vide</p>
              <Button variant="primary" onClick={closeCart}>
                Continuer mes achats
              </Button>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4 p-3 bg-warm-50 rounded-2xl border border-warm-100">
                  {/* Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-warm-200">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produits/${item.slug}`}
                      className="font-medium text-secondary-500 hover:text-primary-500 line-clamp-2 text-sm"
                      onClick={closeCart}
                    >
                      {item.name}
                    </Link>

                    <p className="text-primary-500 font-bold mt-1">
                      {formatPrice(item.price)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-11 h-11 flex items-center justify-center bg-warm-100 rounded-xl hover:bg-warm-200 transition-colors"
                        aria-label="Diminuer"
                      >
                        <svg className="w-4 h-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-8 text-center font-bold text-secondary-500">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="w-11 h-11 flex items-center justify-center bg-warm-100 rounded-xl hover:bg-warm-200 transition-colors disabled:opacity-50"
                        aria-label="Augmenter"
                      >
                        <svg className="w-4 h-4 text-secondary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-auto p-2 text-warm-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Supprimer"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-warm-100 p-4 space-y-4 safe-bottom">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-warm-500 font-medium">Sous-total</span>
              <span className="text-2xl font-bold text-secondary-500">{formatPrice(total)}</span>
            </div>

            <p className="text-sm text-warm-400">
              Frais de livraison calcules au checkout
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Link href="/checkout" onClick={closeCart}>
                <Button variant="primary" className="w-full">
                  Commander ({formatPrice(total)})
                </Button>
              </Link>

              <button
                onClick={clearCart}
                className="w-full text-xs text-warm-400 hover:text-red-500 py-2 transition-colors"
              >
                Vider le panier
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
