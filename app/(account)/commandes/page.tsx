'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, formatPhone, isValidBeninPhone, generateWhatsAppLink } from '@/lib/utils'
import { useCartStore } from '@/lib/store'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

// ─── Types ───────────────────────────────────────────────────────────────────

/** Statuts possibles d'une commande */
type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

/** Produit rattache a un item de commande */
interface OrderProduct {
  id: string
  name: string
  slug: string
  images: string[]
  price: number
  stock: number
}

/** Item de commande (ligne produit + quantite) */
interface OrderItem {
  id: string
  quantity: number
  price: number
  product: OrderProduct
}

/** Commande complete retournee par l'API */
interface Order {
  id: string
  orderNumber: string
  status: OrderStatus
  total: number
  createdAt: string
  items: OrderItem[]
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/** Etapes de la timeline de commande dans l'ordre chronologique */
const TIMELINE_STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING', label: 'En attente' },
  { status: 'CONFIRMED', label: 'Confirmee' },
  { status: 'PREPARING', label: 'Preparation' },
  { status: 'DELIVERING', label: 'Livraison' },
  { status: 'DELIVERED', label: 'Livree' },
]

/** Labels d'affichage pour chaque statut */
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmee',
  PREPARING: 'En preparation',
  DELIVERING: 'En livraison',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
}

/** Variantes de badge pour chaque statut */
const STATUS_BADGE_VARIANT: Record<OrderStatus, 'default' | 'warning' | 'success' | 'danger'> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  PREPARING: 'default',
  DELIVERING: 'default',
  DELIVERED: 'success',
  CANCELLED: 'danger',
}

// ─── Composant Timeline ──────────────────────────────────────────────────────

/**
 * Timeline visuelle du statut de commande.
 * Affiche des cercles connectes par des lignes,
 * colores selon la progression.
 */
function OrderTimeline({ status }: { status: OrderStatus }) {
  // Les commandes annulees n'ont pas de timeline
  if (status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-2 py-3 px-4 bg-red-50 rounded-xl">
        <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span className="text-sm text-red-600 font-medium">
          Commande annulee
        </span>
      </div>
    )
  }

  const currentIndex = TIMELINE_STEPS.findIndex((step) => step.status === status)

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Ligne de fond (grise) */}
        <div className="absolute top-[14px] left-[14px] right-[14px] h-[2px] bg-warm-200" />

        {/* Ligne de progression (coloree) */}
        {currentIndex > 0 && (
          <div
            className="absolute top-[14px] left-[14px] h-[2px] bg-primary-500 transition-all duration-500"
            style={{
              width: `calc(${(currentIndex / (TIMELINE_STEPS.length - 1)) * 100}% - 28px)`,
            }}
          />
        )}

        {/* Etapes */}
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={step.status} className="flex flex-col items-center z-10">
              {/* Cercle */}
              <div
                className={`
                  w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    isCurrent
                      ? 'bg-primary-500 border-primary-500 text-white ring-4 ring-primary-100'
                      : isCompleted
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-white border-warm-300 text-warm-300'
                  }
                `}
              >
                {isCompleted ? (
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-current" />
                )}
              </div>

              {/* Label */}
              <span
                className={`
                  mt-2 text-[10px] leading-tight text-center max-w-[60px]
                  ${isCurrent ? 'font-bold text-primary-600' : isCompleted ? 'font-medium text-warm-600' : 'text-warm-400'}
                `}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Composant Carte Commande ────────────────────────────────────────────────

