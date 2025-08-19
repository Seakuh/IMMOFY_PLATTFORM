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
}