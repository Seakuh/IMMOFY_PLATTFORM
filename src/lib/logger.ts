interface LogData {
  event: string
  timestamp: string
  data?: any
  userAgent?: string
  url?: string
}

class Logger {
  private logs: LogData[] = []

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private createLogEntry(event: string, data?: any): LogData {
    return {
      event,
      timestamp: this.formatTimestamp(),
      data,
      userAgent: navigator.userAgent,
      url: window.location.href
    }
  }

  // Onboarding Events
  onboardingStarted(data?: any) {
    const logEntry = this.createLogEntry('onboarding_started', data)
    this.logs.push(logEntry)
    console.log('📝 ONBOARDING_STARTED:', logEntry)
  }

  onboardingStepCompleted(step: string, data?: any) {
    const logEntry = this.createLogEntry('onboarding_step_completed', { step, ...data })
    this.logs.push(logEntry)
    console.log(`📝 ONBOARDING_STEP_COMPLETED (${step}):`, logEntry)
  }

  onboardingCompleted(data: { prompt: string; images: File[]; email: string }) {
    const logData = {
      prompt_length: data.prompt.length,
      image_count: data.images.length,
      email: data.email,
      image_details: data.images.map(img => ({
        name: img.name,
        size: img.size,
        type: img.type
      }))
    }
    
    const logEntry = this.createLogEntry('onboarding_completed', logData)
    this.logs.push(logEntry)
    console.log('🎉 ONBOARDING_COMPLETED:', logEntry)
    
    // Pretty print der vollständigen Daten
    console.group('📋 Detaillierte Onboarding-Daten:')
    console.log('📝 Prompt:', data.prompt)
    console.log('📧 E-Mail:', data.email)
    console.log('🖼️ Bilder:', data.images.length > 0 ? data.images : 'Keine Bilder hochgeladen')
    console.groupEnd()
  }

  onboardingAbandoned(step: string, data?: any) {
    const logEntry = this.createLogEntry('onboarding_abandoned', { step, ...data })
    this.logs.push(logEntry)
    console.log(`❌ ONBOARDING_ABANDONED (${step}):`, logEntry)
  }

  // User Interaction Events
  buttonClicked(buttonId: string, context?: string) {
    const logEntry = this.createLogEntry('button_clicked', { buttonId, context })
    this.logs.push(logEntry)
    console.log('🔘 BUTTON_CLICKED:', logEntry)
  }

  pageViewed(pageName: string) {
    const logEntry = this.createLogEntry('page_viewed', { pageName })
    this.logs.push(logEntry)
    console.log('👁️ PAGE_VIEWED:', logEntry)
  }

  // Property Events
  propertyCreated(propertyData: any) {
    const logEntry = this.createLogEntry('property_created', propertyData)
    this.logs.push(logEntry)
    console.log('🏠 PROPERTY_CREATED:', logEntry)
  }

  // Get all logs
  getAllLogs(): LogData[] {
    return [...this.logs]
  }

  // Clear logs
  clearLogs() {
    this.logs = []
    console.log('🗑️ LOGS_CLEARED')
  }

  // Export logs as JSON
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Send logs to backend (placeholder)
  async sendLogsToBackend() {
    try {
      // Hier würdest du die Logs an dein Backend senden
      console.log('📤 Sending logs to backend...', this.logs)
      
      // Beispiel API Call:
      // await fetch('/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(this.logs)
      // })
      
      console.log('✅ Logs sent successfully')
    } catch (error) {
      console.error('❌ Failed to send logs:', error)
    }
  }
}

// Singleton Instance
export const logger = new Logger()

// Convenience functions
export const logOnboardingStarted = (data?: any) => logger.onboardingStarted(data)
export const logOnboardingStepCompleted = (step: string, data?: any) => logger.onboardingStepCompleted(step, data)
export const logOnboardingCompleted = (data: { prompt: string; images: File[]; email: string }) => logger.onboardingCompleted(data)
export const logOnboardingAbandoned = (step: string, data?: any) => logger.onboardingAbandoned(step, data)
export const logButtonClicked = (buttonId: string, context?: string) => logger.buttonClicked(buttonId, context)
export const logPageViewed = (pageName: string) => logger.pageViewed(pageName)