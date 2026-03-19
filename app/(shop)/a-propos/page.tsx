import Link from 'next/link'
import type { Metadata } from 'next'

// Metadata SEO pour la page A propos
export const metadata: Metadata = {
  title: 'A propos de TOKOSSA | E-commerce Benin',
  description:
    'Decouvrez TOKOSSA, votre boutique en ligne au Benin. Une equipe passionnee basee a Cotonou pour democratiser le e-commerce avec des produits de qualite et une livraison rapide.',
  openGraph: {
    title: 'A propos de TOKOSSA',
    description:
      'TOKOSSA, votre boutique en ligne au Benin. Qualite, rapidite et confiance a Cotonou et environs.',
    url: 'https://tokossa.bj/a-propos',
    siteName: 'TOKOSSA',
    locale: 'fr_BJ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tokossa.bj/a-propos',
  },
}

// Valeurs de la marque avec icones SVG inline
const valeurs = [
  {
    titre: 'Qualite',
    description:
      'Chaque produit est selectionne avec soin pour garantir votre satisfaction. Nous ne vendons que ce que nous utiliserions nous-memes.',
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
  },
  {
    titre: 'Rapidite',
    description:
      'Livraison en 24h a Cotonou et environs. Votre commande est preparee et expediee le jour meme.',
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
  },
  {
    titre: 'Confiance',
    description:
      'Paiement securise par Mobile Money (MTN, Moov, Celtis) ou a la livraison. Retour possible sous 7 jours.',
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
    ),
  },
  {
    titre: 'Proximite',
    description:
      'Une equipe locale, joignable sur WhatsApp 7j/7. Nous parlons francais, fon et vous comprenons.',
    icon: (
      <svg
        className="w-8 h-8 text-primary-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
]

// Membres de l'equipe
const equipe = [
  {
    nom: 'Arnaud K.',
    role: 'Fondateur & CEO',
    initiales: 'AK',
    couleur: 'bg-primary-500',
  },
  {
    nom: 'Grace A.',
    role: 'Service Client',
    initiales: 'GA',
    couleur: 'bg-accent-500',
  },
  {
    nom: 'Boris D.',
    role: 'Logistique & Livraison',
    initiales: 'BD',
    couleur: 'bg-green-500',
  },
]

// Chiffres cles
const chiffres = [
  { valeur: '500+', label: 'Clients satisfaits' },
  { valeur: '24h', label: 'Delai de livraison' },
  { valeur: '4.9/5', label: 'Note moyenne' },
  { valeur: '1000+', label: 'Commandes livrees' },
]

// Questions frequentes
const faq = [
  {
    question: 'Quels sont les delais de livraison ?',
    reponse:
      'Nous livrons en 24h a Cotonou et dans les quartiers proches (Cadjehoun, Akpakpa, Calavi, Godomey). Pour Porto-Novo et Ouidah, comptez 48h maximum.',
  },
  {
    question: 'Quels moyens de paiement acceptez-vous ?',
    reponse:
      'Nous acceptons MTN Mobile Money, Moov Money, Celtis Money et le paiement a la livraison (cash). Tous les paiements sont securises via KKiaPay.',
  },
  {
    question: 'Puis-je retourner un produit ?',
    reponse:
      'Oui, vous avez 7 jours apres reception pour retourner un produit non utilise dans son emballage d\'origine. Contactez-nous sur WhatsApp pour initier le retour.',
  },
  {
    question: 'Comment suivre ma commande ?',
    reponse:
      'Apres votre achat, vous recevez une confirmation par WhatsApp avec votre numero de commande. Vous pouvez suivre l\'avancement dans la section "Mes commandes" ou en nous contactant directement.',
  },
]

export default function AProposPage() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-secondary-500 text-white overflow-hidden">
        {/* Motif decoratif */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500 to-accent-500 opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
              A propos de{' '}
              <span className="text-gradient">TOKOSSA</span>
            </h1>
            <p className="text-lg text-warm-200 leading-relaxed">
              Votre boutique en ligne de confiance au Benin. Des produits de
              qualite, une livraison rapide et un service client a votre ecoute.
            </p>
          </div>
        </div>
      </section>

      {/* Notre Histoire */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-6 text-center">
              Notre histoire
            </h2>
            <div className="space-y-4 text-warm-600 leading-relaxed">
              <p>
                TOKOSSA est ne a Cotonou, au coeur du Benin. Fonde par une
                equipe passionnee de jeunes entrepreneurs beninois, notre
                mission est simple :{' '}
                <strong className="text-secondary-500">
                  democratiser le e-commerce au Benin
                </strong>
                .
              </p>
              <p>
                Nous avons constate que beaucoup de Beninois souhaitent acheter
                en ligne mais manquent de plateformes fiables, avec des
                produits de qualite et des moyens de paiement adaptes. C&apos;est
                pourquoi nous avons cree TOKOSSA : une boutique pensee pour
                vous, avec le paiement Mobile Money que vous utilisez au
                quotidien et une livraison rapide jusque chez vous.
              </p>
              <p>
                Chaque jour, nous travaillons pour vous offrir les meilleurs
                produits au meilleur prix, livres directement a votre porte a
                Cotonou et dans les villes environnantes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Valeurs */}
      <section className="py-12 md:py-16 bg-warm-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-8 text-center">
            Nos valeurs
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-3xl mx-auto">
            {valeurs.map((valeur) => (
              <div
                key={valeur.titre}
                className="bg-white rounded-2xl p-6 shadow-sm border border-warm-100 hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-4">
                  {valeur.icon}
                </div>
                <h3 className="text-lg font-bold text-secondary-500 mb-2">
                  {valeur.titre}
                </h3>
                <p className="text-sm text-warm-500 leading-relaxed">
                  {valeur.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Equipe */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-2 text-center">
            Notre equipe
          </h2>
          <p className="text-warm-500 text-center mb-8">
            Des passionnes au service de votre satisfaction
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {equipe.map((membre) => (
              <div key={membre.nom} className="text-center">
                {/* Avatar avec initiales */}
                <div
                  className={`w-20 h-20 ${membre.couleur} rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg`}
                >
                  <span className="text-2xl font-bold text-white">
                    {membre.initiales}
                  </span>
                </div>
                <h3 className="font-semibold text-secondary-500">
                  {membre.nom}
                </h3>
                <p className="text-sm text-warm-500">{membre.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nos Chiffres */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-primary-50 to-warm-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-8 text-center">
            TOKOSSA en chiffres
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {chiffres.map((chiffre) => (
              <div
                key={chiffre.label}
                className="bg-white rounded-2xl p-5 text-center shadow-sm border border-warm-100"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary-500 mb-1">
                  {chiffre.valeur}
                </p>
                <p className="text-xs md:text-sm text-warm-500">
                  {chiffre.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Nous Trouver */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-6">
              Nous trouver
            </h2>
            <div className="bg-warm-50 rounded-2xl p-6 border border-warm-100">
              {/* Localisation */}
              <div className="flex items-center justify-center gap-2 mb-3">
                <svg
                  className="w-5 h-5 text-primary-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-secondary-500 font-semibold">
                  Cotonou, Benin
                </p>
              </div>
              <p className="text-sm text-warm-500 mb-6">
                Nous operons depuis Cotonou et livrons dans toute la zone
                metropolitaine et les villes voisines.
              </p>

              {/* Boutons de contact */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href="https://maps.google.com/?q=Cotonou,Benin"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                    />
                  </svg>
                  Voir sur Google Maps
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  Contacter sur WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 md:py-16 bg-warm-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-secondary-500 mb-8 text-center">
              Questions frequentes
            </h2>
            <div className="space-y-4">
              {faq.map((item) => (
                <div
                  key={item.question}
                  className="bg-white rounded-2xl p-5 shadow-sm border border-warm-100"
                >
                  <h3 className="font-semibold text-secondary-500 mb-2">
                    {item.question}
                  </h3>
                  <p className="text-sm text-warm-500 leading-relaxed">
                    {item.reponse}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-14 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Pret a decouvrir nos produits ?
          </h2>
          <p className="text-primary-100 mb-6">
            Rejoignez plus de 500 clients satisfaits a Cotonou et environs
          </p>
          <Link
            href="/produits"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-semibold px-8 py-3 rounded-xl shadow-xl hover:bg-primary-50 transition-colors"
          >
            Commencer vos achats
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 7l5 5m0 0l-5 5m5-5H6"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
