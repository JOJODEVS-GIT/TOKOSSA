export const dynamic = 'force-dynamic'

import prisma from '@/lib/db'
import AvisManager from '@/components/admin/AvisManager'

/**
 * Page admin de moderation des avis clients TOKOSSA.
 * Server Component qui recupere tous les avis (verifies et non verifies)
 * avec le nom du produit associe, puis les passe au composant Client
 * AvisManager pour la moderation interactive.
 */
export default async function AvisPage() {
  // Recuperer tous les avis avec le nom du produit associe
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      product: {
        select: { name: true },
      },
    },
  })

  // Serialiser pour le composant Client
  const serialized = reviews.map((r) => ({
    id: r.id,
    productName: r.product.name,
    phone: r.phone,
    name: r.name,
    rating: r.rating,
    comment: r.comment,
    isVerified: r.isVerified,
    createdAt: r.createdAt.toISOString(),
  }))

  return <AvisManager initialAvis={serialized} />
}
