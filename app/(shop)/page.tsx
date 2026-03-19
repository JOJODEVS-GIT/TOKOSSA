// ISR : page re-generee toutes les heures (les produits ne changent pas frequemment)
export const revalidate = 3600

import nextDynamic from 'next/dynamic'
import ProductGrid from '@/components/shop/ProductGrid'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import prisma from '@/lib/db'
import { safeJsonLd } from '@/lib/utils'
import type { Metadata } from 'next'

// PERFORMANCE : Chargement différé des composants non-critiques (sous la fold)
const TestimonialCarousel = nextDynamic(() => import('@/components/shop/TestimonialCarousel'), {
  ssr: false,
  loading: () => <div className="h-48 bg-warm-100 rounded-2xl animate-pulse" />,
})
const AnimatedCounter = nextDynamic(() => import('@/components/shop/AnimatedCounter'), {
  ssr: false,
})

export const metadata: Metadata = {
  title: 'TOKOSSA - Achetez en ligne au Benin | Livraison rapide Cotonou',
  description: 'TOKOSSA, votre boutique en ligne au Benin. Livraison rapide a Cotonou et environs. Paiement Mobile Money MTN, Moov, Celtis ou a la livraison. Plus de 500 clients satisfaits.',
  keywords: ['e-commerce Benin', 'achat en ligne Cotonou', 'livraison rapide Benin', 'Mobile Money', 'MTN MoMo', 'Moov Money', 'boutique en ligne Benin', 'TOKOSSA'],
  openGraph: {
    title: 'TOKOSSA - Achetez en ligne au Benin',
    description: 'Livraison rapide a Cotonou et environs. Paiement Mobile Money ou a la livraison.',
    url: 'https://tokossa.bj',
    siteName: 'TOKOSSA',
    locale: 'fr_BJ',
    type: 'website',
  },
  alternates: {
    canonical: 'https://tokossa.bj',
  },
}

const categories = [
  { name: 'Electronique', slug: 'electronique', color: 'bg-blue-500' },
  { name: 'Mode', slug: 'mode', color: 'bg-pink-500' },
  { name: 'Beaute', slug: 'beaute', color: 'bg-purple-500' },
  { name: 'Sport', slug: 'sport', color: 'bg-green-500' },
  { name: 'Maison', slug: 'maison', color: 'bg-amber-500' },
  { name: 'Enfants', slug: 'enfants', color: 'bg-red-400' },
]

const trustBadges = [
  {
    icon: (
      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    ),
    text: 'Livraison 24h',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    text: 'MTN / Moov / Celtis',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    text: 'Retour 7 jours',
  },
  {
    icon: (
      <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    text: 'Paiement securise',
  },
]

// Schema FAQPage adapte a TOKOSSA Benin — aide Google a afficher des extraits enrichis
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Comment passer une commande sur TOKOSSA ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ajoutez vos produits au panier, renseignez votre numero de telephone et adresse a Cotonou, puis payez via MTN Mobile Money, Moov Money ou a la livraison.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels sont les delais de livraison a Cotonou ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nous livrons en 24h a Cotonou et dans les quartiers proches. La livraison est gratuite pour Cadjehoun, Cotonou Centre et Ganhi.',
      },
    },
    {
      '@type': 'Question',
      name: 'Quels moyens de paiement acceptez-vous ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nous acceptons MTN Mobile Money, Moov Money, Celtis Money et le paiement a la livraison (Cash on Delivery). Le paiement en 2 fois est aussi disponible.',
      },
    },
    {
      '@type': 'Question',
      name: 'Puis-je retourner un produit ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Oui, vous disposez de 7 jours apres reception pour retourner un produit defectueux ou non conforme. Contactez-nous via WhatsApp pour initier le retour.',
      },
    },
    {
      '@type': 'Question',
      name: 'Comment suivre ma commande ?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Vous recevez des notifications WhatsApp a chaque etape : confirmation, preparation, livraison. Vous pouvez aussi consulter votre commande avec votre numero de telephone.',
      },
    },
  ],
} as const

