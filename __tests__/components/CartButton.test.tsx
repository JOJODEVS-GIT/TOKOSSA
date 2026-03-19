/**
 * Tests pour le composant CartButton et le store Zustand du panier.
 * Verifie :
 * - L'affichage du badge avec le nombre d'articles
 * - Les actions du store : addItem, removeItem, clearCart
 */

import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CartButton from '@/components/shop/CartButton'
import { useCartStore, type CartItem } from '@/lib/store'

// Donnees de test
const produitTest: Omit<CartItem, 'quantity'> = {
  id: 'prod-1',
  name: 'T-shirt Ankara',
  slug: 't-shirt-ankara',
  price: 5000,
  oldPrice: 7500,
  image: '/images/tshirt.jpg',
  stock: 10,
}

const produitTest2: Omit<CartItem, 'quantity'> = {
  id: 'prod-2',
  name: 'Sac en cuir',
  slug: 'sac-en-cuir',
  price: 15000,
  image: '/images/sac.jpg',
  stock: 5,
}

// Reinitialiser le store avant chaque test pour l'isolation
beforeEach(() => {
  act(() => {
    useCartStore.getState().clearCart()
    useCartStore.getState().closeCart()
  })
})

// ============================================================
// Tests du composant CartButton
// ============================================================
describe('CartButton - Composant', () => {
  it('affiche le bouton panier avec aria-label', () => {
    render(<CartButton />)
    const button = screen.getByRole('button', { name: /panier/i })
    expect(button).toBeInTheDocument()
  })

  it('n\'affiche pas le badge quand le panier est vide', () => {
    render(<CartButton />)
    const badge = screen.queryByTestId('cart-badge')
    expect(badge).not.toBeInTheDocument()
  })

  it('affiche le badge avec le nombre d\'articles apres ajout', async () => {
    // Ajouter un article au store
    act(() => {
      useCartStore.getState().addItem(produitTest, 3)
    })

    render(<CartButton />)

    // Le composant utilise useEffect pour le montage, attendons le re-render
    const badge = await screen.findByTestId('cart-badge')
    expect(badge).toHaveTextContent('3')
  })

  it('met a jour le badge quand on ajoute un deuxieme produit', async () => {
    act(() => {
      useCartStore.getState().addItem(produitTest, 2)
      useCartStore.getState().addItem(produitTest2, 1)
    })

    render(<CartButton />)

    const badge = await screen.findByTestId('cart-badge')
    expect(badge).toHaveTextContent('3') // 2 + 1
  })

  it('appelle openCart quand on clique sur le bouton', async () => {
    const user = userEvent.setup()
    render(<CartButton />)

    const button = screen.getByRole('button', { name: /panier/i })
    await user.click(button)

    // Le store doit indiquer que le panier est ouvert
    expect(useCartStore.getState().isOpen).toBe(true)
  })
})

// ============================================================
// Tests du store Zustand — Cart Store
// ============================================================
describe('Cart Store - Zustand', () => {
  it('demarre avec un panier vide', () => {
    const state = useCartStore.getState()
    expect(state.items).toHaveLength(0)
    expect(state.totalItems()).toBe(0)
    expect(state.subtotal()).toBe(0)
  })

  // --- addItem ---
  describe('addItem', () => {
    it('ajoute un article au panier', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('prod-1')
      expect(state.items[0].quantity).toBe(1)
      expect(state.items[0].name).toBe('T-shirt Ankara')
    })

    it('ajoute un article avec quantite specifiee', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 3)
      })

      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('incremente la quantite si l\'article existe deja', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 2)
        useCartStore.getState().addItem(produitTest, 3)
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1) // Un seul article
      expect(state.items[0].quantity).toBe(5) // 2 + 3
    })

    it('respecte la limite de stock', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 8) // stock = 10
        useCartStore.getState().addItem(produitTest, 5) // 8 + 5 = 13 > 10
      })

      expect(useCartStore.getState().items[0].quantity).toBe(10) // Plafonne au stock
    })

    it('ouvre le panier automatiquement apres ajout', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
      })

      expect(useCartStore.getState().isOpen).toBe(true)
    })
  })

  // --- removeItem ---
  describe('removeItem', () => {
    it('supprime un article du panier', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
        useCartStore.getState().addItem(produitTest2)
      })

      expect(useCartStore.getState().items).toHaveLength(2)

      act(() => {
        useCartStore.getState().removeItem('prod-1')
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(1)
      expect(state.items[0].id).toBe('prod-2')
    })

    it('ne fait rien si l\'article n\'existe pas', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
        useCartStore.getState().removeItem('inexistant')
      })

      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  // --- updateQuantity ---
  describe('updateQuantity', () => {
    it('met a jour la quantite d\'un article', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
        useCartStore.getState().updateQuantity('prod-1', 5)
      })

      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('supprime l\'article si la quantite passe a 0', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest)
        useCartStore.getState().updateQuantity('prod-1', 0)
      })

      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('plafonne au stock disponible', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest) // stock = 10
        useCartStore.getState().updateQuantity('prod-1', 15)
      })

      expect(useCartStore.getState().items[0].quantity).toBe(10)
    })
  })

  // --- clearCart ---
  describe('clearCart', () => {
    it('vide le panier entierement', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 3)
        useCartStore.getState().addItem(produitTest2, 2)
      })

      expect(useCartStore.getState().items).toHaveLength(2)

      act(() => {
        useCartStore.getState().clearCart()
      })

      const state = useCartStore.getState()
      expect(state.items).toHaveLength(0)
      expect(state.totalItems()).toBe(0)
      expect(state.subtotal()).toBe(0)
    })
  })

  // --- Computed (totalItems, subtotal) ---
  describe('Computed', () => {
    it('totalItems retourne la somme des quantites', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 3)
        useCartStore.getState().addItem(produitTest2, 2)
      })

      expect(useCartStore.getState().totalItems()).toBe(5) // 3 + 2
    })

    it('subtotal retourne le total en FCFA', () => {
      act(() => {
        useCartStore.getState().addItem(produitTest, 2) // 5000 x 2
        useCartStore.getState().addItem(produitTest2, 1) // 15000 x 1
      })

      expect(useCartStore.getState().subtotal()).toBe(25000) // 10000 + 15000
    })
  })

  // --- isOpen / toggleCart ---
  describe('isOpen et toggleCart', () => {
    it('toggle l\'etat du panier', () => {
      // Reset isOpen to false (may be true from previous test)
      act(() => { useCartStore.getState().closeCart() })
      expect(useCartStore.getState().isOpen).toBe(false)

      act(() => {
        useCartStore.getState().toggleCart()
      })
      expect(useCartStore.getState().isOpen).toBe(true)

      act(() => {
        useCartStore.getState().toggleCart()
      })
      expect(useCartStore.getState().isOpen).toBe(false)
    })

    it('openCart et closeCart fonctionnent', () => {
      act(() => {
        useCartStore.getState().openCart()
      })
      expect(useCartStore.getState().isOpen).toBe(true)

      act(() => {
        useCartStore.getState().closeCart()
      })
      expect(useCartStore.getState().isOpen).toBe(false)
    })
  })
})
