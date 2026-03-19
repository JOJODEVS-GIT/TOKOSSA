/**
 * Loading state pour la page commandes admin.
 */
export default function CommandesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Titre */}
      <div>
        <div className="h-7 w-36 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-32 bg-gray-100 rounded" />
      </div>

      {/* Onglets */}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-10 w-24 bg-gray-100 rounded-full" />
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-gray-50">
          <div className="h-3 w-full bg-gray-100 rounded" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="flex items-center gap-4">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-8 w-28 bg-gray-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
