/**
 * Loading state pour la page clients admin.
 */
export default function ClientsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Titre */}
      <div>
        <div className="h-7 w-24 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-40 bg-gray-100 rounded" />
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-3 bg-gray-50">
          <div className="h-3 w-full bg-gray-100 rounded" />
        </div>
        <div className="divide-y">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-3 w-24 bg-gray-100 rounded" />
              </div>
              <div className="h-4 w-28 bg-gray-100 rounded" />
              <div className="h-6 w-24 bg-gray-100 rounded-full" />
              <div className="h-4 w-24 bg-gray-200 rounded" />
              <div className="h-8 w-24 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
