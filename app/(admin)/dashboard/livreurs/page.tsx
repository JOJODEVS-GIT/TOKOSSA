export const dynamic = 'force-dynamic'

import prisma from '@/lib/db'
import LivreursManager from '@/components/admin/LivreursManager'

/**
 * Page admin de gestion des livreurs TOKOSSA.
 * Server Component qui recupere la liste des livreurs
 * et la passe au composant Client LivreursManager
 * pour les interactions (ajout, toggle, suppression).
 */
export default async function LivreursPage() {
  // Recuperer tous les livreurs tries par nom
  const livreurs = await prisma.deliveryPerson.findMany({
    orderBy: { name: 'asc' },
  })

  // Serialiser les dates pour le composant Client
  const serialized = livreurs.map((l) => ({
    ...l,
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }))

  return <LivreursManager initialLivreurs={serialized} />
}
