import { create } from 'zustand'
import { Seeker, SearchFilters } from './types'
import { mockSeekers } from './mockData'

interface SeekersState {
  seekers: Seeker[]
  isLoading: boolean
  error: string | null
  filters: SearchFilters
  fetchSeekers: (filters?: SearchFilters) => Promise<void>
  setFilters: (filters: SearchFilters) => void
  getSeeker: (id: string) => Seeker | undefined
}

export const useSeekersStore = create<SeekersState>((set, get) => ({
  seekers: [],
  isLoading: false,
  error: null,
  filters: {},
  
  fetchSeekers: async (filters?: SearchFilters) => {
    set({ isLoading: true, error: null })
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      let filteredSeekers = [...mockSeekers]
      
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        filteredSeekers = filteredSeekers.filter(seeker =>
          seeker.name?.toLowerCase().includes(searchLower) ||
          seeker.headline?.toLowerCase().includes(searchLower) ||
          seeker.locations.some(loc => loc.toLowerCase().includes(searchLower)) ||
          seeker.tags?.some(tag => tag.toLowerCase().includes(searchLower)) ||
          seeker.bio?.toLowerCase().includes(searchLower)
        )
      }
      
      if (filters?.locations && filters.locations.length > 0) {
        filteredSeekers = filteredSeekers.filter(seeker =>
          seeker.locations.some(loc => filters.locations!.includes(loc))
        )
      }
      
      if (filters?.budgetMin) {
        filteredSeekers = filteredSeekers.filter(seeker =>
          !seeker.budgetMax || seeker.budgetMax >= filters.budgetMin!
        )
      }
      
      if (filters?.budgetMax) {
        filteredSeekers = filteredSeekers.filter(seeker =>
          !seeker.budgetMin || seeker.budgetMin <= filters.budgetMax!
        )
      }
      
      if (filters?.roomsMin) {
        filteredSeekers = filteredSeekers.filter(seeker =>
          !seeker.roomsMin || seeker.roomsMin >= filters.roomsMin!
        )
      }
      
      if (filters?.pets !== undefined) {
        filteredSeekers = filteredSeekers.filter(seeker =>
          seeker.pets === filters.pets
        )
      }
      
      // Sort seekers
      switch (filters?.sort) {
        case 'budget_asc':
          filteredSeekers.sort((a, b) => (a.budgetMin || 0) - (b.budgetMin || 0))
          break
        case 'budget_desc':
          filteredSeekers.sort((a, b) => (b.budgetMax || 0) - (a.budgetMax || 0))
          break
        case 'newest':
        default:
          filteredSeekers.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          break
      }
      
      set({ 
        seekers: filteredSeekers, 
        isLoading: false,
        filters: filters || {}
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      })
    }
  },
  
  setFilters: (filters: SearchFilters) => {
    set({ filters })
    get().fetchSeekers(filters)
  },
  
  getSeeker: (id: string) => {
    return get().seekers.find(seeker => seeker.id === id)
  }
}))