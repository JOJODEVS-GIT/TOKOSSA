/**
 * Helpers Cloudinary pour l'optimisation automatique des images.
 * Applique f_auto (format WebP/AVIF selon le navigateur) et q_auto
 * sur toutes les URLs d'images produits.
 */

interface CloudinaryOptions {
  width?: number
  height?: number
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  crop?: 'fill' | 'fit' | 'scale' | 'thumb' | 'crop'
  gravity?: 'auto' | 'face' | 'center'
}

/**
 * Transforme une URL Cloudinary pour ajouter les optimisations automatiques.
 * - f_auto : sert WebP ou AVIF selon ce que le navigateur supporte
 * - q_auto : qualité automatique (meilleur ratio poids/qualité)
 *
 * @example
 * cloudinaryOptimize('https://res.cloudinary.com/tokossa/image/upload/v1/products/img.jpg', { width: 800 })
 * // → 'https://res.cloudinary.com/tokossa/image/upload/f_auto,q_auto,w_800/v1/products/img.jpg'
 */
export function cloudinaryOptimize(url: string, options: CloudinaryOptions = {}): string {
  if (!url || !url.includes('res.cloudinary.com')) return url

  const { width, height, quality = 'auto', crop = 'fill', gravity = 'auto' } = options

  const transforms: string[] = ['f_auto', `q_${quality}`]

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (width || height) {
    transforms.push(`c_${crop}`)
    if (crop === 'fill') transforms.push(`g_${gravity}`)
  }

  const transformation = transforms.join(',')

  // Insérer la transformation après /upload/
  return url.replace('/upload/', `/upload/${transformation}/`)
}

/**
 * Génère un placeholder blur base64 minimaliste pour les images en chargement.
 * Utilisé avec next/image placeholder="blur" blurDataURL={...}
 */
export const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'

/**
 * Présets d'optimisation par contexte d'utilisation.
 */
export const cloudinaryPresets = {
  /** Carte produit dans la grille — 400px max */
  card: (url: string) => cloudinaryOptimize(url, { width: 400, crop: 'fill', gravity: 'auto' }),

  /** Image principale page produit — 800px max */
  detail: (url: string) => cloudinaryOptimize(url, { width: 800, crop: 'fill', gravity: 'auto' }),

  /** Miniature galerie produit */
  thumb: (url: string) => cloudinaryOptimize(url, { width: 100, height: 100, crop: 'thumb', gravity: 'auto' }),

  /** Image plein écran */
  fullscreen: (url: string) => cloudinaryOptimize(url, { width: 1200, crop: 'fit' }),

  /** Panier / drawer */
  cart: (url: string) => cloudinaryOptimize(url, { width: 80, height: 80, crop: 'thumb', gravity: 'auto' }),
}
