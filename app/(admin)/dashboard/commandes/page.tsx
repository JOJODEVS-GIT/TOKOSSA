export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import prisma from '@/lib/db'
import CommandesManager from '@/components/admin/CommandesManager'
import { requireAdmin } from '@/lib/admin-auth'

/**
 * Page de gestion des commandes admin TOKOSSA.
 * Server Component qui recupere les livreurs et passe au Client Component.
 * Le Client Component gere : recherche, filtres, pagination, modal detail,
 * assignation livreur, actions groupees, suppression.
 */

export default async function CommandesPage() {
  const session = await requireAdmin()
  if (!session) redirect('/login')

  // Recuperer les livreurs pour l'assignation
  const livreurs = await prisma.deliveryPerson.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      phone: true,
      zone: true,
      isActive: true,
    },
  })

  return <CommandesManager initialDeliveryPersons={livreurs} />
}
