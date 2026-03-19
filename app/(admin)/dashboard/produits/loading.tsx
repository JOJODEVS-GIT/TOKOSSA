/**
 * Loading state pour la page produits admin.
 */
export default function ProduitsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Titre + bouton */}
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-4 w-32 bg-gray-100 rounded" />
        </div>
        <div className="h-12 w-44 bg-gray-200 rounded-xl" />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-gray-50">
          <div className="h-3 w-full bg-gray-100 rounded" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-48 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-20 bg-gray-200 rounded" />
              <div className="h-6 w-12 bg-gray-100 rounded-lg" />
              <div className="h-6 w-16 bg-gray-100 rounded-full" />
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-gray-100 rounded" />
                <div className="h-4 w-18 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
