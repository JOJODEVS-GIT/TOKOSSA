// Zustand Store - Gestion d'état client
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// Types
export interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  oldPrice?: number
  image: string
  quantity: number
  stock: number
}

export interface CartStore {
  items: CartItem[]
  isOpen: boolean

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  // Computed
  totalItems: () => number
  subtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)

          if (existingItem) {
            // Increment quantity (max = stock)
            const newQuantity = Math.min(existingItem.quantity + quantity, item.stock)
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: newQuantity } : i
              ),
              isOpen: true,
            }
          }

          // Add new item
          return {
            items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }],
            isOpen: true,
          }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.id !== id) }
          }

          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(quantity, i.stock) } : i
            ),
          }
        })
      },

      clearCart: () => set({ items: [] }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0)
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      },
    }),
    {
      name: 'tokossa-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }), // Only persist items
    }
  )
)

// Store pour les favoris (wishlist) — persiste dans localStorage
interface FavoritesStore {
  favorites: string[]
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (id) => {
        set((state) => {
          if (state.favorites.includes(id)) return state
          return { favorites: [...state.favorites, id] }
        })
      },

      removeFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id),
        }))
      },

      isFavorite: (id) => {
        return get().favorites.includes(id)
      },

      toggleFavorite: (id) => {
        set((state) => {
          if (state.favorites.includes(id)) {
            return { favorites: state.favorites.filter((favId) => favId !== id) }
          }
          return { favorites: [...state.favorites, id] }
        })
      },
    }),
    {
      name: 'tokossa-favorites',
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// Store pour les notifications de vente (social proof)
interface SaleNotification {
  id: string
  productName: string
  customerName: string
  quarter: string
  timestamp: number
}

interface NotificationStore {
  notifications: SaleNotification[]
  currentNotification: SaleNotification | null
  addNotification: (notification: Omit<SaleNotification, 'id' | 'timestamp'>) => void
  showNext: () => void
  dismiss: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  currentNotification: null,

  addNotification: (notification) => {
    const newNotification: SaleNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: Date.now(),
    }

    set((state) => ({
      notifications: [...state.notifications, newNotification],
      currentNotification: state.currentNotification || newNotification,
    }))
  },

  showNext: () => {
    set((state) => {
      const currentIndex = state.notifications.findIndex(
        (n) => n.id === state.currentNotification?.id
      )
      const nextIndex = (currentIndex + 1) % state.notifications.length
      return {
        currentNotification: state.notifications[nextIndex] || null,
      }
    })
  },

  dismiss: () => {
    set({ currentNotification: null })
  },
}))
