export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/db'
import ProductForm from '@/components/admin/ProductForm'

/**
 * Page d'edition d'un produit existant.
 * Server Component qui recupere le produit par ID, puis passe
 * les donnees au formulaire Client Component en mode 'edit'.
 */

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditProduitPage({ params }: PageProps) {
  const { id } = await params

  const product = await prisma.product.findUnique({
    where: { id },
  })

  // Redirection 404 si le produit n'existe pas
  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* En-tete avec breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard/produits" className="hover:text-primary-500 transition-colors">
            Produits
          </Link>
          <span>/</span>
          <span className="text-gray-900">Modifier</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Modifier le produit</h1>
        <p className="text-gray-600">{product.name}</p>
      </div>

      {/* Formulaire en mode edition, pre-rempli */}
      <ProductForm
        action="edit"
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          oldPrice: product.oldPrice,
          images: product.images,
          stock: product.stock,
          category: product.category,
          isFeatured: product.isFeatured,
          isActive: product.isActive,
        }}
      />
    </div>
  )
}
