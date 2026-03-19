'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { cloudinaryPresets, BLUR_PLACEHOLDER } from '@/lib/cloudinary'
import { useCartStore } from '@/lib/store'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Badge, { DiscountBadge, StockBadge } from '@/components/ui/Badge'
import StockCounter, { UrgencyTimer } from '@/components/shop/StockCounter'
import DeliveryTimer from '@/components/shop/DeliveryTimer'
import ProductCard from '@/components/shop/ProductCard'
import dynamic from 'next/dynamic'

const ProductReviews = dynamic(() => import('@/components/shop/ProductReviews'), {
  ssr: false,
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-6 bg-warm-100 rounded w-48" />
      <div className="h-24 bg-warm-50 rounded-xl" />
    </div>
  ),
})
import { useRecentlyViewed } from '@/lib/recently-viewed'
import * as fbpixel from '@/lib/fbpixel'

/**
 * Interface des props du composant ProductDetail.
 * Recoit les donnees du produit et des produits similaires
 * depuis le Server Component parent (page [slug]).
 */
interface ProductVariant {
  id: string
  name: string
  stock: number
  price: number | null
  options: Record<string, string>
  image: string | null
}

interface ProductDetailProps {
  product: {
    id: string
    name: string
    slug: string
    description: string
    price: number
    oldPrice: number | null
    images: string[]
    stock: number
    category: string
    isFeatured: boolean
    variants?: ProductVariant[]
  }
  relatedProducts: Array<{
    id: string
    name: string
    slug: string
    price: number
    oldPrice: number | null
    images: string[]
    stock: number
    category: string
  }>
}

