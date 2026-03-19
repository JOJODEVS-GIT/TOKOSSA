'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCartStore, useFavoritesStore } from '@/lib/store'
import { formatPrice, calculateDiscount } from '@/lib/utils'
import Badge, { DiscountBadge, StockBadge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useState } from 'react'
import { cloudinaryPresets, BLUR_PLACEHOLDER } from '@/lib/cloudinary'

interface ProductCardProps {
  product: {
    id: string
    name: string
    slug: string
    price: number
    oldPrice?: number | null
    images: string[]
    stock: number
    category: string
    isFeatured?: boolean
  }
  priority?: boolean
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCartStore()
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const [isAnimating, setIsAnimating] = useState(false)
  const discount = product.oldPrice ? calculateDiscount(product.price, product.oldPrice) : 0
  const isOutOfStock = product.stock <= 0
  const isLowStock = product.stock > 0 && product.stock <= 5
  const liked = isFavorite(product.id)

  // Gestion du clic sur le bouton favori
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAnimating(true)
    toggleFavorite(product.id)
    setTimeout(() => setIsAnimating(false), 300)
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock) return

    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      oldPrice: product.oldPrice || undefined,
      image: product.images[0] || '/images/placeholder.jpg',
      stock: product.stock,
    })
  }

  return (
    <Link href={`/produits/${product.slug}`} className="block">
      <article className="product-card group">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-warm-100">
          <Image
            src={cloudinaryPresets.card(product.images[0] || '/images/placeholder.jpg')}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            quality={80}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1.5">
            {discount > 0 && <DiscountBadge percent={discount} />}
            {product.isFeatured && <Badge variant="flash">HOT</Badge>}
          </div>

          {/* Bouton favori (coeur) */}
          <button
            onClick={handleToggleFavorite}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            aria-pressed={liked as boolean}
            className={`absolute top-2 right-2 w-11 h-11 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-white z-10 ${
              isAnimating ? 'scale-125' : 'scale-100'
            }`}
          >
            <svg
              className={`w-4.5 h-4.5 transition-colors duration-200 ${
                liked ? 'text-red-500 fill-red-500' : 'text-warm-400'
              }`}
              fill={liked ? 'currentColor' : 'none'}
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>

          {/* Out of stock overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-bold text-lg bg-black/30 px-4 py-2 rounded-xl backdrop-blur-sm">
                Rupture
              </span>
            </div>
          )}

          {/* Badge livraison express — affiché uniquement si en stock */}
          {!isOutOfStock && (
            <div className="absolute bottom-12 md:bottom-2 left-2 z-10 md:group-hover:bottom-12 md:transition-all md:duration-300">
              <span className="inline-flex items-center gap-1 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse-express">
                {/* Icone camion */}
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                </svg>
                Express 24h
              </span>
            </div>
          )}

          {/* Quick add button - Desktop */}
          {/* focus:opacity-100 et focus:translate-y-0 rendent le bouton visible au focus clavier (accessibilite) */}
          {!isOutOfStock && (
            <button
              onClick={handleAddToCart}
              aria-label={`Ajouter ${product.name} au panier`}
              className="absolute bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-primary-500 font-semibold text-xs flex items-center gap-1.5 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 focus:opacity-100 focus:translate-y-0 transition-all duration-300 hover:bg-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Ajouter
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <p className="text-[11px] text-warm-500 uppercase tracking-widest font-semibold mb-1">
            {product.category}
          </p>

          {/* Name */}
          <h2 className="font-medium text-secondary-500 line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors">
            {product.name}
          </h2>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-xl font-bold text-primary-500">
              {formatPrice(product.price)}
            </span>
            {product.oldPrice && (
              <span className="text-sm text-warm-500 line-through">
                {formatPrice(product.oldPrice)}
              </span>
            )}
          </div>

          {/* Stock indicator */}
          {isLowStock && <StockBadge stock={product.stock} />}

          {/* Add to cart button - Mobile */}
          <Button
            variant={isOutOfStock ? 'secondary' : 'primary'}
            size="sm"
            className="w-full mt-3 md:hidden rounded-xl"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
          >
            {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
          </Button>
        </div>
      </article>
    </Link>
  )
}
