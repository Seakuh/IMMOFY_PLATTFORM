import { apiRequest } from "@/lib/apiClient";

export interface OnboardingSubmission {
  prompt: string;
  email: string;
  images?: File[];
  metadata?: {
    userAgent: string;
    timestamp: string;
    sessionId?: string;
  };
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  submissionId: string;
  propertyId?: string;
  estimatedProcessingTime?: number;
}

export async function submitOnboardingData(
  data: OnboardingSubmission
): Promise<OnboardingResponse> {
  // Das Onboarding erstellt jetzt Wohnungsgesuche statt Properties
  const formData = new FormData();

  // Text-Daten hinzufügen
  formData.append("prompt", data.prompt);
  formData.append("email", data.email);

  // Metadata hinzufügen
  if (data.metadata) {
    formData.append("metadata", JSON.stringify(data.metadata));
  }

  // Bilder hinzufügen (falls vorhanden)
  if (data.images && data.images.length > 0) {
    data.images.forEach((file, index) => {
      formData.append(`images`, file); // Backend erwartet Array
    });
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  // Neuer Endpoint für Wohnungsgesuche
  const response = await fetch(`${baseUrl}/housing-requests`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }

  const result = await response.json();

  // Transformiere die Antwort für das Onboarding-Interface
  return {
    success: result.success,
    message: result.message,
    submissionId: result.submissionId,
    propertyId: result.housingRequest?.id, // Verwende housingRequest ID als propertyId für Kompatibilität
    estimatedProcessingTime: 0, // Wohnungsgesuche werden sofort veröffentlicht
  };
}

// Alternative API-Funktion für JSON-Only Submission (ohne Bilder)
export async function submitOnboardingJSON(data: {
  prompt: string;
  email: string;
  imageCount: number;
  metadata?: any;
}): Promise<OnboardingResponse> {
  return apiRequest<OnboardingResponse>("/onboarding/submit-json", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Funktion zum Abrufen des Submission-Status
export async function getOnboardingStatus(submissionId: string): Promise<{
  status: "pending" | "processing" | "completed" | "failed";
  progress?: number;
  result?: any;
  error?: string;
}> {
  return apiRequest(`/onboarding/status/${submissionId}`);
}
