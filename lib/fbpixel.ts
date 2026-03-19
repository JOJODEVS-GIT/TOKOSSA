// Utilitaire Facebook Pixel pour TOKOSSA
// Verifie que fbq existe avant d'appeler (pas d'erreur si pixel pas configure)

export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID

// Helper pour verifier si le pixel est charge
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq(...args)
  }
}

// Page view - deja gere par le script dans layout.tsx
export function pageview() {
  fbq('track', 'PageView')
}

// Voir un produit
export function viewContent(product: { id: string; name: string; price: number; category: string }) {
  fbq('track', 'ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: 'XOF',
  })
}

// Ajouter au panier
export function addToCart(product: { id: string; name: string; price: number; quantity: number }) {
  fbq('track', 'AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * product.quantity,
    currency: 'XOF',
  })
}

// Debut de checkout
export function initiateCheckout(items: { id: string; price: number; quantity: number }[], total: number) {
  fbq('track', 'InitiateCheckout', {
    content_ids: items.map(i => i.id),
    content_type: 'product',
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'XOF',
  })
}

// Achat reussi
export function purchase(orderNumber: string, total: number, items: { id: string; price: number; quantity: number }[]) {
  fbq('track', 'Purchase', {
    content_ids: items.map(i => i.id),
    content_type: 'product',
    num_items: items.reduce((sum, i) => sum + i.quantity, 0),
    value: total,
    currency: 'XOF',
    order_id: orderNumber,
  })
}

// Recherche
export function search(query: string) {
  fbq('track', 'Search', { search_string: query })
}