export default function ProductDetail({ product, relatedProducts }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const { addItem } = useCartStore()
  const router = useRouter()
  const { addViewed } = useRecentlyViewed()

  // --- Variantes ---
  const variants = product.variants || []
  const hasVariants = variants.length > 0

  // Extraire les cles d'options uniques (ex: "taille", "couleur")
  const optionKeys = hasVariants
    ? Array.from(new Set(variants.flatMap((v) => Object.keys(v.options))))
    : []

  // Valeurs uniques par cle d'option
  const optionValues: Record<string, string[]> = {}
  for (const key of optionKeys) {
    optionValues[key] = Array.from(new Set(variants.map((v) => v.options[key]).filter(Boolean)))
  }

  // Trouver la variante qui correspond aux options selectionnees
  const selectedVariant = hasVariants && Object.keys(selectedOptions).length === optionKeys.length
    ? variants.find((v) =>
        optionKeys.every((key) => v.options[key] === selectedOptions[key])
      ) || null
    : null

  // Prix et stock effectifs (variante ou produit parent)
  const effectivePrice = selectedVariant?.price ?? product.price
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock

  // --- Feature 2 : Sticky "Ajouter au panier" mobile ---
  // Reference vers le bouton "Ajouter au panier" original
  const addToCartBtnRef = useRef<HTMLButtonElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  // --- Feature 3 : Images plein ecran ---
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [fullscreenIndex, setFullscreenIndex] = useState(0)
  // Reference vers le conteneur du modal plein ecran (pour le focus trap)
  const fullscreenRef = useRef<HTMLDivElement>(null)
  // References pour le swipe tactile
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Enregistrer ce produit comme recemment vu + tracking Facebook Pixel
  useEffect(() => {
    addViewed(product.slug)
    fbpixel.viewContent({
      id: product.id,
      name: product.name,
      price: product.price,
      category: product.category,
    })
  }, [product.slug, product.id, product.name, product.price, product.category, addViewed])

  // IntersectionObserver pour detecter quand le bouton original sort de l'ecran
  useEffect(() => {
    const btn = addToCartBtnRef.current
    if (!btn) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Afficher la barre sticky quand le bouton original n'est plus visible
        setShowStickyBar(!entry.isIntersecting)
      },
      { threshold: 0 }
    )

    observer.observe(btn)
    return () => observer.disconnect()
  }, [])

  /** Naviguer vers l'image precedente dans le modal plein ecran */
  const prevFullscreenImage = useCallback(() => {
    setFullscreenIndex((prev) =>
      prev > 0 ? prev - 1 : product.images.length - 1
    )
  }, [product.images.length])

  /** Naviguer vers l'image suivante dans le modal plein ecran */
  const nextFullscreenImage = useCallback(() => {
    setFullscreenIndex((prev) =>
      prev < product.images.length - 1 ? prev + 1 : 0
    )
  }, [product.images.length])

  // Gestion des touches clavier pour le modal plein ecran (Escape, fleches gauche/droite, Tab)
  const handleFullscreenKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowFullscreen(false)
      return
    }
    if (e.key === 'ArrowLeft') prevFullscreenImage()
    if (e.key === 'ArrowRight') nextFullscreenImage()

    // Focus trap : maintenir le focus dans le modal lors de la navigation Tab/Shift+Tab
    if (e.key === 'Tab') {
      const modalEl = fullscreenRef.current
      if (!modalEl) return
      const focusable = Array.from(
        modalEl.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute('disabled'))
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
  }, [prevFullscreenImage, nextFullscreenImage])

  useEffect(() => {
    if (showFullscreen) {
      document.addEventListener('keydown', handleFullscreenKeyDown)
      document.body.style.overflow = 'hidden'
      // Deplacer le focus vers le bouton fermer a l'ouverture du modal
      const closeBtn = fullscreenRef.current?.querySelector<HTMLElement>('[aria-label="Fermer la galerie"]')
      closeBtn?.focus()
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.removeEventListener('keydown', handleFullscreenKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [showFullscreen, handleFullscreenKeyDown])

  const discount = product.oldPrice ? calculateDiscount(effectivePrice, product.oldPrice) : 0
  const isOutOfStock = effectiveStock <= 0
  const needsVariantSelection = hasVariants && !selectedVariant

  // Calcul des economies en FCFA
  const savings = product.oldPrice ? product.oldPrice - effectivePrice : 0

  // Changer l'image si la variante a une image specifique
  useEffect(() => {
    if (selectedVariant?.image) {
      const idx = product.images.indexOf(selectedVariant.image)
      if (idx >= 0) setSelectedImage(idx)
    }
  }, [selectedVariant, product.images])

  const handleAddToCart = () => {
    if (isOutOfStock || needsVariantSelection) return

    const cartId = selectedVariant ? `${product.id}__${selectedVariant.id}` : product.id
    const cartName = selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name

    addItem(
      {
        id: cartId,
        name: cartName,
        slug: product.slug,
        price: effectivePrice,
        oldPrice: product.oldPrice || undefined,
        image: selectedVariant?.image || product.images[0],
        stock: effectiveStock,
      },
      quantity
    )

    // Tracking Facebook Pixel - ajout au panier
    fbpixel.addToCart({
      id: product.id,
      name: cartName,
      price: effectivePrice,
      quantity,
    })
  }

  /** Ajouter au panier et rediriger vers le checkout */
  const handleBuyNow = () => {
    if (isOutOfStock || needsVariantSelection) return
    handleAddToCart()
    router.push('/checkout')
  }

  /** Ouvrir le modal plein ecran avec l'image selectionnee */
  const openFullscreen = (index: number) => {
    setFullscreenIndex(index)
    setShowFullscreen(true)
  }

  /** Gestion du debut du swipe tactile */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  /** Gestion de la fin du swipe tactile */
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].clientX
    const diff = touchStartX.current - touchEndX.current
    const minSwipeDistance = 50

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        // Swipe vers la gauche -> image suivante
        nextFullscreenImage()
      } else {
        // Swipe vers la droite -> image precedente
        prevFullscreenImage()
      }
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Fil d'Ariane */}
      <nav className="container mx-auto px-4 py-3 text-sm">
        <ol className="flex items-center gap-1.5 text-warm-500">
          <li>
            <Link href="/" className="hover:text-primary-500 transition-colors">
              Accueil
            </Link>
          </li>
          <li className="text-warm-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li>
            <Link href="/produits" className="hover:text-primary-500 transition-colors">
              Produits
            </Link>
          </li>
          <li className="text-warm-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </li>
          <li className="text-secondary-500 font-medium truncate">{product.name}</li>
        </ol>
      </nav>

      <div className="container mx-auto px-4 pb-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            {/* Image principale - cliquable pour ouvrir en plein ecran */}
            <button
              type="button"
              onClick={() => openFullscreen(selectedImage)}
              className="relative aspect-square bg-warm-50 rounded-3xl overflow-hidden w-full cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Voir l'image en plein ecran"
            >
              <Image
                src={cloudinaryPresets.detail(product.images[selectedImage] || '/images/placeholder.jpg')}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                quality={85}
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {discount > 0 && <DiscountBadge percent={discount} />}
                {product.isFeatured && <Badge variant="flash">HOT</Badge>}
              </div>

              {/* Icone zoom en bas a droite */}
              <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm rounded-full p-2">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </button>

            {/* Vignettes */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index
                        ? 'border-primary-500 ring-2 ring-primary-500/20'
                        : 'border-warm-200 hover:border-warm-400'
                    }`}
                  >
                    <Image
                      src={cloudinaryPresets.thumb(image)}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="space-y-6">
            {/* Categorie */}
            <p className="text-[11px] uppercase tracking-widest font-semibold text-warm-500">
              {product.category}
            </p>

            {/* Titre */}
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-secondary-500">
              {product.name}
            </h1>

            {/* Prix */}
            <div className="flex items-center flex-wrap gap-3">
              <span className="text-4xl font-bold text-primary-500">
                {formatPrice(effectivePrice)}
              </span>
              {product.oldPrice && (
                <>
                  <span className="text-xl text-warm-400 line-through">
                    {formatPrice(product.oldPrice)}
                  </span>
                  <Badge variant="promo">-{discount}%</Badge>
                </>
              )}
            </div>

            {/* Badge economies */}
            {savings > 0 && (
              <div className="inline-flex">
                <span className="bg-green-50 text-green-700 rounded-lg px-3 py-1 text-sm font-medium">
                  Vous economisez {formatPrice(savings)}
                </span>
              </div>
            )}

            {/* Minuteur d'urgence */}
            {discount > 0 && (
              <UrgencyTimer
                endTime={new Date(Date.now() + 24 * 60 * 60 * 1000)}
                label="Promo expire dans"
              />
            )}

            {/* Stock */}
            <StockCounter stock={effectiveStock} />

            {/* Selecteur de variantes */}
            {hasVariants && (
              <div className="space-y-4 pt-4 border-t border-warm-100">
                {optionKeys.map((key) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-warm-700 mb-2 capitalize">
                      {key}
                      {selectedOptions[key] && (
                        <span className="ml-2 text-primary-600 font-semibold">{selectedOptions[key]}</span>
                      )}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {optionValues[key].map((value) => {
                        const isSelected = selectedOptions[key] === value
                        // Verifier si cette valeur est disponible en stock
                        const isAvailable = variants.some((v) =>
                          v.options[key] === value && v.stock > 0 &&
                          Object.entries(selectedOptions)
                            .filter(([k]) => k !== key)
                            .every(([k, val]) => v.options[k] === val)
                        )
                        return (
                          <button
                            key={value}
                            onClick={() => setSelectedOptions((prev) => ({ ...prev, [key]: value }))}
                            disabled={!isAvailable}
                            className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                              isSelected
                                ? 'bg-primary-500 text-white ring-2 ring-primary-500/30'
                                : isAvailable
                                  ? 'bg-warm-100 text-warm-700 hover:bg-warm-200 active:scale-95'
                                  : 'bg-warm-50 text-warm-300 line-through cursor-not-allowed'
                            }`}
                          >
                            {value}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {needsVariantSelection && (
                  <p className="text-sm text-amber-600 font-medium">
                    Veuillez choisir {optionKeys.filter((k) => !selectedOptions[k]).join(' et ')}
                  </p>
                )}
              </div>
            )}

            {/* Quantite et ajout au panier */}
            <div className="space-y-4 pt-4 border-t border-warm-100">
              {/* Selecteur de quantite */}
              <div className="flex items-center gap-4">
                <span className="text-warm-600">Quantite</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center bg-warm-100 rounded-xl text-secondary-500 font-bold text-lg hover:bg-warm-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="w-12 text-center text-xl font-bold text-secondary-500">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(effectiveStock, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center bg-warm-100 rounded-xl text-secondary-500 font-bold text-lg hover:bg-warm-200 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= effectiveStock}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex flex-col gap-3">
                <Button
                  ref={addToCartBtnRef}
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || needsVariantSelection}
                >
                  {isOutOfStock ? (
                    'Rupture de stock'
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      Ajouter au panier
                    </>
                  )}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-secondary-500 text-white hover:bg-secondary-600"
                  onClick={handleBuyNow}
                  disabled={isOutOfStock || needsVariantSelection}
                >
                  {isOutOfStock ? (
                    'Rupture de stock'
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      Acheter maintenant
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Timer livraison meme jour */}
            <DeliveryTimer />

            {/* Badges de confiance - Grille 2 colonnes avec icones SVG */}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-warm-100">
              {/* Livraison gratuite */}
              <div className="trust-badge inline-flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-100 shadow-sm text-sm font-medium text-warm-700">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Livraison gratuite
              </div>
              {/* Retour 7 jours */}
              <div className="trust-badge inline-flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-100 shadow-sm text-sm font-medium text-warm-700">
                <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retour 7 jours
              </div>
              {/* Paiement securise */}
              <div className="trust-badge inline-flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-100 shadow-sm text-sm font-medium text-warm-700">
                <svg className="w-5 h-5 text-primary-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Paiement securise
              </div>
              {/* Produit garanti */}
              <div className="trust-badge inline-flex items-center gap-2.5 px-4 py-3 bg-white rounded-xl border border-warm-100 shadow-sm text-sm font-medium text-warm-700">
                <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Produit garanti
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-warm-100">
              <h2 className="text-xl font-bold text-secondary-500 mb-3">Description</h2>
              <div className="prose prose-sm text-warm-600 whitespace-pre-line">
                {product.description}
              </div>
            </div>

            {/* Informations livraison */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
              <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Livraison a Cotonou et environs
              </h3>
              <ul className="text-sm text-green-700 space-y-1 ml-7">
                <li>&bull; Livraison sous 24h maximum</li>
                <li>&bull; Gratuite des 5000 FCFA d&apos;achat</li>
                <li>&bull; Paiement a la livraison accepte</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Avis clients */}
        <section className="mt-12 border-t border-warm-100 pt-8">
          <ProductReviews productId={product.id} />
        </section>

        {/* Produits recommandes (cross-sell) */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <div className="mb-6">
              <h2 className="section-heading">Vous aimerez aussi</h2>
              <p className="text-sm text-warm-500 mt-1">
                Les clients qui ont vu ce produit ont aussi aime
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {relatedProducts.map((relProduct, index) => (
                <ProductCard
                  key={relProduct.id}
                  product={relProduct}
                  priority={false}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ========================================== */}
      {/* Feature 2 : Barre sticky "Ajouter au panier" mobile */}
      {/* Visible uniquement quand le bouton original n'est plus a l'ecran */}
      {/* ========================================== */}
      {showStickyBar && !isOutOfStock && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-warm-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-40 pb-20 md:hidden animate-slide-up">
          <div className="flex items-center justify-between px-4 py-3 gap-4">
            {/* Prix */}
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-primary-500">
                {formatPrice(effectivePrice)}
              </span>
              {product.oldPrice && (
                <span className="block text-xs text-warm-400 line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Bouton Ajouter au panier */}
            <button
              onClick={handleAddToCart}
              className="flex-1 max-w-[240px] inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-lg shadow-primary-500/25 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
              </svg>
              Ajouter au panier
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* Feature 3 : Modal images plein ecran */}
      {/* ========================================== */}
      {showFullscreen && (
        <div
          ref={fullscreenRef}
          role="dialog"
          aria-modal="true"
          aria-label="Galerie d'images"
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
        >
          {/* Bouton fermer (X) */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowFullscreen(false)
            }}
            className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
            aria-label="Fermer la galerie"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Compteur d'images */}
          {product.images.length > 1 && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
              {fullscreenIndex + 1} / {product.images.length}
            </div>
          )}

          {/* Fleche precedente (desktop uniquement) */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                prevFullscreenImage()
              }}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
              aria-label="Image precedente"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Image plein ecran avec support swipe */}
          <div
            className="relative w-full h-full flex items-center justify-center p-4 md:p-12"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image
              src={cloudinaryPresets.fullscreen(product.images[fullscreenIndex] || '/images/placeholder.jpg')}
              alt={`${product.name} - Image ${fullscreenIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
              priority
            />
          </div>

          {/* Fleche suivante (desktop uniquement) */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                nextFullscreenImage()
              }}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 items-center justify-center w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-colors"
              aria-label="Image suivante"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Vignettes en bas du modal */}
          {product.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    setFullscreenIndex(index)
                  }}
                  aria-current={fullscreenIndex === index ? 'true' : 'false'}
                  className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                    fullscreenIndex === index
                      ? 'border-white ring-2 ring-white/30'
                      : 'border-white/30 opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={cloudinaryPresets.thumb(image)}
                    alt={`Miniature ${index + 1}`}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
