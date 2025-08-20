import { create } from 'zustand'
import { Property } from './types'

interface PropertyStore {
  properties: Property[]
  selectedProperty: Property | null
  filters: {
    minPrice?: number
    maxPrice?: number
    minRooms?: number
    maxRooms?: number
    minSize?: number
    maxSize?: number
    location?: string
    features?: string[]
    search?: string
  }
  setProperties: (properties: Property[]) => void
  setSelectedProperty: (property: Property | null) => void
  updateProperty: (property: Property) => void
  addProperty: (property: Property) => void
  removeProperty: (id: string) => void
  setFilters: (filters: any) => void
  clearFilters: () => void
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  properties: [],
  selectedProperty: null,
  filters: {},
  
  setProperties: (properties) => set({ properties }),
  
  setSelectedProperty: (property) => set({ selectedProperty: property }),
  
  updateProperty: (updatedProperty) => set((state) => ({
    properties: state.properties.map(p => 
      p.id === updatedProperty.id ? updatedProperty : p
    ),
    selectedProperty: state.selectedProperty?.id === updatedProperty.id 
      ? updatedProperty 
      : state.selectedProperty
  })),
  
  addProperty: (property) => set((state) => ({
    properties: [property, ...state.properties]
  })),
  
  removeProperty: (id) => set((state) => ({
    properties: state.properties.filter(p => p.id !== id),
    selectedProperty: state.selectedProperty?.id === id ? null : state.selectedProperty
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  clearFilters: () => set({ filters: {} })
}))