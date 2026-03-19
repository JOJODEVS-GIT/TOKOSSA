/**
 * Tests unitaires pour les fonctions utilitaires (lib/utils.ts)
 * Couvre : formatPrice, isValidBeninPhone, getDeliveryFee
 */

import { formatPrice, isValidBeninPhone, getDeliveryFee } from '@/lib/utils'

// ============================================================
// formatPrice — Formatage des prix en FCFA
// ============================================================
describe('formatPrice', () => {
  it('formate un prix simple en FCFA avec separateur de milliers', () => {
    const result = formatPrice(5000)
    // Le separateur peut etre U+202F (espace fine insecable) ou U+00A0 selon l'env
    expect(result).toMatch(/^5[\s\u00A0\u202F]000 FCFA$/)
  })

  it('formate zero correctement', () => {
    expect(formatPrice(0)).toBe('0 FCFA')
  })

  it('formate un grand nombre avec separateurs de milliers', () => {
    const result = formatPrice(1500000)
    expect(result).toMatch(/^1[\s\u00A0\u202F]500[\s\u00A0\u202F]000 FCFA$/)
  })

  it('formate un petit prix sans separateur', () => {
    expect(formatPrice(500)).toBe('500 FCFA')
  })

  it('arrondit les decimales (pas de centimes en FCFA)', () => {
    const result = formatPrice(1999.99)
    // 1999.99 arrondi = 2000, donc avec separateur
    expect(result).toMatch(/^2[\s\u00A0\u202F]000 FCFA$/)
  })

  it('contient toujours le suffixe FCFA', () => {
    expect(formatPrice(100)).toContain('FCFA')
    expect(formatPrice(0)).toContain('FCFA')
    expect(formatPrice(999999)).toContain('FCFA')
  })

  it('formate un prix negatif (remboursement)', () => {
    const result = formatPrice(-3000)
    // Le format peut varier selon la locale, mais doit contenir FCFA et le nombre
    expect(result).toContain('FCFA')
    expect(result).toContain('3')
  })
})

// ============================================================
// isValidBeninPhone — Validation numero beninois
// Format 2024+ : +229 01 XX XX XX XX (10 chiffres apres indicatif)
// ============================================================
describe('isValidBeninPhone', () => {
  // --- Numeros valides ---
  it('valide un numero avec indicatif +229 et espaces', () => {
    expect(isValidBeninPhone('+229 01 97 00 00 00')).toBe(true)
  })

  it('valide un numero sans indicatif (commence par 01)', () => {
    expect(isValidBeninPhone('0197000000')).toBe(true)
  })

  it('valide un numero avec indicatif sans espaces', () => {
    expect(isValidBeninPhone('2290197000000')).toBe(true)
  })

  it('valide un numero avec tirets', () => {
    expect(isValidBeninPhone('01-97-00-00-00')).toBe(true)
  })

  it('valide un numero avec points', () => {
    expect(isValidBeninPhone('01.97.00.00.00')).toBe(true)
  })

  // --- Numeros invalides ---
  it('rejette un numero trop court', () => {
    expect(isValidBeninPhone('01970000')).toBe(false)
  })

  it('rejette un numero trop long sans indicatif', () => {
    expect(isValidBeninPhone('019700000000')).toBe(false)
  })

  it('rejette un numero qui ne commence pas par 01', () => {
    expect(isValidBeninPhone('0297000000')).toBe(false)
  })

  it('rejette une chaine vide', () => {
    expect(isValidBeninPhone('')).toBe(false)
  })

  it('rejette un texte non numerique', () => {
    expect(isValidBeninPhone('abcdefghij')).toBe(false)
  })

  it('rejette un numero francais', () => {
    expect(isValidBeninPhone('+33612345678')).toBe(false)
  })
})

// ============================================================
// getDeliveryFee — Frais de livraison par quartier
// ============================================================
describe('getDeliveryFee', () => {
  // Livraison gratuite : Cadjehoun, Cotonou Centre, Ganhi
  it.each([
    ['Cadjehoun', 0],
    ['Cotonou Centre', 0],
    ['Ganhi', 0],
  ] as const)('retourne 0 FCFA pour %s (livraison gratuite)', (quartier, frais) => {
    expect(getDeliveryFee(quartier)).toBe(frais)
  })

  // Quartiers proches : 500 FCFA
  it.each([
    ['Akpakpa', 500],
    ['Fidjross\u00e8', 500],
    ['Haie Vive', 500],
    ['Gb\u00e8djrom\u00e9d\u00e9', 500],
    ['Zogbo', 500],
  ] as const)('retourne 500 FCFA pour %s (quartier proche)', (quartier, frais) => {
    expect(getDeliveryFee(quartier)).toBe(frais)
  })

  // Quartiers moyens : 1000 FCFA
  it.each([
    ['Agla', 1000],
    ['Godomey', 1000],
    ['Calavi', 1000],
    ['Tokpa', 1000],
    ['Dantokpa', 1000],
    ['J\u00e9richo', 1000],
  ] as const)('retourne 1000 FCFA pour %s (quartier moyen)', (quartier, frais) => {
    expect(getDeliveryFee(quartier)).toBe(frais)
  })

  // Hors ville : 1500 FCFA
  it.each([
    ['Porto-Novo', 1500],
    ['S\u00e8m\u00e8-Kpodji', 1500],
    ['Ouidah', 1500],
    ['Pahou', 1500],
  ] as const)('retourne 1500 FCFA pour %s (hors ville)', (quartier, frais) => {
    expect(getDeliveryFee(quartier)).toBe(frais)
  })

  // Quartier inconnu : 2000 FCFA (tarif par defaut)
  it('retourne 2000 FCFA pour un quartier inconnu', () => {
    expect(getDeliveryFee('Parakou')).toBe(2000)
  })

  it('retourne 2000 FCFA pour "Autre"', () => {
    expect(getDeliveryFee('Autre')).toBe(2000)
  })

  it('retourne 2000 FCFA pour une chaine vide', () => {
    expect(getDeliveryFee('')).toBe(2000)
  })
})
