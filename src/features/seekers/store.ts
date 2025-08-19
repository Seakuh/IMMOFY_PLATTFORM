import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoritesState {
  favorites: string[]
  toggleFavorite: (seekerId: string) => void
  addFavorite: (seekerId: string) => void
  removeFavorite: (seekerId: string) => void
  clearFavorites: () => void
}

interface HistoryState {
  history: Array<{ seekerId: string; viewedAt: string }>
  addToHistory: (seekerId: string) => void
  clearHistory: () => void
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (seekerId: string) => {
        const { favorites } = get()
        if (favorites.includes(seekerId)) {
          set({ favorites: favorites.filter(id => id !== seekerId) })
        } else {
          set({ favorites: [...favorites, seekerId] })
        }
      },
      addFavorite: (seekerId: string) => {
        const { favorites } = get()
        if (!favorites.includes(seekerId)) {
          set({ favorites: [...favorites, seekerId] })
        }
      },
      removeFavorite: (seekerId: string) => {
        set({ favorites: get().favorites.filter(id => id !== seekerId) })
      },
      clearFavorites: () => set({ favorites: [] }),
    }),
    {
      name: 'immofy-favorites',
    }
  )
)

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: [],
      addToHistory: (seekerId: string) => {
        const { history } = get()
        const existingIndex = history.findIndex(item => item.seekerId === seekerId)
        const newItem = { seekerId, viewedAt: new Date().toISOString() }
        
        if (existingIndex >= 0) {
          const updatedHistory = [...history]
          updatedHistory[existingIndex] = newItem
          set({ history: updatedHistory })
        } else {
          set({ history: [newItem, ...history.slice(0, 49)] })
        }
      },
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'immofy-history',
    }
  )
)