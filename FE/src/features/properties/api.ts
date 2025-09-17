import { apiRequest } from "@/lib/apiClient";
import { Property, PropertyFormData } from "./types";

export interface PropertiesResponse {
  properties: Property[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyFilters {
  minPrice?: number;
  maxPrice?: number;
  minRooms?: number;
  maxRooms?: number;
  minSize?: number;
  maxSize?: number;
  location?: string;
  features?: string[];
  search?: string;
}

export async function getProperties(
  filters: PropertyFilters = {}
): Promise<PropertiesResponse> {
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

  return apiRequest<PropertiesResponse>(
    `/properties?${searchParams.toString()}`
  );
}

export async function getProperty(id: string): Promise<Property> {
  return apiRequest<Property>(`/properties/${id}`);
}

export async function createProperty(
  data: PropertyFormData
): Promise<Property> {
  return apiRequest<Property>("/properties", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// Neue Funktion: Property mit Bildern in einem Schritt erstellen
export async function createPropertyWithImages(
  propertyData: PropertyFormData,
  images: File[]
): Promise<Property> {
  const formData = new FormData()
  
  // Property-Daten als JSON hinzufügen
  formData.append('propertyData', JSON.stringify(propertyData))
  
  // Bilder hinzufügen
  images.forEach((file) => {
    formData.append('images', file)
  })
  
  // Metadata hinzufügen
  formData.append('metadata', JSON.stringify({
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    imageCount: images.length
  }))

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  const response = await fetch(`${baseUrl}/properties/create-with-images`, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export async function updateProperty(
  id: string,
  data: Partial<PropertyFormData>
): Promise<Property> {
  return apiRequest<Property>(`/properties/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteProperty(id: string): Promise<void> {
  await apiRequest(`/properties/${id}`, {
    method: "DELETE",
  });
}

export async function uploadPropertyImages(
  propertyId: string,
  files: File[]
): Promise<string[]> {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const response = await fetch(
    `${baseUrl}/api/properties/${propertyId}/images`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Failed to upload images");
  }

  const result = await response.json();
  return result.imageUrls;
}

export async function getSimilarProperties(id: string): Promise<Property[]> {
  return apiRequest<Property[]>(`/properties/similar/${id}`);
}
