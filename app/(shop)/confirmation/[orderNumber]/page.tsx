export const dynamic = 'force-dynamic'

import Link from 'next/link'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import { notFound } from 'next/navigation'

// --- Types ---

interface ConfirmationPageProps {
  params: Promise<{ orderNumber: string }>
}

// Libelles des statuts de commande
const statusLabels: Record<string, string> = {
  PENDING: 'En attente de confirmation',
  CONFIRMED: 'Confirmee',
  PREPARING: 'En preparation',
  DELIVERING: 'En cours de livraison',
  DELIVERED: 'Livree',
  CANCELLED: 'Annulee',
}

// Couleurs des badges de statut
const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PREPARING: 'bg-blue-100 text-blue-800',
  DELIVERING: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

// Libelles des methodes de paiement
const paymentLabels: Record<string, string> = {
  MOBILE_MONEY: 'Mobile Money',
  MTN_MOBILE_MONEY: 'MTN Mobile Money',
  MOOV_MONEY: 'Moov Money',
  CELTIS_MONEY: 'Celtis Money',
  CASH_ON_DELIVERY: 'Paiement a la livraison',
}

// --- Timeline de suivi ---

// Etapes de la timeline avec leur statut correspondant
const timelineSteps = [
  { key: 'PENDING', label: 'Recue', icon: 'clipboard' },
  { key: 'CONFIRMED', label: 'Confirmee', icon: 'check' },
  { key: 'PREPARING', label: 'Preparation', icon: 'package' },
  { key: 'DELIVERING', label: 'Livraison', icon: 'truck' },
  { key: 'DELIVERED', label: 'Livree', icon: 'home' },
] as const

/**
 * Determine l'index de l'etape active dans la timeline.
 * Retourne -1 si la commande est annulee.
 */
function getActiveStepIndex(status: string): number {
  if (status === 'CANCELLED') return -1
  const index = timelineSteps.findIndex((step) => step.key === status)
  return index >= 0 ? index : 0
}

/**
 * Renvoie l'icone SVG correspondante a chaque etape de la timeline.
 */
