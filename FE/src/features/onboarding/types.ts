export interface OnboardingData {
  prompt: string
  images: File[]
  email: string
}

export interface OnboardingSubmissionData {
  prompt: string
  email: string
  images?: File[]
  metadata?: {
    userAgent: string
    timestamp: string
    sessionId?: string
    stepCompletionTimes?: Record<string, number>
  }
}

export interface OnboardingResult {
  success: boolean
  message: string
  submissionId: string
  propertyId?: string
  estimatedProcessingTime?: number
  errors?: string[]
}

export type OnboardingStatus = 'idle' | 'submitting' | 'success' | 'error'