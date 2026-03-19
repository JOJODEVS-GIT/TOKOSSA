import Link from 'next/link'
import type { Metadata } from 'next'

// Metadata SEO pour les Conditions Generales de Vente
export const metadata: Metadata = {
  title: 'Conditions Generales de Vente | TOKOSSA Benin',
  description:
    'Conditions Generales de Vente de TOKOSSA, boutique en ligne au Benin. Paiement Mobile Money (MTN, Moov, Wave) ou a la livraison. Livraison a Cotonou en 24h. Retours sous 48h.',
  openGraph: {
    title: 'Conditions Generales de Vente | TOKOSSA',
    description:
      'Consultez les conditions de vente de TOKOSSA : paiement, livraison, retours, garanties.',
    url: 'https://tokossa.bj/cgu',
    siteName: 'TOKOSSA',
    locale: 'fr_BJ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tokossa.bj/cgu',
  },
  robots: {
    index: true,
    follow: true,
  },
}

// Date de derniere mise a jour des CGV
const DATE_MISE_A_JOUR = '1er mars 2026'

export default function CGUPage() {
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
              Conditions Generales de Vente
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

          {/* Sommaire rapide */}
          <nav className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-base font-bold text-secondary-500 mb-3">
              Sommaire
            </h2>
            <ol className="space-y-1.5 text-sm text-warm-600">
              {[
                ['#article-1', '1. Identification du vendeur'],
                ['#article-2', '2. Champ d\'application'],
                ['#article-3', '3. Produits et disponibilite'],
                ['#article-4', '4. Prix'],
                ['#article-5', '5. Commande'],
                ['#article-6', '6. Paiement'],
                ['#article-7', '7. Livraison'],
                ['#article-8', '8. Retours et remboursements'],
                ['#article-9', '9. Garanties'],
                ['#article-10', '10. Responsabilite'],
                ['#article-11', '11. Protection des donnees'],
                ['#article-12', '12. Litiges et droit applicable'],
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

          {/* Article 1 — Identification du vendeur */}
          <article id="article-1" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 1 — Identification du vendeur
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-2">
              <p>
                Le site <strong className="text-secondary-500">tokossa.bj</strong> est exploite
                par la societe commerciale <strong className="text-secondary-500">TOKOSSA</strong>,
                enregistree au Registre du Commerce et du Credit Mobilier (RCCM) du Benin.
              </p>
              <ul className="space-y-1 mt-3">
                <li><span className="font-medium text-secondary-500">Denomination :</span> TOKOSSA</li>
                <li><span className="font-medium text-secondary-500">Siege social :</span> Cotonou, Republique du Benin</li>
                <li><span className="font-medium text-secondary-500">Activite :</span> Commerce electronique de detail</li>
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
                </li>
                <li>
                  <span className="font-medium text-secondary-500">Email :</span>{' '}
                  <a href="mailto:contact@tokossa.bj" className="text-primary-600 hover:underline">
                    contact@tokossa.bj
                  </a>
                </li>
              </ul>
            </div>
          </article>

          {/* Article 2 — Champ d'application */}
          <article id="article-2" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 2 — Champ d&apos;application
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Les presentes Conditions Generales de Vente (CGV) s&apos;appliquent a toutes
                les ventes conclues entre TOKOSSA et ses clients via le site{' '}
                <strong className="text-secondary-500">tokossa.bj</strong> ou via WhatsApp.
              </p>
              <p>
                Toute commande passee sur notre plateforme implique l&apos;acceptation pleine
                et entiere des presentes CGV. Le client declare avoir pris connaissance de
                ces conditions avant de valider sa commande.
              </p>
              <p>
                TOKOSSA se reserve le droit de modifier ces CGV a tout moment. Les CGV
                applicables sont celles en vigueur au moment de la passation de la commande.
              </p>
            </div>
          </article>

          {/* Article 3 — Produits et disponibilite */}
          <article id="article-3" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 3 — Produits et disponibilite
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Les produits proposes a la vente sont decrits avec la plus grande exactitude
                possible. Les photographies, descriptions et caracteristiques figurant sur le
                site sont fournies a titre indicatif et ne sont pas contractuelles.
              </p>
              <p>
                TOKOSSA s&apos;engage a afficher en temps reel la disponibilite des produits.
                Si un produit commande s&apos;avere etre en rupture de stock apres validation
                de la commande, TOKOSSA contactera le client par WhatsApp dans un delai de
                24h pour proposer :
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Un produit equivalent de meme valeur</li>
                <li>Un bon d&apos;achat valable 30 jours</li>
                <li>Un remboursement integral si le paiement a deja ete effectue</li>
              </ul>
            </div>
          </article>

          {/* Article 4 — Prix */}
          <article id="article-4" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 4 — Prix
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Tous les prix affiches sur tokossa.bj sont exprimes en{' '}
                <strong className="text-secondary-500">Francs CFA (FCFA)</strong> et sont
                exprimes toutes taxes comprises (TTC).
              </p>
              <p>
                Les frais de livraison sont affiches separement lors du processus de commande
                et sont inclus dans le montant total avant validation. TOKOSSA se reserve le
                droit de modifier ses prix a tout moment, sans preavis. Les prix appliques
                sont ceux en vigueur au moment de la validation de la commande.
              </p>
              <div className="bg-primary-50 rounded-xl p-4 mt-2">
                <p className="font-medium text-secondary-500 mb-1">Frais de livraison actuels :</p>
                <ul className="space-y-1 text-warm-600">
                  <li>Cotonou centre-ville : <span className="font-semibold text-secondary-500">1 000 FCFA</span></li>
                  <li>Cotonou peripherie (Calavi, Godomey, Akpakpa) : <span className="font-semibold text-secondary-500">1 500 FCFA</span></li>
                  <li>Porto-Novo, Ouidah : <span className="font-semibold text-secondary-500">2 000 FCFA</span></li>
                  <li>Autres villes du Benin : tarif sur devis via WhatsApp</li>
                </ul>
              </div>
            </div>
          </article>

          {/* Article 5 — Commande */}
          <article id="article-5" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 5 — Passation de commande
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Pour passer commande sur TOKOSSA, le client doit :
              </p>
              <ol className="list-decimal list-inside space-y-1.5 pl-2">
                <li>Selectionner le(s) produit(s) souhaite(s) et les ajouter au panier</li>
                <li>Acceder au panier et verifier la commande</li>
                <li>Renseigner ses informations de livraison (nom, telephone, adresse)</li>
                <li>Choisir son mode de paiement</li>
                <li>Valider et confirmer la commande</li>
              </ol>
              <p>
                Un message de confirmation est envoye sur WhatsApp apres validation de la
                commande. Ce message contient le numero de commande et le recapitulatif des
                articles commandes.
              </p>
              <p>
                TOKOSSA se reserve le droit d&apos;annuler toute commande suspecte, frauduleuse
                ou passee en violation des presentes CGV, apres en avoir informe le client.
              </p>
            </div>
          </article>

          {/* Article 6 — Paiement */}
          <article id="article-6" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 6 — Paiement
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA accepte les moyens de paiement suivants :
              </p>

              {/* Moyens de paiement Mobile Money */}
              <div className="bg-warm-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-secondary-500">Mobile Money (via KKiaPay) :</p>
                <ul className="space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0" />
                    <span><strong>MTN Mobile Money</strong> — Numero MTN Benin requis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                    <span><strong>Moov Money</strong> — Numero Moov Benin requis</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                    <span><strong>Wave</strong> — Via l&apos;application Wave</span>
                  </li>
                </ul>
              </div>

              {/* Paiement a la livraison */}
              <div className="bg-warm-50 rounded-xl p-4">
                <p className="font-semibold text-secondary-500 mb-1">Paiement a la livraison (cash) :</p>
                <p>
                  Le client regle le montant exact en especes directement au livreur lors
                  de la reception du colis. Ce mode de paiement est disponible uniquement
                  a Cotonou et dans les villes desservies par TOKOSSA.
                </p>
              </div>

              <p>
                Le paiement par Mobile Money est traite de maniere securisee par{' '}
                <strong className="text-secondary-500">KKiaPay</strong>, prestataire de
                paiement agree au Benin. TOKOSSA ne collecte ni ne stocke les informations
                de paiement des clients — ces donnees sont traitees exclusivement par KKiaPay.
              </p>
              <p>
                En cas d&apos;echec de paiement Mobile Money, le client est invite a reessayer
                ou a contacter TOKOSSA via WhatsApp pour finaliser sa commande.
              </p>
            </div>
          </article>

          {/* Article 7 — Livraison */}
          <article id="article-7" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 7 — Livraison
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA livre exclusivement en <strong className="text-secondary-500">Republique du Benin</strong>.
                La zone de livraison principale est Cotonou et ses environs immédiats.
              </p>

              <div className="bg-warm-50 rounded-xl p-4 space-y-2">
                <p className="font-semibold text-secondary-500">Delais de livraison indicatifs :</p>
                <ul className="space-y-1">
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600 w-28 flex-shrink-0">Cotonou :</span>
                    <span>24h apres confirmation de paiement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600 w-28 flex-shrink-0">Porto-Novo :</span>
                    <span>24 a 48h apres confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600 w-28 flex-shrink-0">Ouidah :</span>
                    <span>24 a 48h apres confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-semibold text-primary-600 w-28 flex-shrink-0">Autres villes :</span>
                    <span>Sur devis et accord prealable via WhatsApp</span>
                  </li>
                </ul>
              </div>

              <p>
                Ces delais sont donnes a titre indicatif et peuvent etre impactes par des
                circonstances exterieures (jours feries, conditions meteorologiques, evenements
                imprevisibles). TOKOSSA s&apos;engage a informer le client par WhatsApp de tout
                retard significatif.
              </p>
              <p>
                A reception du colis, le client est invite a verifier l&apos;etat du produit en
                presence du livreur. Toute anomalie (colis abime, produit manquant) doit etre
                signalee au livreur et a TOKOSSA par WhatsApp dans les 2 heures suivant la livraison.
              </p>
            </div>
          </article>

          {/* Article 8 — Retours et remboursements */}
          <article id="article-8" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 8 — Retours et remboursements
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA accorde un droit de retour de{' '}
                <strong className="text-secondary-500">7 jours</strong> a compter de la
                reception du produit, sous les conditions suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Le produit n&apos;a pas ete utilise</li>
                <li>Le produit est dans son emballage d&apos;origine, intact</li>
                <li>Le client dispose du numero de commande</li>
                <li>La demande est effectuee via WhatsApp dans le delai imparti</li>
              </ul>

              <p className="font-medium text-secondary-500">Produits non retournables :</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Produits alimentaires ou perissables</li>
                <li>Produits d&apos;hygiene et beaute ouverts ou utilises</li>
                <li>Produits endommages par le client apres reception</li>
                <li>Produits personnalises ou commandes sur mesure</li>
              </ul>

              <p className="font-medium text-secondary-500 mt-2">Procedure de retour :</p>
              <ol className="list-decimal list-inside space-y-1.5 pl-2">
                <li>Contacter TOKOSSA sur WhatsApp avec le numero de commande et la raison du retour</li>
                <li>Recevoir la confirmation et les instructions de retour de notre equipe</li>
                <li>Remettre le produit au livreur TOKOSSA (un livreur passera le reprendre)</li>
                <li>Le remboursement est effectue sous 5 jours ouvrables</li>
              </ol>

              <div className="bg-warm-50 rounded-xl p-4">
                <p className="font-semibold text-secondary-500 mb-1">Modalites de remboursement :</p>
                <p>
                  Le remboursement est effectue sur le meme moyen de paiement utilise lors
                  de la commande (Mobile Money ou cash remis par le livreur). Les frais de
                  livraison initiaux ne sont pas rembourses, sauf si le retour est du a une
                  erreur de TOKOSSA.
                </p>
              </div>
            </div>
          </article>

          {/* Article 9 — Garanties */}
          <article id="article-9" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 9 — Garanties
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA garantit que les produits vendus sont conformes a leur description
                et exempts de defauts au moment de la livraison.
              </p>
              <p>
                En cas de produit defectueux, ne correspondant pas a la description ou
                endommage lors du transport, TOKOSSA propose au choix :
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Le remplacement par un produit identique sans frais supplementaires</li>
                <li>Un remboursement integral incluant les frais de livraison</li>
              </ul>
              <p>
                Cette garantie est valable pendant <strong className="text-secondary-500">7 jours</strong> a compter
                de la reception et ne couvre pas les dommages causes par une utilisation
                incorrecte du produit.
              </p>
            </div>
          </article>

          {/* Article 10 — Responsabilite */}
          <article id="article-10" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 10 — Limitation de responsabilite
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                TOKOSSA ne pourra etre tenu responsable des dommages indirects resultant
                de l&apos;utilisation ou de l&apos;impossibilite d&apos;utilisation des produits commandes.
              </p>
              <p>
                TOKOSSA n&apos;est pas responsable des retards de livraison dus a des circonstances
                exterieures a son controle : greves, intemperies, evenements de force majeure,
                coupures d&apos;electricite ou de reseau.
              </p>
              <p>
                La responsabilite de TOKOSSA ne peut en aucun cas exceder le montant de la
                commande concernee.
              </p>
            </div>
          </article>

          {/* Article 11 — Protection des donnees */}
          <article id="article-11" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 11 — Protection des donnees personnelles
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                Les donnees personnelles collectees lors d&apos;une commande (nom, numero de
                telephone, adresse de livraison) sont utilisees exclusivement pour le
                traitement et le suivi de la commande.
              </p>
              <p>
                Pour plus d&apos;informations sur la gestion de vos donnees personnelles, veuillez
                consulter notre{' '}
                <Link
                  href="/politique-confidentialite"
                  className="text-primary-600 hover:text-primary-700 font-medium underline underline-offset-2"
                >
                  Politique de Confidentialite
                </Link>
                .
              </p>
            </div>
          </article>

          {/* Article 12 — Litiges */}
          <article id="article-12" className="bg-white rounded-2xl p-6 border border-warm-100 shadow-sm">
            <h2 className="text-xl font-bold text-secondary-500 mb-4 pb-3 border-b border-warm-100">
              Article 12 — Litiges et droit applicable
            </h2>
            <div className="text-sm text-warm-600 leading-relaxed space-y-3">
              <p>
                En cas de litige, le client est invite a contacter TOKOSSA en premier lieu
                via WhatsApp afin de trouver une solution amiable.
              </p>
              <p>
                Les presentes CGV sont soumises au droit beninois. En cas de litige persistant
                ne pouvant etre resolu a l&apos;amiable, les tribunaux competents de Cotonou seront
                seuls competents pour connaitre du litige.
              </p>
              <p>
                La langue applicable aux presentes CGV est le <strong className="text-secondary-500">francais</strong>.
              </p>
            </div>
          </article>

          {/* Bloc de contact */}
          <div className="bg-gradient-to-br from-primary-50 to-warm-100 rounded-2xl p-6 border border-primary-100 text-center">
            <h3 className="font-bold text-secondary-500 mb-2">
              Une question sur nos conditions ?
            </h3>
            <p className="text-sm text-warm-600 mb-4">
              Notre equipe est disponible 7j/7 sur WhatsApp pour repondre a toutes vos questions.
            </p>
            <a
              href="https://wa.me/22990000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              Contacter TOKOSSA sur WhatsApp
            </a>
          </div>

          {/* Liens legaux annexes */}
          <div className="flex flex-wrap gap-3 justify-center text-sm">
            <Link
              href="/politique-confidentialite"
              className="text-primary-600 hover:text-primary-700 hover:underline"
            >
              Politique de confidentialite
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
