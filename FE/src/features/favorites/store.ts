import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FavoriteWithNote {
  seekerId: string
  addedAt: string
  note: string
}

interface FavoritesState {
  favorites: string[]
  favoritesWithNotes: FavoriteWithNote[]
  toggleFavorite: (seekerId: string) => void
  addFavorite: (seekerId: string) => void
  removeFavorite: (seekerId: string) => void
  clearFavorites: () => void
  updateNote: (seekerId: string, note: string) => void
  getNote: (seekerId: string) => string
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
      favoritesWithNotes: [],
      
      toggleFavorite: (seekerId: string) => {
        const { favorites } = get()
        if (favorites.includes(seekerId)) {
          set({ 
            favorites: favorites.filter(id => id !== seekerId),
            favoritesWithNotes: get().favoritesWithNotes.filter(f => f.seekerId !== seekerId)
          })
        } else {
          const newFavorite: FavoriteWithNote = {
            seekerId,
            addedAt: new Date().toISOString(),
            note: ''
          }
          set({ 
            favorites: [...favorites, seekerId],
            favoritesWithNotes: [...get().favoritesWithNotes, newFavorite]
          })
        }
      },
      
      addFavorite: (seekerId: string) => {
        const { favorites } = get()
        if (!favorites.includes(seekerId)) {
          const newFavorite: FavoriteWithNote = {
            seekerId,
            addedAt: new Date().toISOString(),
            note: ''
          }
          set({ 
            favorites: [...favorites, seekerId],
            favoritesWithNotes: [...get().favoritesWithNotes, newFavorite]
          })
        }
      },
      
      removeFavorite: (seekerId: string) => {
        set({ 
          favorites: get().favorites.filter(id => id !== seekerId),
          favoritesWithNotes: get().favoritesWithNotes.filter(f => f.seekerId !== seekerId)
        })
      },
      
      clearFavorites: () => set({ favorites: [], favoritesWithNotes: [] }),
      
      updateNote: (seekerId: string, note: string) => {
        const { favoritesWithNotes } = get()
        const existingFavorite = favoritesWithNotes.find(f => f.seekerId === seekerId)
        
        if (existingFavorite) {
          set({
            favoritesWithNotes: favoritesWithNotes.map(f =>
              f.seekerId === seekerId ? { ...f, note } : f
            )
          })
        }
      },
      
      getNote: (seekerId: string) => {
        const favorite = get().favoritesWithNotes.find(f => f.seekerId === seekerId)
        return favorite?.note || ''
      }
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