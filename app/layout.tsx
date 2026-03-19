import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import PWARegister from '@/components/PWARegister'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { sanitizePixelId } from '@/lib/sanitize'

// PERFORMANCE : Charger uniquement les weights utilisés + affichage swap
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  preload: true,
})

export const metadata: Metadata = {
  title: {
    default: 'TOKOSSA - E-commerce Bénin',
    template: '%s | TOKOSSA',
  },
  description:
    'Achetez en ligne au Bénin. Livraison rapide à Cotonou. Paiement Mobile Money (MTN, Moov, Wave) ou à la livraison.',
  keywords: [
    'e-commerce',
    'Bénin',
    'Cotonou',
    'achat en ligne',
    'livraison',
    'Mobile Money',
    'MTN',
    'Moov',
  ],
  authors: [{ name: 'TOKOSSA' }],
  creator: 'TOKOSSA',
  /** Lien vers le manifest PWA */
  manifest: '/manifest.json',
  /** Meta tags pour Apple (iOS) */
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TOKOSSA',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_BJ',
    url: 'https://tokossa.bj',
    siteName: 'TOKOSSA',
    title: 'TOKOSSA - E-commerce Bénin',
    description:
      'Achetez en ligne au Bénin. Livraison rapide à Cotonou.',
    images: [{ url: '/og-image.svg', width: 1200, height: 630, alt: 'TOKOSSA - Boutique en ligne Bénin' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TOKOSSA - E-commerce Bénin',
    description: 'Achetez en ligne au Bénin. Livraison rapide à Cotonou.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ed7420',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* PWA — Icone Apple Touch pour iOS */}
        <link rel="apple-touch-icon" sizes="192x192" href="/images/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/images/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/images/icons/icon-144x144.png" />

        {/* PWA — Splash screen iOS (couleur de fond) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="TOKOSSA" />

        {/* PWA — Compatibilite Microsoft */}
        <meta name="msapplication-TileColor" content="#ed7420" />
        <meta name="msapplication-TileImage" content="/images/icons/icon-144x144.png" />

        {/* PERFORMANCE : Preconnect aux domaines critiques */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://widget.kkiapay.me" />
        <link rel="dns-prefetch" href="https://api.kkiapay.me" />
        <link rel="dns-prefetch" href="https://connect.facebook.net" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {/* JSON-LD — Donnees structurees Organization pour le SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'TOKOSSA',
              url: 'https://tokossa.bj',
              logo: 'https://tokossa.bj/images/icons/icon-512x512.png',
              description:
                'Plateforme e-commerce au Benin. Livraison rapide a Cotonou. Paiement Mobile Money et a la livraison.',
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS || '+22901000000',
                contactType: 'customer service',
                areaServed: 'BJ',
                availableLanguage: 'French',
              },
              sameAs: [],
            }),
          }}
        />

        {children}

        {/* PWA — Enregistrement du Service Worker */}
        <PWARegister />

        {/* Vercel Analytics — Tracking automatique des pages vues */}
        <Analytics />

        {/* Vercel Speed Insights — Mesure des performances (Core Web Vitals) */}
        <SpeedInsights />

        {/* PERFORMANCE : Facebook Pixel chargé en lazy (non-bloquant, après LCP) */}
        {process.env.NEXT_PUBLIC_FB_PIXEL_ID && (
          <Script
            id="fb-pixel"
            strategy="lazyOnload"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${sanitizePixelId(process.env.NEXT_PUBLIC_FB_PIXEL_ID)}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
      </body>
    </html>
  )
}
