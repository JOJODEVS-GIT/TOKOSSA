/**
 * Loading state pour la page produits.
 * Squelette de grille produits avec shimmer.
 */
export default function ProduitsLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Titre */}
      <div className="h-8 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-64 bg-gray-100 rounded mb-8" />

      {/* Filtres skeleton */}
      <div className="flex gap-3 mb-8 overflow-x-auto">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-28 bg-gray-100 rounded-full flex-shrink-0" />
        ))}
      </div>

      {/* Sort select skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-4 w-32 bg-gray-100 rounded" />
        <div className="h-10 w-44 bg-gray-100 rounded-xl" />
      </div>

      {/* Grille produits */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-2">
              <div className="h-3 w-16 bg-gray-100 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="h-5 w-24 bg-gray-100 rounded mt-2" />
              <div className="h-10 w-full bg-gray-100 rounded-xl mt-3 md:hidden" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
