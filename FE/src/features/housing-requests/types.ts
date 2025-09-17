export interface HousingRequest {
  id: string
  prompt: string
  email: string
  metadata?: {
    userAgent: string
    timestamp: string
    sessionId?: string
  }
  filteredData?: any
  generatedDescription: string
  uploadedImages?: string[]
  vector?: number[]
  status: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
  
  // Legacy fields for backwards compatibility
  title?: string
  description?: string
  images?: string[]
  maxBudget?: number
  minRooms?: number
  maxRooms?: number
  minSize?: number
  preferredLocations?: string[]
  moveInDate?: string
  profileInfo?: {
    age?: number
    profession?: string
    pets?: boolean
    smoking?: boolean
    references?: boolean
  }
  isActive?: boolean
  views?: number
  contactRequests?: number
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