/** Carte individuelle pour une commande */
function OrderCard({ order }: { order: Order }) {
  const { addItem } = useCartStore()

  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS ?? '22901000000'

  /** Recomander tous les articles de cette commande */
  const handleReorder = () => {
    for (const item of order.items) {
      addItem(
        {
          id: item.product.id,
          name: item.product.name,
          slug: item.product.slug,
          price: item.product.price,
          image: item.product.images[0] ?? '/placeholder.webp',
          stock: item.product.stock,
        },
        item.quantity
      )
    }
  }

  /** Formater la date de commande */
  const formattedDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-warm-100 shadow-sm overflow-hidden">
      {/* En-tete : numero + statut + date */}
      <div className="px-5 pt-5 pb-3">
        <div className="flex items-start justify-between mb-1">
          <div>
            <p className="text-xs text-warm-400 uppercase tracking-wider font-medium">
              Commande
            </p>
            <p className="text-lg font-bold text-warm-900">
              #{order.orderNumber}
            </p>
          </div>
          <Badge variant={STATUS_BADGE_VARIANT[order.status]}>
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>
        <p className="text-xs text-warm-400">{formattedDate}</p>
      </div>

      {/* Timeline visuelle */}
      <div className="px-5">
        <OrderTimeline status={order.status} />
      </div>

      {/* Separateur */}
      <div className="mx-5 border-t border-warm-100" />

      {/* Articles */}
      <div className="px-5 py-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3">
            {/* Image produit */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-warm-100 flex-shrink-0">
              <Image
                src={item.product.images[0] ?? '/placeholder.webp'}
                alt={item.product.name}
                fill
                sizes="56px"
                className="object-cover"
              />
              {/* Badge quantite */}
              {item.quantity > 1 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-primary-500 text-white text-[10px] font-bold rounded-full px-1">
                  x{item.quantity}
                </span>
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-warm-900 truncate">
                {item.product.name}
              </p>
              <p className="text-xs text-warm-400">
                {formatPrice(item.price)} x {item.quantity}
              </p>
            </div>

            {/* Sous-total */}
            <p className="text-sm font-semibold text-warm-700 flex-shrink-0">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mx-5 border-t border-warm-100" />
      <div className="px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-medium text-warm-500">Total</span>
        <span className="text-xl font-bold text-primary-600">
          {formatPrice(order.total)}
        </span>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex gap-3">
        {/* Bouton Racheter */}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={handleReorder}
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Racheter
        </Button>

        {/* Bouton WhatsApp */}
        <a
          href={generateWhatsAppLink(
            whatsappNumber,
            `Bonjour TOKOSSA, j'ai une question sur ma commande #${order.orderNumber}`
          )}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <Button variant="whatsapp" size="sm" className="w-full">
            <svg
              className="w-4 h-4 mr-1.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contacter
          </Button>
        </a>
      </div>
    </div>
  )
}

// ─── Page Principale ─────────────────────────────────────────────────────────

/**
 * Page de suivi des commandes.
 * Le client recherche ses commandes par numero de telephone.
 * Affiche une timeline visuelle et permet de re-commander.
 */
export default function CommandesPage() {
  const [phone, setPhone] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Formater le numero pendant la saisie (espaces automatiques)
  const handlePhoneChange = useCallback((value: string) => {
    const digits = value.replace(/\D/g, '')
    const limited = digits.slice(0, 10)

    let formatted = ''
    for (let i = 0; i < limited.length; i++) {
      if (i > 0 && i % 2 === 0) formatted += ' '
      formatted += limited[i]
    }

    setPhone(formatted)
    setError(null)
  }, [])

  // Rechercher les commandes par telephone
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
        `/api/commandes?phone=${encodeURIComponent('+229' + cleanPhone)}`
      )

      if (response.ok) {
        const data: Order[] = await response.json()
        setOrders(data)
      } else {
        setOrders([])
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
        <div className="w-12 h-12 rounded-2xl bg-secondary-50 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-secondary-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-warm-900">Mes Commandes</h1>
          <p className="text-sm text-warm-500">Suivez vos achats en temps reel</p>
        </div>
      </div>

      {/* Formulaire de recherche */}
      <div className="bg-white rounded-2xl border border-warm-100 p-6 shadow-sm mb-6">
        <p className="text-warm-600 text-sm mb-4">
          Entrez votre numero de telephone pour retrouver vos commandes
        </p>

        <form onSubmit={handleSearch}>
          <div className="mb-4">
            <label
              htmlFor="phone-search"
              className="block text-sm font-medium text-warm-700 mb-2"
            >
              Numero de telephone
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400 text-sm font-medium">
                +229
              </span>
              <input
                id="phone-search"
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
            Rechercher mes commandes
          </Button>
        </form>
      </div>

      {/* Etat initial : placeholder avant recherche */}
      {!searched && !isLoading && (
        <div className="bg-white rounded-2xl border border-warm-100 p-8 shadow-sm text-center">
          {/* Illustration SVG */}
          <div className="w-32 h-32 mx-auto mb-6">
            <svg viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Boite/colis stylise */}
              <rect x="24" y="44" width="80" height="60" rx="6" fill="#FEF3E7" stroke="#ED7420" strokeWidth="2" />
              <path d="M24 56h80" stroke="#ED7420" strokeWidth="2" />
              <rect x="52" y="44" width="24" height="12" rx="2" fill="#ED7420" fillOpacity="0.2" stroke="#ED7420" strokeWidth="2" />
              {/* Ruban */}
              <path d="M64 56v48" stroke="#ED7420" strokeWidth="2" strokeDasharray="4 4" />
              {/* Etoiles decoratives */}
              <circle cx="96" cy="32" r="3" fill="#6366F1" fillOpacity="0.3" />
              <circle cx="32" cy="36" r="2" fill="#ED7420" fillOpacity="0.4" />
              <circle cx="108" cy="52" r="2" fill="#6366F1" fillOpacity="0.2" />
              {/* Loupe */}
              <circle cx="100" cy="24" r="10" stroke="#6366F1" strokeWidth="2.5" fill="white" fillOpacity="0.8" />
              <path d="M107 31l6 6" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-warm-800 mb-2">
            Retrouvez vos commandes
          </h3>
          <p className="text-warm-500 text-sm leading-relaxed">
            Entrez votre numero de telephone ci-dessus pour voir
            l&apos;etat de vos commandes et suivre vos livraisons.
          </p>
        </div>
      )}

      {/* Resultats : commandes trouvees */}
      {searched && orders.length > 0 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Compteur */}
          <p className="text-sm text-warm-500">
            {orders.length} commande{orders.length > 1 ? 's' : ''} trouvee{orders.length > 1 ? 's' : ''}
          </p>

          {/* Liste des commandes */}
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}

          {/* Lien retour boutique */}
          <div className="text-center pt-4 pb-2">
            <Link
              href="/produits"
              className="text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
            >
              Continuer mes achats
            </Link>
          </div>
        </div>
      )}

      {/* Resultats : aucune commande */}
      {searched && orders.length === 0 && !error && (
        <div className="bg-white rounded-2xl border border-warm-100 p-8 shadow-sm text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Illustration panier vide */}
          <div className="w-24 h-24 mx-auto mb-6">
            <svg viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Panier */}
              <path d="M20 32h56l-8 36H28L20 32z" fill="#FEF3E7" stroke="#ED7420" strokeWidth="2" />
              <path d="M20 32l-4-12h-4" stroke="#ED7420" strokeWidth="2" strokeLinecap="round" />
              {/* Roues */}
              <circle cx="34" cy="76" r="5" fill="white" stroke="#ED7420" strokeWidth="2" />
              <circle cx="62" cy="76" r="5" fill="white" stroke="#ED7420" strokeWidth="2" />
              {/* Visage triste */}
              <circle cx="40" cy="48" r="2" fill="#ED7420" fillOpacity="0.5" />
              <circle cx="56" cy="48" r="2" fill="#ED7420" fillOpacity="0.5" />
              <path d="M42 56a6 6 0 0112 0" stroke="#ED7420" strokeWidth="2" strokeLinecap="round" transform="rotate(180 48 56)" />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-warm-900 mb-2">
            Aucune commande trouvee
          </h3>
          <p className="text-warm-500 text-sm mb-6 leading-relaxed">
            Ce numero n&apos;est associe a aucune commande.
            Decouvrez nos produits et passez votre premiere commande !
          </p>

          <Link href="/produits">
            <Button variant="primary">
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Decouvrir nos produits
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
