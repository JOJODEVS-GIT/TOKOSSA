/**
 * Loading state pour le dashboard admin.
 * Squelette de stats, commandes recentes et actions rapides.
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Titre */}
      <div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-56 bg-gray-100 rounded" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
            <div className="h-3 w-28 bg-gray-100 rounded mb-3" />
            <div className="h-7 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Commandes recentes skeleton */}
      <div className="bg-white rounded-2xl shadow-sm">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="h-5 w-44 bg-gray-200 rounded" />
          <div className="h-4 w-20 bg-gray-100 rounded" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="p-6 flex items-center justify-between">
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-40 bg-gray-100 rounded" />
              </div>
              <div className="text-right">
                <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex-shrink-0" />
            <div>
              <div className="h-4 w-32 bg-gray-200 rounded mb-2" />
              <div className="h-3 w-44 bg-gray-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
