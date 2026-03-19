'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Script from 'next/script'
import { useCartStore } from '@/lib/store'
import { formatPrice, QUARTIERS_COTONOU, getDeliveryFee, isValidBeninPhone } from '@/lib/utils'
import Button from '@/components/ui/Button'
import dynamic from 'next/dynamic'
import { cloudinaryPresets } from '@/lib/cloudinary'

const KKiapayPayment = dynamic(() => import('@/components/checkout/KKiapayButton'), {
  ssr: false,
})
import * as fbpixel from '@/lib/fbpixel'

type PaymentMethod = 'MTN_MOBILE_MONEY' | 'MOOV_MONEY' | 'CELTIS_MONEY' | 'CASH_ON_DELIVERY'

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  )
}

function BanknoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  )
}

function PaymentIcon({ type, className }: { type: 'phone' | 'banknote'; className?: string }) {
  if (type === 'banknote') return <BanknoteIcon className={className} />
  return <PhoneIcon className={className} />
}

const paymentMethods = [
  { id: 'MTN_MOBILE_MONEY' as const, name: 'MTN Mobile Money', icon: 'phone' as const, description: 'Paiement instantane via MTN MoMo' },
  { id: 'MOOV_MONEY' as const, name: 'Moov Money', icon: 'phone' as const, description: 'Paiement instantane via Moov Money' },
  { id: 'CELTIS_MONEY' as const, name: 'Celtis Money', icon: 'phone' as const, description: 'Paiement instantane via Celtis Money' },
  { id: 'CASH_ON_DELIVERY' as const, name: 'Paiement a la livraison', icon: 'banknote' as const, description: 'Payez en especes lors de la reception' },
]

// --- Indicateur de progression ---

interface ProgressStepProps {
  stepNumber: number
  label: string
  isActive: boolean
  isCompleted: boolean
}

