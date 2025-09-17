import { apiRequest } from "@/lib/apiClient";
import {
  CreateHousingRequestRequest,
  CreateHousingRequestResponse,
  HousingRequest,
} from "./types";

export interface HousingRequestsResponse {
  housingRequests: HousingRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface HousingRequestFilters {
  maxBudget?: number;
  minRooms?: number;
  maxRooms?: number;
  locations?: string[];
  moveInDate?: string;
  search?: string;
}

// Wohnungsgesuche abrufen (für Vermieter)
export async function getHousingRequests(
  filters: HousingRequestFilters = {}
): Promise<HousingRequestsResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, v));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });

  return apiRequest<HousingRequestsResponse>(
    `/housing-requests?${searchParams.toString()}`
  );
}

// Einzelnes Wohnungsgesuch abrufen
export async function getHousingRequest(id: string): Promise<HousingRequest> {
  return apiRequest<HousingRequest>(`/housing-requests/${id}`);
}

// Neues Wohnungsgesuch erstellen (vom Onboarding)
export async function createHousingRequest(
  data: CreateHousingRequestRequest
): Promise<CreateHousingRequestResponse> {
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
    data.images.forEach((file) => {
      formData.append("images", file);
    });
  }

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

  return response.json();
}

// Wohnungsgesuch aktualisieren
export async function updateHousingRequest(
  id: string,
  data: Partial<CreateHousingRequestRequest>
): Promise<HousingRequest> {
  return apiRequest<HousingRequest>(`/housing-requests/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

// Wohnungsgesuch löschen
export async function deleteHousingRequest(id: string): Promise<void> {
  await apiRequest(`/housing-requests/${id}`, {
    method: "DELETE",
  });
}

export interface HomepageData {
  latest: HousingRequest[];
  featured: HousingRequest[];
  stats: {
    totalRequests: number;
    activeRequests: number;
    recentRequests: number;
  };
}

// Homepage-Daten abrufen
export async function getHomepageData(): Promise<HomepageData> {
  return apiRequest<HomepageData>('/housing-requests/homepage');
}

// Ähnliche Wohnungsgesuche finden
export async function getSimilarHousingRequests(
  id: string,
  limit: number = 5
): Promise<HousingRequest[]> {
  return apiRequest<HousingRequest[]>(`/housing-requests/${id}/similar?limit=${limit}`);
}

// Empfohlene Inserate für ein Wohnungsgesuch (semantisch, Cognee mit Fallback)
export async function getRecommendedBillboards(
  id: string,
  limit: number = 6
): Promise<{ billboards: any[] }> {
  return apiRequest<{ billboards: any[] }>(`/housing-requests/${id}/recommend-billboards?limit=${limit}`);
}

// Kontakt zu einem Wohnungssuchenden aufnehmen (für Vermieter)
export async function contactHousingRequest(
  requestId: string,
  landlordData: {
    name: string;
    email: string;
    message: string;
    propertyDetails?: any;
  }
): Promise<{ success: boolean; message: string }> {
  return apiRequest(`/housing-requests/${requestId}/contact`, {
    method: "POST",
    body: JSON.stringify(landlordData),
  });
}
