/** @type {import('next').NextConfig} */
const nextConfig = {
  // PERFORMANCE : Compression Gzip/Brotli pour le serveur Node.js
  // (Vercel active Brotli automatiquement, ce flag couvre les self-hosted)
  compress: true,

  // PERFORMANCE : Images optimisées
  images: {
    // Servir AVIF puis WebP selon support navigateur (meilleur ratio poids/qualité)
    formats: ['image/avif', 'image/webp'],
    // Breakpoints mobile-first (Bénin = majorité mobile)
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
    // Cache images optimisées 1 an côté Next.js
    minimumCacheTTL: 31536000,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },

  // SECURITE : Forcer HTTPS en production
  async redirects() {
    if (process.env.NODE_ENV !== 'production') return []
    return [
      {
        source: '/(.*)',
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
        destination: 'https://tokossa.bj/:path*',
        permanent: true,
      },
    ]
  },

  // SECURITE : Headers HTTP de securite
  async headers() {
    // Content Security Policy
    // unsafe-inline requis pour : Next.js hydration, Facebook Pixel inline, KKiaPay widget
    // unsafe-eval requis pour : Next.js App Router (dev + prod)
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://widget.kkiapay.me https://connect.facebook.net https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://images.pexels.com https://picsum.photos https://fastly.picsum.photos https://www.facebook.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.kkiapay.me https://graph.facebook.com https://api.cloudinary.com https://api.resend.com wss://*.kkiapay.me",
      "frame-src https://widget.kkiapay.me https://www.facebook.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; ')

    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

module.exports = nextConfig
