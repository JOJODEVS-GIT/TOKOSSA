/**
 * Utilitaires de sanitization centralisés.
 * À utiliser dans toutes les API routes pour nettoyer les entrées utilisateur.
 */

/**
 * Nettoie et tronque un champ texte.
 * Supprime les espaces en début/fin et limite la longueur.
 */
export function sanitizeText(value: unknown, maxLength = 200): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, maxLength)
}

/**
 * Sanitize un email — retourne null si format invalide.
 */
export function sanitizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim().toLowerCase().slice(0, 254)
  // Validation basique format email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) return null
  return trimmed
}

/**
 * Sanitize un numéro de téléphone — conserve uniquement chiffres et +.
 */
export function sanitizePhone(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[^\d+]/g, '').slice(0, 20)
}

/**
 * Sanitize un entier positif.
 * Retourne null si la valeur n'est pas un entier positif valide.
 */
export function sanitizePositiveInt(value: unknown, max = 1_000_000): number | null {
  const n = Number(value)
  if (!Number.isInteger(n) || n < 0 || n > max) return null
  return n
}

/**
 * Sanitize un ID alphanumérique (CUID, UUID, etc.).
 * Bloque toute tentative d'injection via les IDs.
 */
export function sanitizeId(value: unknown): string {
  if (typeof value !== 'string') return ''
  // CUID et UUID n'ont que des lettres, chiffres et tirets
  return value.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 50)
}

/**
 * Sanitize un Pixel ID Facebook — doit être uniquement numérique.
 * Protège contre l'injection dans les scripts inline.
 */
export function sanitizePixelId(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\D/g, '').slice(0, 20)
}

/**
 * Sanitize un slug URL — lettres, chiffres et tirets uniquement.
 */
export function sanitizeSlug(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 100)
}
