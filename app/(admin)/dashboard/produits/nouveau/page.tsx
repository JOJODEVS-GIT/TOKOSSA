import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'

/**
 * Page de creation d'un nouveau produit.
 * Server Component qui affiche le formulaire en mode 'create'.
 */
export default function NouveauProduitPage() {
  return (
    <div className="space-y-6">
      {/* En-tete avec breadcrumb */}
      <div>
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/dashboard/produits" className="hover:text-primary-500 transition-colors">
            Produits
          </Link>
          <span>/</span>
          <span className="text-gray-900">Nouveau produit</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Creer un produit</h1>
        <p className="text-gray-600">Remplissez les informations du nouveau produit</p>
      </div>

      {/* Formulaire en mode creation */}
      <ProductForm action="create" />
    </div>
  )
}
