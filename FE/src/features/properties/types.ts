export interface Property {
  id: string
  title: string
  description?: string
  price: number
  location: string
  rooms: number
  size?: number // in sqm
  images: string[]
  features?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  views: number
  interestedCount: number
  
  // Additional enhanced fields
  availableFrom?: string
  availableTo?: string
  furnished?: boolean
  petsAllowed?: boolean
  smokingAllowed?: boolean
  deposit?: number
  utilities?: number
  contactEmail?: string
  contactPhone?: string
  propertyType?: 'apartment' | 'house' | 'room' | 'shared' | 'office' | 'parking' | 'storage' | 'other'
  requirements?: string[] // e.g., ["non-smoker", "professional", "references"]
  energy_efficiency?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'
  heating_type?: string // e.g., "central", "gas", "electric"
  floor?: number
  totalFloors?: number
  buildingYear?: number
  balcony?: boolean
  garden?: boolean
  parking?: boolean
  elevator?: boolean
  cellar?: boolean
  priority?: 'low' | 'medium' | 'high'
  
  // User info
  userId?: string
  userName?: string
  userAvatar?: string
}

export interface PropertyFormData {
  title: string
  description: string
  price: number
  location: string
  rooms: number
  size: number
  images: string[]
  features: string[]
  
  // Enhanced form fields
  availableFrom?: string
  availableTo?: string
  furnished?: boolean
  petsAllowed?: boolean
  smokingAllowed?: boolean
  deposit?: number
  utilities?: number
  contactEmail?: string
  contactPhone?: string
  propertyType?: Property['propertyType']
  requirements?: string[]
  energy_efficiency?: Property['energy_efficiency']
  heating_type?: string
  floor?: number
  totalFloors?: number
  buildingYear?: number
  balcony?: boolean
  garden?: boolean
  parking?: boolean
  elevator?: boolean
  cellar?: boolean
  priority?: Property['priority']
}