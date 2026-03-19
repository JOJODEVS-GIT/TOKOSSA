import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Type etendu pour la session admin
interface AdminSession {
  user: {
    id: string
    email: string
    name: string
    role: string
  }
}

/**
 * Verifie que l'utilisateur courant est un admin.
 * A utiliser dans les Server Components et les API Routes admin.
 *
 * @returns La session admin si authentifie, null sinon
 *
 * @example
 * ```ts
 * const session = await requireAdmin()
 * if (!session) {
 *   redirect('/login')
 * }
 * ```
 */
export async function requireAdmin(): Promise<AdminSession | null> {
  const session = await getServerSession(authOptions)

  if (!session) {
    return null
  }

  const user = session.user as { role?: string } | undefined

  if (!user || user.role !== 'admin') {
    return null
  }

  return session as unknown as AdminSession
}
