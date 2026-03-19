import Link from 'next/link'

/**
 * Page 404 personnalisee TOKOSSA.
 * Design avec les couleurs terracotta/indigo du projet.
 * Lien de retour vers la page d'accueil.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Numero 404 stylise */}
        <div className="relative mb-6">
          <p className="text-[120px] md:text-[160px] font-bold leading-none text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-primary-300">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-24 h-24 text-secondary-500 opacity-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={0.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-secondary-500 mb-3">
          Page introuvable
        </h1>
        <p className="text-warm-500 mb-8 leading-relaxed">
          Desolee, la page que vous cherchez n&apos;existe pas ou a ete deplacee.
          Retournez a la boutique pour decouvrir nos produits.
        </p>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/25 hover:shadow-xl transition-shadow"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour a l&apos;accueil
          </Link>

          <Link
            href="/produits"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-warm-200 text-secondary-500 rounded-xl font-semibold hover:bg-warm-50 transition-colors"
          >
            Voir les produits
          </Link>
        </div>

        {/* Lien WhatsApp */}
        <p className="mt-8 text-sm text-warm-400">
          Besoin d&apos;aide ?{' '}
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Contactez-nous sur WhatsApp
          </a>
        </p>
      </div>
    </div>
  )
}
