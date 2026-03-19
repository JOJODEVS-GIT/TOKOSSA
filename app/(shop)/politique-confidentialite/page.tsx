import Link from 'next/link'
import type { Metadata } from 'next'

// Metadata SEO pour la Politique de Confidentialite
export const metadata: Metadata = {
  title: 'Politique de Confidentialite | TOKOSSA Benin',
  description:
    'Politique de confidentialite de TOKOSSA. Comment nous collectons et protegeons vos donnees personnelles (telephone, adresse, WhatsApp). Conformite RGPD et droit beninois.',
  openGraph: {
    title: 'Politique de Confidentialite | TOKOSSA',
    description:
      'Vos donnees personnelles sont protegees. Decouvrez comment TOKOSSA collecte et utilise vos informations.',
    url: 'https://tokossa.bj/politique-confidentialite',
    siteName: 'TOKOSSA',
    locale: 'fr_BJ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tokossa.bj/politique-confidentialite',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Date de derniere mise a jour
const DATE_MISE_A_JOUR = '1er mars 2026'

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-warm-50">
      {/* En-tete de la page */}
      <section className="bg-secondary-500 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-primary-300 text-sm font-medium uppercase tracking-widest mb-2">
              Documents legaux
            </p>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">
              Politique de Confidentialite
            </h1>
            <p className="mt-3 text-warm-300 text-sm">
              Derniere mise a jour : {DATE_MISE_A_JOUR}
            </p>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="max-w-2xl mx-auto space-y-10">

          {/* Message d'engagement */}
          <div className="bg-primary-50 border border-primary-100 rounded-2xl p-5 text-sm text-warm-700 leading-relaxed">
            <p className="font-semibold text-secondary-500 mb-1">Notre engagement</p>
            <p>
              TOKOSSA attache une grande importance a la protection de vos donnees personnelles.
              Cette politique explique quelles donnees nous collectons, comment nous les utilisons
              et vos droits concernant ces informations. Nous ne vendons jamais vos donnees a des tiers.
            </p>
          </div>

          {/* Sommaire rapide */}
          <nav className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-base font-bold text-secondary-500 mb-3">
              Sommaire
            </h2>
            <ol className="space-y-1.5 text-sm text-warm-600">
              {[
                ['#section-1', '1. Responsable du traitement'],
                ['#section-2', '2. Donnees collectees'],
                ['#section-3', '3. Finalites du traitement'],
                ['#section-4', '4. Base legale'],
                ['#section-5', '5. Partage des donnees'],
                ['#section-6', '6. Cookies et traceurs'],
                ['#section-7', '7. Duree de conservation'],
                ['#section-8', '8. Securite des donnees'],
                ['#section-9', '9. Vos droits'],
                ['#section-10', '10. Contact'],
              ].map(([href, label]) => (
                <li key={href}>
                  <a
                    href={href}
                    className="text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          {/* Section 1 — Responsable du traitement */}
          <article id="section-1" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              1. Responsable du traitement des donnees
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-2">
              <p>
                Le responsable du traitement de vos donnees personnelles est :
              </p>
              <ul className="space-y-1.5 mt-3">
                <li><span className="font-medium text-secondary-500">Nom commercial :</span> TOKOSSA</li>
                <li><span className="font-medium text-secondary-500">Siege :</span> Cotonou, Republique du Benin</li>
                <li>
                  <span className="font-medium text-secondary-500">Contact :</span>{' '}
                  <a
                    href="https://wa.me/22990000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline"
                  >
                    WhatsApp TOKOSSA
                  </a>
                  {' '}ou{' '}
                  <a href="mailto:contact@tokossa.bj" className="text-primary-600 hover:underline">
                    contact@tokossa.bj
                  </a>
                </li>
              </ul>
            </div>
          </article>

          {/* Section 2 — Donnees collectees */}
          <article id="section-2" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              2. Donnees personnelles collectees
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-4">
              <p>
                Nous collectons uniquement les donnees strictement necessaires a l&apos;execution
                de votre commande et a l&apos;amelioration de votre experience sur TOKOSSA.
              </p>

              {/* Donnees de commande */}
              <div className="bg-warm-50 rounded-xl p-4">
                <p className="font-semibold text-secondary-500 mb-2">
                  Donnees collectees lors d&apos;une commande :
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Numero de telephone</strong> (obligatoire) — Requis pour la
                      confirmation de commande et le suivi via WhatsApp
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Prenom et nom</strong> (obligatoire) — Pour la preparation et
                      la remise du colis
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Adresse de livraison</strong> (obligatoire) — Quartier, rue,
                      point de repere a Cotonou
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-warm-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Adresse email</strong> (optionnel) — Si fournie, pour envoyer
                      les recapitulatifs de commande
                    </span>
                  </li>
                </ul>
              </div>

              {/* Donnees techniques */}
              <div className="bg-warm-50 rounded-xl p-4">
                <p className="font-semibold text-secondary-500 mb-2">
                  Donnees collectees automatiquement :
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-warm-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Adresse IP</strong> — A des fins de securite et de prevention
                      de la fraude
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-warm-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Donnees de navigation</strong> — Pages consultees, duree de session,
                      type d&apos;appareil (via Vercel Analytics, anonymise)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-warm-400 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Historique d&apos;achat</strong> — Produits achetes, montants,
                      dates de commande
                    </span>
                  </li>
                </ul>
              </div>

              <p className="text-xs text-warm-400 italic">
                Nous ne collectons pas de donnees sensibles (donnees biometriques, opinions
                politiques, croyances religieuses, etat de sante).
              </p>
            </div>
          </article>

          {/* Section 3 — Finalites */}
          <article id="section-3" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              3. Finalites du traitement
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-2">
              <p>Vos donnees sont utilisees pour les finalites suivantes :</p>
              <ul className="space-y-2 mt-3">
                {[
                  {
                    titre: 'Traitement des commandes',
                    detail: 'Preparation, livraison et suivi de votre commande jusqu\'a la reception.',
                  },
                  {
                    titre: 'Communication via WhatsApp',
                    detail: 'Envoi de la confirmation de commande, mises a jour de livraison et notifications importantes.',
                  },
                  {
                    titre: 'Service apres-vente',
                    detail: 'Gestion des retours, reclamations et remboursements.',
                  },
                  {
                    titre: 'Amelioration du service',
                    detail: 'Analyse des donnees de navigation (anonymisees) pour ameliorer l\'experience utilisateur.',
                  },
                  {
                    titre: 'Prevention de la fraude',
                    detail: 'Detection des commandes frauduleuses et securisation des paiements.',
                  },
                  {
                    titre: 'Marketing (avec consentement)',
                    detail: 'Envoi de promotions via WhatsApp uniquement si le client y a consenti. Desinscription possible a tout moment.',
                  },
                ].map((item) => (
                  <li key={item.titre} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>
                      <strong className="text-secondary-500">{item.titre}</strong> — {item.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          {/* Section 4 — Base legale */}
          <article id="section-4" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              4. Base legale du traitement
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Le traitement de vos donnees repose sur les bases legales suivantes,
                conformement au droit beninois sur la protection des donnees personnelles
                et aux standards internationaux (RGPD) :
              </p>
              <ul className="space-y-2">
                <li className="bg-warm-50 rounded-xl p-3">
                  <span className="font-semibold text-secondary-500">Execution du contrat :</span>{' '}
                  Le traitement de votre telephone, nom et adresse est necessaire pour executer
                  votre commande. Sans ces donnees, TOKOSSA ne peut pas livrer votre commande.
                </li>
                <li className="bg-warm-50 rounded-xl p-3">
                  <span className="font-semibold text-secondary-500">Interet legitime :</span>{' '}
                  Analyses de navigation anonymisees, prevention de la fraude et securite
                  informatique.
                </li>
                <li className="bg-warm-50 rounded-xl p-3">
                  <span className="font-semibold text-secondary-500">Consentement :</span>{' '}
                  Envoi de communications marketing par WhatsApp — uniquement avec votre
                  accord explicite, revocable a tout moment.
                </li>
              </ul>
            </div>
          </article>

          {/* Section 5 — Partage des donnees */}
          <article id="section-5" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              5. Partage des donnees avec des tiers
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-4">
              <p>
                <strong className="text-secondary-500">
                  TOKOSSA ne vend jamais vos donnees personnelles.
                </strong>{' '}
                Vos donnees peuvent etre partagees avec les prestataires suivants, dans la limite
                strictement necessaire a leur mission :
              </p>

              {/* KKiaPay */}
              <div className="border border-warm-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-500">KKiaPay — Prestataire de paiement</p>
                    <p className="text-warm-500 mt-1">
                      Traitement des paiements Mobile Money (MTN, Moov, Wave). KKiaPay recoit
                      le montant et le numero de telephone lie au paiement. TOKOSSA ne stocke
                      aucune information bancaire ou de paiement.
                    </p>
                    <a
                      href="https://kkiapay.me"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-xs mt-1 inline-block"
                    >
                      Politique de KKiaPay →
                    </a>
                  </div>
                </div>
              </div>

              {/* Meta / WhatsApp */}
              <div className="border border-warm-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-500">Meta — WhatsApp Business API</p>
                    <p className="text-warm-500 mt-1">
                      Envoi des notifications de commande, confirmations et suivi via WhatsApp.
                      Meta (proprietaire de WhatsApp) traite les messages conformement a ses
                      propres conditions. Votre numero est utilise uniquement pour les
                      communications liees a vos commandes TOKOSSA.
                    </p>
                    <a
                      href="https://www.whatsapp.com/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline text-xs mt-1 inline-block"
                    >
                      Politique de confidentialite WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

              {/* Cloudinary */}
              <div className="border border-warm-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-500">Cloudinary — Hebergement des images</p>
                    <p className="text-warm-500 mt-1">
                      Les images des produits sont stockees sur Cloudinary. Aucune donnee
                      personnelle client n&apos;est transmise a Cloudinary.
                    </p>
                  </div>
                </div>
              </div>

              {/* Vercel */}
              <div className="border border-warm-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-secondary-500">Vercel — Hebergement du site</p>
                    <p className="text-warm-500 mt-1">
                      Le site tokossa.bj est heberg sur les serveurs Vercel. Les donnees de
                      navigation sont collectees de maniere aggregee et anonymisee via Vercel
                      Analytics pour mesurer les performances du site.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-warm-400 italic">
                Aucun partage avec des agences marketing, revendeurs de donnees ou autres
                tiers commerciaux.
              </p>
            </div>
          </article>

          {/* Section 6 — Cookies et traceurs */}
          <article id="section-6" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              6. Cookies et traceurs
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-4">
              <p>
                TOKOSSA utilise des cookies et technologies de suivi pour le bon
                fonctionnement du site et l&apos;analyse des performances.
              </p>

              <div className="space-y-3">
                {/* Cookies essentiels */}
                <div className="bg-green-50 border border-green-100 rounded-xl p-4">
                  <p className="font-semibold text-green-700 mb-1">Cookies essentiels (obligatoires)</p>
                  <p className="text-warm-600">
                    Session d&apos;authentification, panier d&apos;achat, preferences de langue.
                    Ces cookies sont indispensables au fonctionnement du site et ne peuvent
                    pas etre desactives.
                  </p>
                </div>

                {/* Facebook Pixel */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="font-semibold text-blue-700 mb-1">Facebook Pixel (analytique / publicite)</p>
                  <p className="text-warm-600">
                    TOKOSSA utilise le <strong>Facebook Pixel</strong> pour mesurer l&apos;efficacite
                    de ses publicites Facebook et Instagram, et pour afficher des publicites
                    pertinentes aux visiteurs du site. Ce traceur envoie des evenements anonymes
                    (pages visitees, ajouts au panier, achats) a Meta.
                  </p>
                  <p className="text-warm-500 mt-2">
                    Vous pouvez vous opposer a ce suivi en utilisant les outils de
                    consentement aux cookies presents sur le site, ou via les parametres
                    de confidentialite de votre compte Facebook.
                  </p>
                </div>

                {/* Vercel Analytics */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                  <p className="font-semibold text-gray-700 mb-1">Vercel Analytics (performances)</p>
                  <p className="text-warm-600">
                    Mesure des performances du site (vitesse de chargement, pages les plus
                    visitees) de maniere entierement anonymisee. Aucune donnee personnelle
                    n&apos;est collectee par cet outil.
                  </p>
                </div>
              </div>
            </div>
          </article>

          {/* Section 7 — Duree de conservation */}
          <article id="section-7" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              7. Duree de conservation des donnees
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Vos donnees sont conservees uniquement le temps necessaire aux finalites
                pour lesquelles elles ont ete collectees :
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-warm-50">
                      <th className="text-left p-3 font-semibold text-secondary-500 border border-warm-200 rounded-tl-lg">
                        Type de donnee
                      </th>
                      <th className="text-left p-3 font-semibold text-secondary-500 border border-warm-200 rounded-tr-lg">
                        Duree de conservation
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['Donnees de commande', '5 ans (obligations comptables et fiscales)'],
                      ['Donnees de compte client', '3 ans apres la derniere activite'],
                      ['Historique de navigation', '13 mois maximum (cookies)'],
                      ['Donnees de paiement', 'Non conservees par TOKOSSA (grees par KKiaPay)'],
                      ['Donnees marketing', 'Jusqu\'a desinscription ou 3 ans sans activite'],
                    ].map(([type, duree], index) => (
                      <tr key={type} className={index % 2 === 0 ? 'bg-white' : 'bg-warm-50'}>
                        <td className="p-3 border border-warm-200 font-medium text-secondary-500">{type}</td>
                        <td className="p-3 border border-warm-200 text-warm-600">{duree}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>
                A l&apos;expiration de ces delais, vos donnees sont supprimees de maniere
                definitive ou anonymisees.
              </p>
            </div>
          </article>

          {/* Section 8 — Securite */}
          <article id="section-8" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              8. Securite des donnees
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA met en oeuvre des mesures techniques et organisationnelles
                appropriees pour proteger vos donnees personnelles :
              </p>
              <ul className="space-y-2">
                {[
                  'Connexion chiffree HTTPS (TLS) sur toutes les pages du site',
                  'Acces a la base de donnees restreint et protege par mot de passe fort',
                  'Stockage des mots de passe avec hachage securise (bcrypt)',
                  'Paiements traites par KKiaPay — TOKOSSA ne voit jamais vos informations de compte Mobile Money',
                  'Acces au panneau d\'administration protege par authentification a deux niveaux',
                  'Sauvegardes regulieres de la base de donnees',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <svg
                      className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p>
                En cas de violation de donnees pouvant porter atteinte a vos droits,
                TOKOSSA s&apos;engage a vous en informer dans les meilleurs delais via
                WhatsApp ou email.
              </p>
            </div>
          </article>

          {/* Section 9 — Vos droits */}
          <article id="section-9" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              9. Vos droits sur vos donnees
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-4">
              <p>
                Conformement a la legislation applicable sur la protection des donnees
                personnelles, vous disposez des droits suivants :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    titre: 'Droit d\'acces',
                    detail: 'Obtenir une copie de toutes les donnees que TOKOSSA detient sur vous.',
                    icon: '👁',
                  },
                  {
                    titre: 'Droit de rectification',
                    detail: 'Corriger des donnees inexactes ou incompletes vous concernant.',
                    icon: '✏️',
                  },
                  {
                    titre: 'Droit a l\'effacement',
                    detail: 'Demander la suppression de vos donnees, sous reserve des obligations legales.',
                    icon: '🗑',
                  },
                  {
                    titre: 'Droit d\'opposition',
                    detail: 'Vous opposer au traitement de vos donnees a des fins marketing.',
                    icon: '🚫',
                  },
                  {
                    titre: 'Droit a la portabilite',
                    detail: 'Recevoir vos donnees dans un format lisible (CSV, JSON).',
                    icon: '📦',
                  },
                  {
                    titre: 'Droit de retrait du consentement',
                    detail: 'Retirer votre consentement aux communications marketing a tout moment.',
                    icon: '↩️',
                  },
                ].map((droit) => (
                  <div key={droit.titre} className="bg-warm-50 rounded-xl p-4">
                    <p className="font-semibold text-secondary-500 mb-1">{droit.titre}</p>
                    <p className="text-warm-500">{droit.detail}</p>
                  </div>
                ))}
              </div>
              <p>
                Pour exercer l&apos;un de ces droits, contactez-nous via WhatsApp ou a l&apos;adresse
                email ci-dessous. Nous repondrons dans un delai de{' '}
                <strong className="text-secondary-500">30 jours</strong>.
              </p>
            </div>
          </article>

          {/* Section 10 — Contact */}
          <article id="section-10" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              10. Nous contacter
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Pour toute question relative a cette politique de confidentialite ou pour
                exercer vos droits sur vos donnees personnelles :
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/22990000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                  </svg>
                  WhatsApp TOKOSSA
                </a>
                <a
                  href="mailto:contact@tokossa.bj"
                  className="inline-flex items-center justify-center gap-2 bg-secondary-500 hover:bg-secondary-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  contact@tokossa.bj
                </a>
              </div>
              <p>
                Si vous estimez que vos droits n&apos;ont pas ete respectes, vous pouvez
                saisir l&apos;autorite de protection des donnees personnelles competente en
                Republique du Benin.
              </p>
            </div>
          </article>

          {/* Liens legaux annexes */}
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link
              href="/cgu"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Conditions Generales de Vente
            </Link>
            <span className="text-warm-300">|</span>
            <Link
              href="/a-propos"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              A propos de TOKOSSA
            </Link>
            <span className="text-warm-300">|</span>
            <Link
              href="/"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Retour a la boutique
            </Link>
          </div>

          <p className="text-center text-xs text-warm-400 pb-6">
            TOKOSSA &copy; {new Date().getFullYear()} — Tous droits reserves — Cotonou, Benin
          </p>
        </div>
      </div>
    </div>
  )
}
