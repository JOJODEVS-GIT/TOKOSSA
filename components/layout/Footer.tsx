import Link from 'next/link'

const footerLinks = {
  boutique: [
    { label: 'Accueil', href: '/' },
    { label: 'Tous les produits', href: '/produits' },
    { label: 'Promotions', href: '/produits?sort=promo' },
    { label: 'Nouveautes', href: '/produits?sort=recent' },
  ],
  aide: [
    { label: 'Suivi de commande', href: '/commandes' },
    { label: 'Mes favoris', href: '/favoris' },
    { label: 'Mon profil', href: '/profil' },
    { label: 'Conditions generales', href: '#' },
    { label: 'Politique de retour', href: '#' },
  ],
}

const paymentMethods = [
  { name: 'MTN Mobile Money', abbr: 'MTN' },
  { name: 'Moov Money', abbr: 'Moov' },
  { name: 'Celtis Money', abbr: 'Celtis' },
  { name: 'Paiement a la livraison', abbr: 'Cash' },
]

const deliveryZones = [
  'Cotonou Centre', 'Cadjehoun', 'Akpakpa', 'Calavi',
  'Godomey', 'Porto-Novo', 'Seme-Kpodji', 'Ouidah',
]

export default function Footer() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'

  return (
    <footer className="bg-secondary-500 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-bold tracking-tight">
                <span className="text-white">TO</span>
                <span className="text-primary-400">KOSSA</span>
              </span>
            </Link>
            <p className="text-warm-300 text-sm leading-relaxed mb-4">
              Votre boutique en ligne au Benin. Produits de qualite, livraison rapide a Cotonou et environs.
            </p>

            {/* WhatsApp Contact */}
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Assistance WhatsApp
            </a>
          </div>

          {/* Boutique Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Boutique
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.boutique.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Aide
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.aide.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-warm-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Paiement & Livraison */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-4">
              Paiement
            </h3>
            <div className="flex flex-wrap gap-2 mb-6">
              {paymentMethods.map((method) => (
                <span
                  key={method.abbr}
                  className="inline-flex items-center gap-1.5 bg-white/10 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                  title={method.name}
                >
                  <svg className="w-3.5 h-3.5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {method.abbr}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-semibold uppercase tracking-wider text-warm-300 mb-3">
              Livraison
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {deliveryZones.map((zone) => (
                <span
                  key={zone}
                  className="text-xs text-warm-400 bg-white/5 px-2 py-1 rounded"
                >
                  {zone}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-warm-400">
            <p>&copy; 2026 TOKOSSA. Tous droits reserves.</p>
            <p>Livraison a Cotonou et environs &bull; Paiement securise</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
