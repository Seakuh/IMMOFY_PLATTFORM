export interface HousingRequest {
  id: string
  title: string
  description: string
  email: string
  images?: string[]
  // Wohnungssuche spezifische Felder
  maxBudget?: number
  minRooms?: number
  maxRooms?: number
  minSize?: number
  preferredLocations: string[]
  moveInDate?: string
  // Persönliche Informationen
  profileInfo?: {
    age?: number
    profession?: string
    pets?: boolean
    smoking?: boolean
    references?: boolean
  }
  // System Felder
  isActive: boolean
  createdAt: string
  updatedAt: string
  views: number
  contactRequests: number
}

export interface HousingRequestFormData {
  description: string // Der Haupt-Prompt vom Onboarding
  email: string
  images: File[]
  // Optional: Strukturierte Daten (können später hinzugefügt werden)
  maxBudget?: number
  preferredLocations?: string[]
  moveInDate?: string
  additionalInfo?: string
}

export interface CreateHousingRequestRequest {
  prompt: string // Haupt-Beschreibung
  email: string
  images?: File[]
  metadata?: {
    userAgent: string
    timestamp: string
    sessionId?: string
  }
}

export interface CreateHousingRequestResponse {
  success: boolean
  message: string
  housingRequest: HousingRequest
  submissionId: string
}