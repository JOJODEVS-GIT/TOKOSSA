import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format prix en FCFA
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price) + ' FCFA'
}

// Générer numéro de commande
export function generateOrderNumber(): string {
  const date = new Date()
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TOK-${dateStr}-${random}`
}

// Générer slug depuis un nom
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Echappe un objet JSON pour insertion dans une balise <script type="application/ld+json">.
 * Protege contre XSS via </script> dans les donnees (ex: description produit).
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/\//g, '\\u002f')
}

// Calculer pourcentage de réduction
export function calculateDiscount(price: number, oldPrice: number): number {
  if (!oldPrice || oldPrice <= price) return 0
  return Math.round(((oldPrice - price) / oldPrice) * 100)
}

// Quartiers de Cotonou et environs pour livraison
export const QUARTIERS_COTONOU = [
  'Cadjehoun',
  'Akpakpa',
  'Fidjrossè',
  'Haie Vive',
  'Gbèdjromédé',
  'Zogbo',
  'Agla',
  'Godomey',
  'Calavi',
  'Cotonou Centre',
  'Ganhi',
  'Tokpa',
  'Dantokpa',
  'Jéricho',
  'Porto-Novo',
  'Sèmè-Kpodji',
  'Ouidah',
  'Pahou',
  'Autre',
] as const

// Frais de livraison par quartier
export function getDeliveryFee(quarter: string): number {
  const freeLivraison = ['Cadjehoun', 'Cotonou Centre', 'Ganhi']
  const quartierProche = ['Akpakpa', 'Fidjrossè', 'Haie Vive', 'Gbèdjromédé', 'Zogbo']
  const quartierMoyen = ['Agla', 'Godomey', 'Calavi', 'Tokpa', 'Dantokpa', 'Jéricho']
  const horsVille = ['Porto-Novo', 'Sèmè-Kpodji', 'Ouidah', 'Pahou']

  if (freeLivraison.includes(quarter)) return 0
  if (quartierProche.includes(quarter)) return 500
  if (quartierMoyen.includes(quarter)) return 1000
  if (horsVille.includes(quarter)) return 1500
  return 2000 // Autre
}

// Valider numéro de téléphone béninois
// Format Bénin 2024+ : +229 01 XX XX XX XX (10 chiffres après indicatif)
export function isValidBeninPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '')
  return /^(229)?01\d{8}$/.test(cleaned)
}

// Formater numéro de téléphone béninois
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const digits = cleaned.startsWith('229') ? cleaned.slice(3) : cleaned
  return `+229 ${digits.slice(0, 2)} ${digits.slice(2, 4)} ${digits.slice(4, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`
}

// Génerer lien WhatsApp pré-rempli
export function generateWhatsAppLink(phone: string, message: string): string {
  const formattedPhone = phone.replace(/\D/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`
}
