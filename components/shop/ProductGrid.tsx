'use client'

import ProductCard from './ProductCard'

interface Product {
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

interface ProductGridProps {
  products: Product[]
  title?: string
  emptyMessage?: string
}

export default function ProductGrid({
  products,
  title,
  emptyMessage = 'Aucun produit trouve',
}: ProductGridProps) {
  if (products.length === 0) {
    return (
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
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-warm-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <section>
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">{title}</h2>
          <a
            href="/produits"
            className="group text-sm text-primary-500 hover:text-primary-600 font-semibold flex items-center gap-1"
          >
            Voir tout
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
        {products.map((product, index) => (
          <ProductCard
            key={product.id}
            product={product}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  )
}
