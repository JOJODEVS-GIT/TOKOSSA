import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Routes API sensibles qui nécessitent une validation CSRF (Origin check).
 * Protège contre les attaques cross-site sur les mutations critiques.
 */
const CSRF_PROTECTED_ROUTES = [
  '/api/commandes',
  '/api/paiement/initier',
  '/api/paiement/confirmer',
  '/api/paiement/split-second',
  '/api/promos/validate',
  '/api/loyalty/redeem',
  '/api/retours',
  '/api/reviews',
  '/api/admin',
  '/api/upload',
  '/api/produits',
]

/**
 * Vérifie l'Origin de la requête pour les routes sensibles.
 * Les requêtes JSON sont déjà protégées par la politique CORS, mais
 * cette vérification ajoute une couche de défense supplémentaire.
 */
function validateOrigin(req: NextRequest): boolean {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const origin = req.headers.get('origin')

  // En développement uniquement (pas staging), on accepte sans Origin
  if (process.env.NODE_ENV === 'development') return true

  // Si pas d'Origin en production — on refuse (les navigateurs envoient toujours Origin)
  if (!origin) return false

  try {
    const originUrl = new URL(origin)
    const appUrlObj = new URL(appUrl)
    return originUrl.hostname === appUrlObj.hostname
  } catch {
    return false
  }
}

/**
 * Middleware de protection des routes admin + CSRF.
 *
 * - /dashboard/* : accessible uniquement aux utilisateurs avec role "admin"
 * - /login : redirige vers /dashboard si deja connecte en admin
 * - Routes API sensibles : validation de l'Origin
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname
    const isAdminRoute = pathname.startsWith('/dashboard')
    const isLoginPage = pathname === '/login'

    // Proteger les routes admin
    if (isAdminRoute && token?.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', req.url))
    }

    // Rediriger vers le dashboard si deja authentifie en admin
    if (isLoginPage && token?.role === 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // CSRF : valider l'Origin sur les routes de mutation sensibles
    const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
    const isCsrfRoute = CSRF_PROTECTED_ROUTES.some(route => pathname.startsWith(route))

    if (isMutation && isCsrfRoute && !validateOrigin(req)) {
      return NextResponse.json(
        { error: 'Requête refusée : origine invalide' },
        { status: 403 }
      )
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token
        }
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/commandes', '/api/paiement/:path*', '/api/paiement/confirmer', '/api/paiement/split-second', '/api/promos/:path*', '/api/loyalty/:path*', '/api/retours', '/api/reviews', '/api/admin/:path*', '/api/upload', '/api/produits/:path*'],
}