export default async function HomePage() {
  // Requete Prisma : produits mis en avant, actifs, les 8 plus recents
  const featuredProducts = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      oldPrice: true,
      images: true,
      stock: true,
      category: true,
      isFeatured: true,
    },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen">
      {/* JSON-LD FAQPage — donnees structurees pour les extraits enrichis Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />

      {/* Hero Section */}
      <section className="relative bg-secondary-500 text-white overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-500 to-accent-500 opacity-20 blur-3xl rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-accent-500 to-primary-400 opacity-10 blur-3xl rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              Achetez en ligne
              <span className="block text-gradient">au Benin</span>
            </h1>
            <p className="text-lg md:text-xl text-warm-200 mb-8 leading-relaxed">
              Livraison rapide a Cotonou et environs. Paiement Mobile Money ou a la livraison.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/produits">
                <Button variant="ghost" size="lg" className="bg-primary-500 text-white hover:bg-primary-600 shadow-xl shadow-primary-500/30 focus:ring-primary-500">
                  Voir les produits
                </Button>
              </Link>
              <Link href="/produits?sort=promo">
                <Button variant="ghost" size="lg" className="bg-transparent border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 focus:ring-white/30">
                  Promotions
                </Button>
              </Link>
            </div>

            {/* Inline trust indicators */}
            <div className="flex flex-wrap gap-4 mt-8 text-sm text-warm-300">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                500+ clients
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Livraison 24h
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Mobile Money
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="py-4 bg-white border-b border-warm-100">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto no-scrollbar md:justify-center md:gap-6">
            {trustBadges.map((badge, i) => (
              <div key={i} className="trust-badge flex-shrink-0">
                {badge.icon}
                <span className="whitespace-nowrap">{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <h2 className="section-heading mb-6">Parcourir par categorie</h2>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 md:flex-wrap md:overflow-visible">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/produits?category=${category.slug}`}
                className="flex items-center gap-2.5 px-5 py-3 bg-white rounded-full border border-warm-200 hover:border-primary-400 hover:bg-primary-50 whitespace-nowrap transition-all duration-200 shadow-sm flex-shrink-0"
              >
                <span className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className="text-sm font-medium text-warm-700">{category.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <p className="text-warm-500 text-sm mb-1">Les articles les plus demandes a Cotonou et environs</p>
          <ProductGrid
            products={featuredProducts}
            title="Nos Meilleures Ventes"
          />
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 bg-gradient-to-br from-warm-50 to-primary-50 relative overflow-hidden">
        <div className="absolute top-4 left-8 text-[120px] leading-none text-warm-100 font-serif select-none pointer-events-none">&ldquo;</div>

        <div className="relative container mx-auto px-4 text-center">
          {/* Compteurs animes — clients et avis */}
          <div className="flex justify-center gap-8 md:gap-16 mb-4">
            <div className="flex flex-col items-center">
              <AnimatedCounter value={500} suffix="+" />
              <span className="text-sm font-medium text-warm-600 mt-1">Clients satisfaits</span>
            </div>
            <div className="flex flex-col items-center">
              <AnimatedCounter value={200} suffix="+" />
              <span className="text-sm font-medium text-warm-600 mt-1">Avis positifs</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-secondary-500 mb-2">
            La communaute TOKOSSA a Cotonou
          </h2>
          <p className="text-warm-500 mb-6">Rejoignez nos clients satisfaits</p>

          {/* Stars */}
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg key={i} className="w-6 h-6 text-accent-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <p className="text-sm text-warm-400">Note moyenne : 4.9/5</p>

          {/* Testimonials Carousel */}
          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA WhatsApp */}
      <section className="relative py-14 bg-gradient-to-r from-green-600 to-green-500 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        <div className="relative container mx-auto px-4">
          <div className="flex flex-col items-center gap-6 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-2">
                Besoin d&apos;aide ?
              </h2>
              <p className="text-green-100 mb-5">
                Notre equipe vous repond en moins de 5 minutes sur WhatsApp
              </p>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '22990000000'}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="lg" className="bg-white text-green-700 hover:bg-green-50 shadow-xl focus:ring-green-300">
                  Contacter le support
                </Button>
              </a>
              <p className="text-green-200 text-sm mt-3">Disponible 7j/7 de 8h a 22h</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
