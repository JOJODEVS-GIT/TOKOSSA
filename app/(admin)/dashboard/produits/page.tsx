export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import prisma from '@/lib/db'
import { formatPrice } from '@/lib/utils'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

/**
 * Page de gestion des produits admin TOKOSSA.
 * Server Component async — affiche TOUS les produits (meme inactifs)
 * avec image, nom, categorie, prix, stock, statut actif/inactif.
 * Indicateurs de stock bas (< 5 rouge, < 10 orange).
 */

export default async function ProduitsPage() {
  const products = await prisma.product.findMany({
    orderBy: [
      { isActive: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      oldPrice: true,
      images: true,
      stock: true,
      category: true,
      isActive: true,
      isFeatured: true,
      createdAt: true,
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produits</h1>
          <p className="text-gray-600">{products.length} produit{products.length > 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/dashboard/produits/nouveau"
          className="inline-flex items-center gap-2 px-5 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/25"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un produit
        </Link>
      </div>

      {/* Liste des produits */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-500 text-lg mb-4">Aucun produit pour le moment</p>
          <Link
            href="/dashboard/produits/nouveau"
            className="text-primary-500 hover:text-primary-600 font-medium"
          >
            Creer votre premier produit &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {/* En-tete (desktop) */}
          <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">Image</div>
            <div className="col-span-3">Nom</div>
            <div className="col-span-2">Categorie</div>
            <div className="col-span-1">Prix</div>
            <div className="col-span-1">Stock</div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-1">Vedette</div>
            <div className="col-span-2">Actions</div>
          </div>

          {/* Lignes produits */}
          <div className="divide-y">
            {products.map((product) => {
              /** Couleur du stock selon le niveau */
              const stockColor =
                product.stock <= 0
                  ? 'text-red-600 bg-red-50'
                  : product.stock < 5
                    ? 'text-red-600 bg-red-50'
                    : product.stock < 10
                      ? 'text-orange-600 bg-orange-50'
                      : 'text-green-600 bg-green-50'

              return (
                <div
                  key={product.id}
                  className={`px-6 py-4 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center space-y-3 lg:space-y-0 ${
                    !product.isActive ? 'opacity-60' : ''
                  }`}
                >
                  {/* Image */}
                  <div className="col-span-1">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-warm-100 relative flex-shrink-0">
                      {product.images[0] ? (
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-warm-400">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nom */}
                  <div className="col-span-3">
                    <p className="font-medium text-gray-900 text-sm line-clamp-1">{product.name}</p>
                    {product.oldPrice && (
                      <p className="text-xs text-gray-400">
                        Ancien prix : {formatPrice(product.oldPrice)}
                      </p>
                    )}
                  </div>

                  {/* Categorie */}
                  <div className="col-span-2">
                    <span className="text-sm text-gray-600">{product.category}</span>
                  </div>

                  {/* Prix */}
                  <div className="col-span-1">
                    <p className="font-semibold text-primary-500 text-sm">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  {/* Stock */}
                  <div className="col-span-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-bold rounded-lg ${stockColor}`}
                    >
                      {product.stock}
                    </span>
                  </div>

                  {/* Statut actif/inactif */}
                  <div className="col-span-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        product.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  {/* Vedette */}
                  <div className="col-span-1">
                    {product.isFeatured && (
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">
                        Vedette
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex items-center gap-3">
                    <Link
                      href={`/dashboard/produits/${product.id}`}
                      className="text-primary-500 hover:text-primary-700 text-sm font-medium transition-colors"
                    >
                      Modifier
                    </Link>
                    {product.isActive && (
                      <DeleteProductButton
                        productId={product.id}
                        productName={product.name}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