function TimelineIcon({ icon, isActive, isCompleted }: { icon: string; isActive: boolean; isCompleted: boolean }) {
  const color = isActive || isCompleted ? 'text-white' : 'text-warm-400'

  switch (icon) {
    case 'clipboard':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    case 'check':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    case 'package':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      )
    case 'truck':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      )
    case 'home':
      return (
        <svg className={`w-4 h-4 ${color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    default:
      return null
  }
}

// --- Composant Page ---

/**
 * Page de confirmation de commande.
 * Server Component qui affiche les details de la commande apres checkout.
 */
export default async function ConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params

  // Recuperer la commande avec ses articles
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: {
      items: {
        include: {
          product: {
            select: {
              name: true,
              images: true,
            },
          },
        },
      },
    },
  })

  if (!order) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* En-tete de succes */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-secondary-500 mb-2">
            Merci pour votre commande !
          </h1>
          <p className="text-warm-600 font-medium">
            Votre commande a ete bien enregistree avec succes.
          </p>
        </div>

        {/* Bloc de reassurance */}
        <div className="bg-white rounded-2xl border-2 border-green-200 p-6 mb-6 space-y-4">
          <h2 className="text-lg font-bold text-secondary-500 text-center mb-4">
            Et maintenant ?
          </h2>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-secondary-500">Commande enregistree</p>
              <p className="text-sm text-warm-500">Votre commande #{order.orderNumber} est bien prise en compte dans notre systeme.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-secondary-500">Nous vous contactons bientot</p>
              <p className="text-sm text-warm-500">Un membre de notre equipe va vous appeler ou vous ecrire sur <strong>WhatsApp</strong> pour confirmer votre commande et organiser la livraison.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-secondary-500">Livraison rapide</p>
              <p className="text-sm text-warm-500">Votre colis sera livre sous <strong>24h maximum</strong> a {order.quarter}. Gardez votre telephone a portee de main !</p>
            </div>
          </div>
        </div>

        {/* Carte recapitulative */}
        <div className="bg-white rounded-2xl border border-warm-100 overflow-hidden shadow-sm">
          {/* Numero de commande et statut */}
          <div className="bg-primary-50 p-6 text-center">
            <p className="text-sm text-warm-500 mb-1">Numero de commande</p>
            <p className="text-2xl font-bold text-primary-500">
              #{order.orderNumber}
            </p>
            <span
              className={`inline-flex mt-3 px-3 py-1 text-xs font-semibold rounded-full ${
                statusColors[order.status] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[order.status] || order.status}
            </span>
          </div>

          {/* Details client */}
          <div className="p-6 border-b border-warm-100">
            <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
              Informations
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-500">Nom</span>
                <span className="text-secondary-500 font-medium">
                  {order.customerName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Telephone</span>
                <span className="text-secondary-500 font-medium">
                  {order.phone}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Adresse</span>
                <span className="text-secondary-500 font-medium text-right max-w-[60%]">
                  {order.address}, {order.quarter}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Paiement</span>
                <span className="text-secondary-500 font-medium">
                  {paymentLabels[order.paymentMethod] || order.paymentMethod}
                </span>
              </div>
            </div>
          </div>

          {/* Articles commandes */}
          <div className="p-6 border-b border-warm-100">
            <h2 className="text-sm font-semibold text-warm-500 uppercase tracking-wider mb-3">
              Articles
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-500 truncate">
                      {item.product?.name || 'Produit'}
                    </p>
                    <p className="text-xs text-warm-400">
                      {item.quantity} x {formatPrice(item.price)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-secondary-500 ml-4">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Totaux */}
          <div className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-warm-500">Sous-total</span>
                <span className="text-secondary-500">
                  {formatPrice(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-500">Livraison</span>
                <span
                  className={
                    order.deliveryFee === 0 ? 'text-green-600' : 'text-secondary-500'
                  }
                >
                  {order.deliveryFee === 0
                    ? 'Gratuite'
                    : formatPrice(order.deliveryFee)}
                </span>
              </div>
              {order.loyaltyPointsUsed > 0 && (
                <div className="flex justify-between text-amber-600">
                  <span>Points fidelite utilises</span>
                  <span>-{formatPrice(order.loyaltyPointsUsed)}</span>
                </div>
              )}
              <div className="flex justify-between pt-3 border-t border-warm-100">
                <span className="text-lg font-bold text-secondary-500">Total</span>
                <span className="text-lg font-bold text-primary-500">
                  {formatPrice(order.total)}
                </span>
              </div>

              {/* Detail paiement en 2x */}
              {order.isSplitPayment && order.splitFirstAmount && order.splitSecondAmount && (
                <div className="mt-2 p-3 bg-primary-50 rounded-xl space-y-1">
                  <p className="text-xs font-semibold text-primary-700">Paiement en 2 fois</p>
                  <div className="flex justify-between text-xs text-primary-600">
                    <span>1ere partie (payee)</span>
                    <span>{formatPrice(order.splitFirstAmount)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-primary-600">
                    <span>2eme partie (a la livraison)</span>
                    <span>{formatPrice(order.splitSecondAmount)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Points fidelite gagnes */}
        {order.loyaltyPointsEarned > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-bold text-amber-700">
                +{order.loyaltyPointsEarned} points fidelite gagnes !
              </span>
            </div>
            <p className="text-xs text-amber-600">
              Utilisez vos points lors de votre prochain achat pour obtenir des reductions
            </p>
          </div>
        )}

        {/* Indication de livraison */}
        <div className="bg-yellow-50 rounded-2xl p-4 mt-6 text-center">
          <p className="text-sm text-yellow-800 font-medium">
            Livraison sous 24h maximum a {order.quarter}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="mt-8 space-y-3">
          <Link
            href="/"
            className="block w-full text-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl transition-all"
          >
            Continuer mes achats
          </Link>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'}?text=${encodeURIComponent(`Bonjour, je souhaite suivre ma commande #${order.orderNumber}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-green-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-green-500/25 hover:bg-green-600 transition-all"
          >
            Suivre via WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}

// Metadata dynamique
export async function generateMetadata({ params }: ConfirmationPageProps) {
  const { orderNumber } = await params
  return {
    title: `Commande #${orderNumber} | TOKOSSA`,
    description: 'Votre commande a bien ete enregistree.',
    robots: { index: false, follow: false },
  }
}
