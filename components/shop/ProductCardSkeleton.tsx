/**
 * ProductCardSkeleton — Squelette de chargement qui imite la forme d'une ProductCard.
 * Utilise animate-pulse pour simuler le chargement des donnees produit.
 * Utilise dans le Suspense fallback de la page catalogue.
 */
export default function ProductCardSkeleton() {
  return (
    <article className="rounded-2xl overflow-hidden bg-white shadow-sm border border-warm-100">
      {/* Image rectangle — ratio carre comme ProductCard */}
      <div className="relative aspect-square bg-warm-200 animate-pulse">
        {/* Badge simulé en haut a gauche */}
        <div className="absolute top-2 left-2 w-10 h-5 bg-warm-300 rounded-full" />
        {/* Bouton favori simulé en haut a droite */}
        <div className="absolute top-2 right-2 w-8 h-8 bg-warm-300 rounded-full" />
      </div>

      {/* Contenu texte */}
      <div className="p-4 space-y-2">
        {/* Ligne categorie — fine et courte */}
        <div className="h-2.5 bg-warm-200 rounded-full animate-pulse w-1/3" />

        {/* Titre produit — deux lignes */}
        <div className="h-3.5 bg-warm-200 rounded-full animate-pulse w-full" />
        <div className="h-3.5 bg-warm-200 rounded-full animate-pulse w-4/5" />

        {/* Ligne prix */}
        <div className="flex items-center gap-2 pt-1">
          <div className="h-5 bg-warm-200 rounded-full animate-pulse w-24" />
          <div className="h-3.5 bg-warm-200 rounded-full animate-pulse w-14" />
        </div>

        {/* Bouton panier mobile — visible uniquement < md */}
        <div className="h-9 bg-warm-200 rounded-xl animate-pulse w-full mt-3 md:hidden" />
      </div>
    </article>
  )
}

/**
 * ProductGridSkeleton — Grille de 6 squelettes pour le Suspense fallback.
 * Reproduit exactement la structure de la grille produits.
 */
export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