function ProgressStep({ stepNumber, label, isActive, isCompleted }: ProgressStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
          isActive
            ? 'bg-primary-500 text-white shadow-md shadow-primary-500/30'
            : isCompleted
              ? 'bg-primary-200 text-primary-700'
              : 'bg-warm-200 text-warm-500'
        }`}
      >
        {stepNumber}
      </div>
      <span
        className={`text-xs mt-1.5 font-medium ${
          isActive ? 'text-primary-500' : isCompleted ? 'text-primary-600' : 'text-warm-400'
        }`}
      >
        {label}
      </span>
    </div>
  )
}

function CheckoutProgress() {
  const steps = [
    { number: 1, label: 'Panier', completed: true, active: false },
    { number: 2, label: 'Livraison', completed: true, active: false },
    { number: 3, label: 'Paiement', completed: false, active: true },
  ]

  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <ProgressStep
            stepNumber={step.number}
            label={step.label}
            isActive={step.active}
            isCompleted={step.completed}
          />
          {/* Ligne de connexion entre les etapes */}
          {index < steps.length - 1 && (
            <div
              className={`w-16 sm:w-24 h-0.5 mx-2 ${
                steps[index + 1].completed || steps[index + 1].active
                  ? 'bg-primary-300'
                  : 'bg-warm-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, subtotal, clearCart } = useCartStore()
  const [isLoading, setIsLoading] = useState(false)
  const [isOrderComplete, setIsOrderComplete] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Etats pour le paiement mobile money via KKiaPay
  const [showPayment, setShowPayment] = useState(false)
  const [orderData, setOrderData] = useState<{
    id: string
    orderNumber: string
    total: number
  } | null>(null)

  // Code promo
  const [promoCode, setPromoCode] = useState('')
  const [promoDiscount, setPromoDiscount] = useState(0)
  const [promoLabel, setPromoLabel] = useState('')
  const [promoApplied, setPromoApplied] = useState(false)
  const [promoLoading, setPromoLoading] = useState(false)
  const [promoError, setPromoError] = useState('')

  // Programme de fidelite
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [loyaltyDiscount, setLoyaltyDiscount] = useState(0)
  const [loyaltyApplied, setLoyaltyApplied] = useState(false)
  const [loyaltyLoading, setLoyaltyLoading] = useState(false)

  // Paiement en 2x
  const [isSplitPayment, setIsSplitPayment] = useState(false)

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    quarter: '',
    notes: '',
    paymentMethod: 'MTN_MOBILE_MONEY' as PaymentMethod,
  })

  const cartSubtotal = subtotal()
  const deliveryFee = formData.quarter ? getDeliveryFee(formData.quarter) : 0
  const total = cartSubtotal + deliveryFee - promoDiscount - loyaltyDiscount
  const pointsToEarn = Math.floor(total / 100)
  // Split payment : 60% maintenant, 40% a la livraison (aligne avec le backend)
  const splitFirst = isSplitPayment ? Math.ceil(total * 0.6) : total
  const splitSecond = isSplitPayment ? total - splitFirst : 0

  // FB Pixel : InitiateCheckout quand la page se charge
  useEffect(() => {
    if (items.length > 0) {
      fbpixel.initiateCheckout(
        items.map((item) => ({ id: item.id, price: item.price, quantity: item.quantity })),
        cartSubtotal
      )
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /** Valider un code promo */
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) return
    setPromoLoading(true)
    setPromoError('')

    try {
      const res = await fetch('/api/promos/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, orderTotal: cartSubtotal }),
      })
      const data = await res.json()

      if (res.ok && data.valid) {
        setPromoDiscount(data.discount)
        setPromoLabel(data.label)
        setPromoApplied(true)
      } else {
        setPromoError(data.error || 'Code invalide')
        setPromoDiscount(0)
        setPromoApplied(false)
      }
    } catch {
      setPromoError('Erreur de connexion')
    } finally {
      setPromoLoading(false)
    }
  }

  /** Retirer le code promo */
  const handleRemovePromo = () => {
    setPromoCode('')
    setPromoDiscount(0)
    setPromoLabel('')
    setPromoApplied(false)
    setPromoError('')
  }

  /** Charger les points de fidelite quand le telephone change */
  const fetchLoyaltyPoints = useCallback(async (phone: string) => {
    if (!isValidBeninPhone(phone)) return
    setLoyaltyLoading(true)
    try {
      const res = await fetch(`/api/loyalty?phone=${phone}`)
      if (res.ok) {
        const data = await res.json()
        setLoyaltyPoints(data.points || 0)
      }
    } catch { /* ignore */ }
    finally { setLoyaltyLoading(false) }
  }, [])

  /** Appliquer les points de fidelite */
  const handleApplyLoyalty = () => {
    if (loyaltyPoints < 500) return
    const maxDiscount = Math.min(loyaltyPoints, total + loyaltyDiscount) // Ne pas depasser le total
    setLoyaltyDiscount(maxDiscount)
    setLoyaltyApplied(true)
  }

  /** Retirer les points de fidelite */
  const handleRemoveLoyalty = () => {
    setLoyaltyDiscount(0)
    setLoyaltyApplied(false)
  }

  // Rediriger si panier vide (sauf si commande completee — evite la redirection avant /confirmation)
  if (items.length === 0 && !isOrderComplete) {
    router.push('/panier')
    return null
  }

  // Capturer le panier abandonne quand le client quitte le champ telephone
  const captureAbandonedCart = useCallback(() => {
    if (formData.phone && isValidBeninPhone(formData.phone) && items.length > 0) {
      fetch('/api/cart/abandon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email || undefined,
          customerName: formData.customerName || undefined,
          items: items.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
          subtotal: cartSubtotal,
          quarter: formData.quarter || undefined,
        }),
      }).catch(() => {})
    }
  }, [formData.phone, formData.email, formData.customerName, formData.quarter, items, cartSubtotal])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Effacer l'erreur quand l'utilisateur tape
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Le nom est requis'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le telephone est requis'
    } else if (!isValidBeninPhone(formData.phone)) {
      newErrors.phone = 'Numero de telephone invalide'
    }

    if (!formData.address.trim()) {
      newErrors.address = "L'adresse est requise"
    }

    if (!formData.quarter) {
      newErrors.quarter = 'Le quartier est requis'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      // Creer la commande
      const response = await fetch('/api/commandes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: items.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: cartSubtotal,
          deliveryFee,
          total,
          // Fidelite
          loyaltyPointsUsed: loyaltyApplied ? loyaltyDiscount : 0,
          loyaltyDiscount: loyaltyApplied ? loyaltyDiscount : 0,
          // Paiement en 2x
          isSplitPayment: isSplitPayment && formData.paymentMethod !== 'CASH_ON_DELIVERY',
          splitFirstAmount: isSplitPayment ? splitFirst : undefined,
          splitSecondAmount: isSplitPayment ? splitSecond : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la creation de la commande')
      }

      // Marquer le panier abandonne comme recovered
      fetch('/api/cart/abandon', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formData.phone }),
      }).catch(() => {})

      if (formData.paymentMethod === 'CASH_ON_DELIVERY') {
        // Paiement a la livraison : notification WhatsApp + vider panier + redirection
        fetch('/api/notifications/commande', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: data.id,
            orderNumber: data.orderNumber,
          }),
        }).catch(console.error)

        // Points de fidelite credites automatiquement cote serveur (dans la transaction)

        // FB Pixel : Purchase
        fbpixel.purchase(
          data.orderNumber,
          total,
          items.map((item) => ({ id: item.id, price: item.price, quantity: item.quantity }))
        )

        setIsOrderComplete(true)
        clearCart()
        router.push(`/confirmation/${data.orderNumber}`)
      } else {
        // Paiement mobile money : afficher la modale KKiaPay
        // Si paiement en 2x, on ne paye que la 1ere partie maintenant
        const amountToPay = isSplitPayment ? splitFirst : (data.total || total)
        setOrderData({
          id: data.id,
          orderNumber: data.orderNumber,
          total: amountToPay,
        })
        setShowPayment(true)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setErrors({ submit: 'Une erreur est survenue. Veuillez reessayer.' })
    } finally {
      setIsLoading(false)
    }
  }

  /** Callback appele quand le paiement KKiaPay est reussi */
  const onPaymentSuccess = (transactionId: string) => {
    // Notifier le serveur du paiement reussi (le webhook s'en charge aussi)
    if (orderData) {
      fetch('/api/paiement/confirmer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderData.id,
          transactionId,
        }),
      }).catch(console.error)

      // Points de fidelite credites automatiquement cote serveur (webhook)

      // FB Pixel : Purchase
      fbpixel.purchase(
        orderData.orderNumber,
        orderData.total,
        items.map((item) => ({ id: item.id, price: item.price, quantity: item.quantity }))
      )
    }

    setIsOrderComplete(true)
    clearCart()
    setShowPayment(false)

    if (orderData) {
      router.push(`/confirmation/${orderData.orderNumber}`)
    }
  }

  return (
    <div className="min-h-screen bg-warm-50">
      <div className="container mx-auto px-4 py-8">
        {/* Titre de la page */}
        <h1 className="text-3xl font-bold tracking-tight text-secondary-500 mb-6">
          Finaliser la commande
        </h1>

        {/* Indicateur de progression */}
        <CheckoutProgress />

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Formulaire */}
            <div className="lg:col-span-2 space-y-6">
              {/* Informations de contact */}
              <div className="bg-white rounded-2xl p-6 border border-warm-100">
                <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                  Vos informations
                </h2>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      autoComplete="name"
                      value={formData.customerName}
                      onChange={handleChange}
                      className={`form-input ${errors.customerName ? 'border-red-500' : ''}`}
                      placeholder="Ex: Kevin Adjanou"
                    />
                    {errors.customerName && (
                      <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Telephone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={() => {
                        captureAbandonedCart()
                        fetchLoyaltyPoints(formData.phone)
                      }}
                      className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                      placeholder="Ex: 01 90 00 00 00"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Email (optionnel)
                    </label>
                    <input
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Ex: kevin@email.com"
                    />
                  </div>
                </div>
              </div>

              {/* Adresse de livraison */}
              <div className="bg-white rounded-2xl p-6 border border-warm-100">
                <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                  Adresse de livraison
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Quartier *
                    </label>
                    <select
                      name="quarter"
                      aria-label="Quartier de livraison"
                      value={formData.quarter}
                      onChange={handleChange}
                      className={`form-input ${errors.quarter ? 'border-red-500' : ''}`}
                    >
                      <option value="">Selectionner un quartier</option>
                      {QUARTIERS_COTONOU.map((q) => (
                        <option key={q} value={q}>
                          {q} {getDeliveryFee(q) === 0 ? '(Livraison gratuite)' : `(+${formatPrice(getDeliveryFee(q))})`}
                        </option>
                      ))}
                    </select>
                    {errors.quarter && (
                      <p className="text-red-500 text-sm mt-1">{errors.quarter}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Adresse complete *
                    </label>
                    <input
                      type="text"
                      name="address"
                      autoComplete="street-address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`form-input ${errors.address ? 'border-red-500' : ''}`}
                      placeholder="Ex: Rue 123, pres de la pharmacie"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-warm-600 mb-1">
                      Instructions (optionnel)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                      className="form-input"
                      placeholder="Ex: Appeler avant livraison, code portail: 1234"
                    />
                  </div>
                </div>
              </div>

              {/* Mode de paiement */}
              <div className="bg-white rounded-2xl p-6 border border-warm-100">
                <h2 className="text-lg font-bold text-secondary-500 border-l-4 border-primary-500 pl-3 mb-4">
                  Mode de paiement
                </h2>

                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50 shadow-md shadow-primary-500/10'
                          : 'border-warm-200 hover:border-warm-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          formData.paymentMethod === method.id
                            ? 'bg-primary-500 text-white'
                            : 'bg-warm-100 text-warm-500'
                        }`}
                      >
                        <PaymentIcon type={method.icon} className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-secondary-500">{method.name}</p>
                        <p className="text-sm text-warm-500">{method.description}</p>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          formData.paymentMethod === method.id
                            ? 'border-primary-500 bg-primary-500'
                            : 'border-warm-300'
                        }`}
                      >
                        {formData.paymentMethod === method.id && (
                          <svg className="w-full h-full text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Option paiement en 2x */}
                {total >= 10000 && formData.paymentMethod !== 'CASH_ON_DELIVERY' && (
                  <label className="flex items-start gap-3 mt-4 p-4 rounded-xl border-2 border-dashed border-primary-200 bg-primary-50/50 cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={isSplitPayment}
                      onChange={(e) => setIsSplitPayment(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-warm-300 text-primary-500 focus:ring-primary-500"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-secondary-500 text-sm">
                        Payer en 2 fois sans frais
                      </p>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {isSplitPayment
                          ? `1ere partie : ${formatPrice(splitFirst)} maintenant, 2eme partie : ${formatPrice(splitSecond)} a la livraison`
                          : `Payez 60% maintenant (${formatPrice(Math.ceil(total * 0.6))}) et 40% a la livraison`}
                      </p>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Recapitulatif commande */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 border-2 border-primary-100 shadow-lg shadow-primary-500/5 sticky top-24">
                <h2 className="text-lg font-bold text-secondary-500 mb-4">
                  Votre commande
                </h2>

                {/* Articles */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-warm-100">
                        <Image
                          src={cloudinaryPresets.cart(item.image)}
                          alt={item.name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-secondary-500 line-clamp-2">
                          {item.name}
                        </p>
                        <p className="text-sm text-warm-500">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Code promo */}
                <div className="border-t border-warm-100 mt-4 pt-4">
                  {promoApplied ? (
                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-medium text-green-700">{promoCode.toUpperCase()} ({promoLabel})</span>
                      </div>
                      <button type="button" onClick={handleRemovePromo} className="text-warm-400 hover:text-red-500 transition-colors" aria-label="Retirer le code promo">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => { setPromoCode(e.target.value); setPromoError('') }}
                          placeholder="Code promo"
                          className="flex-1 px-3 py-2 text-sm rounded-xl border border-warm-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={handleApplyPromo}
                          disabled={promoLoading || !promoCode.trim()}
                          className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 disabled:opacity-50 transition-colors"
                        >
                          {promoLoading ? '...' : 'Appliquer'}
                        </button>
                      </div>
                      {promoError && <p className="text-red-500 text-xs mt-1">{promoError}</p>}
                    </div>
                  )}
                </div>

                {/* Programme de fidelite */}
                {loyaltyPoints > 0 && (
                  <div className="border-t border-warm-100 mt-4 pt-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-bold text-amber-700">
                          {loyaltyPoints} points disponibles
                        </span>
                      </div>

                      {loyaltyApplied ? (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-green-700 font-medium">
                            -{formatPrice(loyaltyDiscount)} appliques
                          </span>
                          <button
                            type="button"
                            onClick={handleRemoveLoyalty}
                            className="text-xs text-red-500 hover:text-red-700 font-medium"
                          >
                            Retirer
                          </button>
                        </div>
                      ) : loyaltyPoints >= 500 ? (
                        <button
                          type="button"
                          onClick={handleApplyLoyalty}
                          disabled={loyaltyLoading}
                          className="w-full py-2 text-sm font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors disabled:opacity-50"
                        >
                          {loyaltyLoading ? 'Chargement...' : `Utiliser ${loyaltyPoints} points (-${formatPrice(loyaltyPoints)})`}
                        </button>
                      ) : (
                        <p className="text-xs text-amber-600">
                          Minimum 500 points pour utiliser (il vous manque {500 - loyaltyPoints} points)
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Totaux */}
                <div className="border-t border-warm-100 mt-4 pt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-warm-500">Sous-total</span>
                    <span className="text-secondary-500">{formatPrice(cartSubtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-warm-500">Livraison</span>
                    <span className={deliveryFee === 0 ? 'text-green-600' : 'text-secondary-500'}>
                      {deliveryFee === 0 ? 'Gratuite' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  {promoDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Reduction {promoLabel}</span>
                      <span>-{formatPrice(promoDiscount)}</span>
                    </div>
                  )}
                  {loyaltyDiscount > 0 && (
                    <div className="flex justify-between text-amber-600">
                      <span>Points fidelite</span>
                      <span>-{formatPrice(loyaltyDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-warm-100 mt-4 pt-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-lg font-bold text-secondary-500">Total</span>
                    <span className="text-2xl font-bold text-primary-500">
                      {formatPrice(total)}
                    </span>
                  </div>

                  {/* Detail paiement en 2x */}
                  {isSplitPayment && formData.paymentMethod !== 'CASH_ON_DELIVERY' && (
                    <div className="mt-2 p-2 bg-primary-50 rounded-lg text-xs space-y-1">
                      <div className="flex justify-between text-primary-700 font-medium">
                        <span>Maintenant</span>
                        <span>{formatPrice(splitFirst)}</span>
                      </div>
                      <div className="flex justify-between text-primary-600">
                        <span>A la livraison</span>
                        <span>{formatPrice(splitSecond)}</span>
                      </div>
                    </div>
                  )}

                  {/* Points a gagner */}
                  {pointsToEarn > 0 && (
                    <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Vous gagnerez {pointsToEarn} points fidelite
                    </p>
                  )}
                </div>

                {/* Bouton de soumission */}
                {errors.submit && (
                  <p className="text-red-500 text-sm mt-4">{errors.submit}</p>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-6"
                  isLoading={isLoading}
                >
                  {formData.paymentMethod === 'CASH_ON_DELIVERY'
                    ? 'Confirmer la commande'
                    : isSplitPayment
                      ? `Payer ${formatPrice(splitFirst)} (1ere partie)`
                      : `Payer ${formatPrice(total)}`}
                </Button>

                <p className="text-xs text-warm-500 text-center mt-4">
                  En confirmant, vous acceptez nos{' '}
                  <a href="/cgu" target="_blank" className="underline text-primary-500 hover:text-primary-600">CGV</a>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Modale de paiement KKiaPay */}
      {showPayment && orderData && (
        <KKiapayPayment
          orderId={orderData.id}
          orderNumber={orderData.orderNumber}
          amount={orderData.total}
          customerName={formData.customerName}
          onSuccess={onPaymentSuccess}
          onClose={() => setShowPayment(false)}
        />
      )}

      {/* SDK KKiaPay charge en lazy pour ne pas bloquer le rendu */}
      <Script src="https://cdn.kkiapay.me/k.js" strategy="lazyOnload" />
    </div>
  )
}
