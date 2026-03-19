import { MetadataRoute } from 'next'

/**
 * Configuration robots.txt pour le SEO.
 * Autorise l'indexation des pages publiques et bloque les routes privees.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tokossa.bj'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
