'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFavoritesStore } from '@/lib/store'
import ProductCard from '@/components/shop/ProductCard'

// Type produit correspondant a ProductCard
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

export default function FavorisPage() {
  const { favorites } = useFavoritesStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // Recuperer les produits favoris depuis l'API
  useEffect(() => {
    async function fetchFavorites() {
      if (favorites.length === 0) {
        setProducts([])
        setLoading(false)
        return
      }

      try {
        const ids = favorites.join(',')
        const response = await fetch(`/api/produits?ids=${ids}`)
        if (response.ok) {
          const data = await response.json()
          setProducts(data as Product[])
        }
      } catch (error) {
        console.error('Erreur lors du chargement des favoris:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavorites()
  }, [favorites])

  return (
    <div className="min-h-screen bg-warm-50">
      {/* En-tete */}
      <div className="bg-white border-b border-warm-100">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-secondary-500">
            Mes favoris
          </h1>
          <p className="text-sm text-warm-500 mt-1">
            {favorites.length > 0
              ? `${favorites.length} produit${favorites.length > 1 ? 's' : ''} enregistre${favorites.length > 1 ? 's' : ''}`
              : 'Retrouvez vos produits preferes ici'}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Etat de chargement */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-3 border-warm-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-warm-500 text-sm">Chargement de vos favoris...</p>
          </div>
        )}

        {/* Liste vide */}
        {!loading && favorites.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-warm-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-10 h-10 text-warm-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-secondary-500 mb-2">
              Vous n&apos;avez pas encore de favoris
            </h2>
            <p className="text-sm text-warm-500 mb-6 max-w-sm mx-auto">
              Parcourez nos produits et appuyez sur le coeur pour sauvegarder
              vos articles preferes.
            </p>
            <Link
              href="/produits"
              className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
            >
              Decouvrir nos produits
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        )}

        {/* Grille de produits favoris */}
        {!loading && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
