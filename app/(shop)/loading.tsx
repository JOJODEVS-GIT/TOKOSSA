/**
 * Loading state pour le layout boutique.
 * Squelette avec cards placeholder animees (shimmer).
 */
export default function ShopLoading() {
  return (
    <div className="min-h-screen animate-pulse">
      {/* Hero skeleton */}
      <div className="bg-gray-200 h-64 md:h-80" />

      {/* Trust badges skeleton */}
      <div className="py-4 bg-white border-b">
        <div className="container mx-auto px-4 flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 w-32 bg-gray-100 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Categories skeleton */}
      <div className="py-10">
        <div className="container mx-auto px-4">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-10 w-28 bg-gray-100 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>
      </div>

      {/* Products grid skeleton */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="h-7 w-56 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-warm-50 rounded-2xl overflow-hidden">
                <div className="aspect-square bg-gray-200" />
                <div className="p-4 space-y-2">
                  <div className="h-3 w-16 bg-gray-100 rounded" />
                  <div className="h-4 w-full bg-gray-200 rounded" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded" />
                  <div className="h-5 w-24 bg-gray-100 rounded mt-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
