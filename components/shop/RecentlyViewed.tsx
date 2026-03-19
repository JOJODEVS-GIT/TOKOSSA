'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRecentlyViewed } from '@/lib/recently-viewed'
import { formatPrice } from '@/lib/utils'

interface RecentProduct {
  id: string
  name: string
  slug: string
  price: number
  oldPrice: number | null
  images: string[]
}

/**
 * Affiche les produits recemment consultes depuis localStorage.
 * Fetch les donnees produit via API search.
 */
export default function RecentlyViewed() {
  const { viewedSlugs } = useRecentlyViewed()
  const [products, setProducts] = useState<RecentProduct[]>([])

  useEffect(() => {
    if (viewedSlugs.length === 0) return

    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/search?slugs=${viewedSlugs.slice(0, 6).join(',')}`)
        if (res.ok) {
          const data = await res.json()
          setProducts(data.products || data)
        }
      } catch {
        // silently fail
      }
    }

    fetchProducts()
  }, [viewedSlugs])

  if (products.length === 0) return null

  return (
    <section className="py-10">
      <div className="container mx-auto px-4">
        <h2 className="text-lg font-bold text-warm-900 mb-4">Recemment consultes</h2>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/produits/${product.slug}`}
              className="flex-shrink-0 w-36 group"
            >
              <div className="relative w-36 h-36 rounded-xl overflow-hidden bg-warm-100 mb-2">
                <Image
                  src={product.images[0] || '/placeholder.webp'}
                  alt={product.name}
                  fill
                  sizes="144px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <p className="text-xs font-medium text-warm-800 line-clamp-2 leading-tight">
                {product.name}
              </p>
              <p className="text-xs font-bold text-primary-500 mt-0.5">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
