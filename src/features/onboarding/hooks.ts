import { useState } from 'react'
import { submitOnboardingData } from './api'
import { OnboardingData, OnboardingStatus, OnboardingResult } from './types'

export function useOnboardingSubmission() {
  const [status, setStatus] = useState<OnboardingStatus>('idle')
  const [result, setResult] = useState<OnboardingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const submitOnboarding = async (data: OnboardingData): Promise<OnboardingResult | null> => {
    try {
      setStatus('submitting')
      setError(null)
      setResult(null)

      // Erstelle Submission-Daten mit Metadata
      const submissionData = {
        prompt: data.prompt,
        email: data.email,
        images: data.images,
        metadata: {
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          sessionId: generateSessionId(),
        }
      }

      const response = await submitOnboardingData(submissionData)
      
      const successResult: OnboardingResult = {
        success: true,
        message: response.message,
        submissionId: response.submissionId,
        propertyId: response.propertyId,
        estimatedProcessingTime: response.estimatedProcessingTime
      }

      setResult(successResult)
      setStatus('success')
      
      return successResult
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten'
      const errorResult: OnboardingResult = {
        success: false,
        message: errorMessage,
        submissionId: '',
        errors: [errorMessage]
      }

      setError(errorMessage)
      setResult(errorResult)
      setStatus('error')
      
      return errorResult
    }
  }

  const reset = () => {
    setStatus('idle')
    setResult(null)
    setError(null)
  }

  return {
    status,
    result,
    error,
    submitOnboarding,
    reset,
    isSubmitting: status === 'submitting',
    isSuccess: status === 'success',
    isError: status === 'error'
  }
}

// Hilfsfunktion zur Generierung einer Session-ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}