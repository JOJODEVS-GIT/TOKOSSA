import { MetadataRoute } from 'next'
import prisma from '@/lib/db'

/**
 * Sitemap dynamique pour le SEO.
 * Genere automatiquement les URLs des pages statiques, categories et produits actifs.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://tokossa.bj'

  // Recuperer tous les produits actifs (fallback vide si DB indisponible au build)
  let products: { slug: string; updatedAt: Date }[] = []
  try {
    products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
    })
  } catch {
    // DB indisponible au build — le sitemap sera regenere a la prochaine requete
  }

  // Pages statiques
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/produits`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/cgu`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/politique-confidentialite`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]

  // Categories (depuis la DB, avec fallback)
  let categorySlugs: string[] = []
  try {
    const cats = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    })
    categorySlugs = cats.map((c) => c.slug)
  } catch {
    categorySlugs = ['electronique', 'mode', 'beaute', 'sport', 'maison', 'enfants']
  }
  const categoryPages: MetadataRoute.Sitemap = categorySlugs.map((cat) => ({
    url: `${baseUrl}/produits?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Pages produits
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/produits/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...categoryPages, ...productPages]
}
