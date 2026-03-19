/**
 * Tests unitaires pour le Facebook Pixel (lib/fbpixel.ts)
 * Couvre : viewContent, addToCart, initiateCheckout, purchase, search
 */

import { viewContent, addToCart, initiateCheckout, purchase, search, pageview } from '@/lib/fbpixel'

// Mock de window.fbq
const mockFbq = jest.fn()

beforeEach(() => {
  jest.clearAllMocks()
  // Simuler fbq sur window
  Object.defineProperty(window, 'fbq', {
    value: mockFbq,
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  // Nettoyer fbq
  Object.defineProperty(window, 'fbq', {
    value: undefined,
    writable: true,
    configurable: true,
  })
})

// ============================================================
// pageview
// ============================================================
describe('pageview', () => {
  it('appelle fbq avec track PageView', () => {
    pageview()
    expect(mockFbq).toHaveBeenCalledWith('track', 'PageView')
  })
})

// ============================================================
// viewContent — Voir un produit
// ============================================================
describe('viewContent', () => {
  it('envoie les donnees produit correctes', () => {
    viewContent({
      id: 'prod-1',
      name: 'T-shirt TOKOSSA',
      price: 5000,
      category: 'Vetements',
    })

    expect(mockFbq).toHaveBeenCalledWith('track', 'ViewContent', {
      content_ids: ['prod-1'],
      content_name: 'T-shirt TOKOSSA',
      content_type: 'product',
      content_category: 'Vetements',
      value: 5000,
      currency: 'XOF',
    })
  })
})

// ============================================================
// addToCart — Ajouter au panier
// ============================================================
describe('addToCart', () => {
  it('calcule la valeur correcte (price x quantity)', () => {
    addToCart({
      id: 'prod-2',
      name: 'Chaussures Nike',
      price: 25000,
      quantity: 2,
    })

    expect(mockFbq).toHaveBeenCalledWith('track', 'AddToCart', {
      content_ids: ['prod-2'],
      content_name: 'Chaussures Nike',
      content_type: 'product',
      value: 50000, // 25000 * 2
      currency: 'XOF',
    })
  })

  it('gere quantity = 1', () => {
    addToCart({ id: 'prod-3', name: 'Sac', price: 15000, quantity: 1 })

    expect(mockFbq).toHaveBeenCalledWith('track', 'AddToCart',
      expect.objectContaining({ value: 15000 })
    )
  })
})

// ============================================================
// initiateCheckout
// ============================================================
describe('initiateCheckout', () => {
  it('envoie les IDs et le total correct', () => {
    const items = [
      { id: 'p1', price: 5000, quantity: 2 },
      { id: 'p2', price: 10000, quantity: 1 },
    ]

    initiateCheckout(items, 20000)

    expect(mockFbq).toHaveBeenCalledWith('track', 'InitiateCheckout', {
      content_ids: ['p1', 'p2'],
      content_type: 'product',
      num_items: 3, // 2 + 1
      value: 20000,
      currency: 'XOF',
    })
  })
})

// ============================================================
// purchase — Achat reussi
// ============================================================
describe('purchase', () => {
  it('envoie le numero de commande et le total', () => {
    const items = [
      { id: 'p1', price: 5000, quantity: 1 },
    ]

    purchase('CMD-2024-001', 5500, items)

    expect(mockFbq).toHaveBeenCalledWith('track', 'Purchase', {
      content_ids: ['p1'],
      content_type: 'product',
      num_items: 1,
      value: 5500,
      currency: 'XOF',
      order_id: 'CMD-2024-001',
    })
  })
})

// ============================================================
// search — Recherche
// ============================================================
describe('search', () => {
  it('envoie la requete de recherche', () => {
    search('t-shirt blanc')
    expect(mockFbq).toHaveBeenCalledWith('track', 'Search', {
      search_string: 't-shirt blanc',
    })
  })
})

// ============================================================
// Cas sans fbq
// ============================================================
describe('sans fbq (pixel non charge)', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'fbq', {
      value: undefined,
      writable: true,
      configurable: true,
    })
  })

  it('ne throw pas si fbq est undefined', () => {
    expect(() => pageview()).not.toThrow()
    expect(() => viewContent({ id: '1', name: 'Test', price: 100, category: 'Cat' })).not.toThrow()
    expect(() => addToCart({ id: '1', name: 'Test', price: 100, quantity: 1 })).not.toThrow()
    expect(() => search('test')).not.toThrow()
  })
})
