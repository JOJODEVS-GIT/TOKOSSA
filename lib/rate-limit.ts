/**
 * Rate Limiter avec double stratégie :
 * - Upstash Redis (sliding window distribué) si UPSTASH_REDIS_REST_URL et
 *   UPSTASH_REDIS_REST_TOKEN sont définis dans les variables d'environnement.
 * - Fallback in-memory (Map locale) si Upstash n'est pas configuré.
 *
 * Le fallback in-memory est adapté pour le développement ou un déploiement
 * mono-instance. Pour la production Vercel (multi-instance serverless), la
 * configuration Upstash est fortement recommandée.
 *
 * La fonction checkRateLimit est async pour supporter les deux backends.
 * Toutes les routes qui l'appellent doivent utiliser `await`.
 */

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// ============================================
// Initialisation Upstash Redis (optionnel)
// ============================================

/** Instance Redis réutilisable — null si non configuré */
let upstashRedis: Redis | null = null

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  upstashRedis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
}

// ============================================
// Fallback : implémentation in-memory
// ============================================

interface RateLimitEntry {
  timestamps: number[]
}

/** Map globale partagée entre les requêtes (dans le même process) */
const rateLimitStore = new Map<string, RateLimitEntry>()

/** Nettoyage périodique pour éviter les fuites mémoire */
const CLEANUP_INTERVAL = 60 * 1000 // 1 minute
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return

  lastCleanup = now
  const cutoff = now - windowMs

  const keys = Array.from(rateLimitStore.keys())
  for (const key of keys) {
    const entry = rateLimitStore.get(key)
    if (!entry) continue
    entry.timestamps = entry.timestamps.filter((t: number) => t > cutoff)
    if (entry.timestamps.length === 0) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Vérifie le rate limit en mémoire (fallback sans Redis).
 * Retourne true si la requête est autorisée, false sinon.
 */
function checkRateLimitInMemory(
  identifier: string,
  routeKey: string,
  options: RateLimitOptions
): boolean {
  const { max, windowMs } = options
  const key = `${routeKey}:${identifier}`
  const now = Date.now()

  // Nettoyage périodique
  cleanup(windowMs)

  const entry = rateLimitStore.get(key)

  if (!entry) {
    rateLimitStore.set(key, { timestamps: [now] })
    return true
  }

  // Filtrer les timestamps dans la fenêtre
  entry.timestamps = entry.timestamps.filter((t) => t > now - windowMs)

  if (entry.timestamps.length >= max) {
    return false // Rate limited
  }

  entry.timestamps.push(now)
  return true
}

// ============================================
// Interface publique
// ============================================

/**
 * Options du rate limiter
 */
export interface RateLimitOptions {
  /** Nombre max de requêtes dans la fenêtre */
  max: number
  /** Taille de la fenêtre en millisecondes */
  windowMs: number
}

/**
 * Vérifie si une requête est autorisée par le rate limiter.
 *
 * Utilise Upstash Redis si configuré (recommandé en production multi-instance),
 * sinon bascule sur l'implémentation in-memory.
 *
 * Note : Les limites Upstash utilisent une fenêtre glissante de 60 s.
 * Le paramètre `options.max` est respecté dans les deux cas.
 * Le paramètre `options.windowMs` est utilisé uniquement par le fallback in-memory
 * (Upstash utilise une fenêtre fixe de 60 s configurée à l'initialisation).
 *
 * @param identifier - Identifiant unique (IP, téléphone, etc.)
 * @param routeKey   - Clé de la route (pour séparer les limites par route)
 * @param options    - Options de rate limiting
 * @returns Promise<true> si la requête est autorisée, Promise<false> si rate-limited
 */
export async function checkRateLimit(
  identifier: string,
  routeKey: string,
  options: RateLimitOptions
): Promise<boolean> {
  // Chemin Upstash — distribué, résistant au multi-instance Vercel
  if (upstashRedis) {
    try {
      // Créer un limiteur dédié par (routeKey, max) pour respecter les
      // présets différents selon la route (webhook vs login vs commandes).
      const dynamicLimiter = new Ratelimit({
        redis: upstashRedis,
        limiter: Ratelimit.slidingWindow(options.max, '60 s'),
        analytics: true,
        prefix: `tokossa:${routeKey}`,
      })
      const { success } = await dynamicLimiter.limit(identifier)
      return success
    } catch (err) {
      // Si Upstash est indisponible, bascule en mode dégradé sur l'in-memory.
      console.error('Upstash rate limit error, fallback in-memory:', err)
      return checkRateLimitInMemory(identifier, routeKey, options)
    }
  }

  // Chemin fallback in-memory
  return checkRateLimitInMemory(identifier, routeKey, options)
}

/**
 * Extrait l'IP d'une requête Next.js
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  return 'unknown'
}

// ============================================
// Présets de rate limiting par type de route
// ============================================

/** Rate limit pour les reviews : 3 requêtes par minute */
export const RATE_LIMIT_REVIEWS: RateLimitOptions = {
  max: 3,
  windowMs: 60 * 1000,
}

/** Rate limit pour la validation de promos : 10 requêtes par minute */
export const RATE_LIMIT_PROMOS: RateLimitOptions = {
  max: 10,
  windowMs: 60 * 1000,
}

/** Rate limit pour la fidélité : 5 requêtes par minute */
export const RATE_LIMIT_LOYALTY: RateLimitOptions = {
  max: 5,
  windowMs: 60 * 1000,
}

/** Rate limit pour le login : 5 tentatives par minute */
export const RATE_LIMIT_LOGIN: RateLimitOptions = {
  max: 5,
  windowMs: 60 * 1000,
}

/** Rate limit pour les commandes : 5 par minute */
export const RATE_LIMIT_ORDERS: RateLimitOptions = {
  max: 5,
  windowMs: 60 * 1000,
}

/** Rate limit pour le webhook : 30 par minute */
export const RATE_LIMIT_WEBHOOK: RateLimitOptions = {
  max: 30,
  windowMs: 60 * 1000,
}
