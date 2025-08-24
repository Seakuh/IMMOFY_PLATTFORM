import { BulletinListing, BulletinFormData, BulletinFilters, BulletinResponse } from './types';

const API_BASE = '/api/bulletin';

export const bulletinApi = {
  // Get all bulletin listings with optional filters
  getListings: async (filters?: BulletinFilters): Promise<BulletinResponse> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(`${API_BASE}?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bulletin listings');
    }
    return response.json();
  },

  // Get a single bulletin listing by ID
  getListing: async (id: string): Promise<BulletinListing> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bulletin listing');
    }
    return response.json();
  },

  // Create a new bulletin listing
  createListing: async (data: BulletinFormData): Promise<BulletinListing> => {
    const formData = new FormData();
    
    // Handle images
    if (data.images) {
      data.images.forEach((image, index) => {
        if (image instanceof File) {
          formData.append(`images`, image);
        }
      });
    }
    
    // Handle other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(API_BASE, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create bulletin listing');
    }
    return response.json();
  },

  // Update a bulletin listing
  updateListing: async (id: string, data: Partial<BulletinFormData>): Promise<BulletinListing> => {
    const formData = new FormData();
    
    // Handle images
    if (data.images) {
      data.images.forEach((image) => {
        if (image instanceof File) {
          formData.append(`images`, image);
        }
      });
    }
    
    // Handle other fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'images' && value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => formData.append(`${key}[]`, item));
        } else {
          formData.append(key, String(value));
        }
      }
    });

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update bulletin listing');
    }
    return response.json();
  },

  // Delete a bulletin listing
  deleteListing: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete bulletin listing');
    }
  },

  // Increment view count
  incrementViews: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/view`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to increment views');
    }
  },

  // Mark interest in a listing
  markInterested: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}/interest`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to mark interest');
    }
  },

  // Get user's own listings
  getMyListings: async (): Promise<BulletinListing[]> => {
    const response = await fetch(`${API_BASE}/my-listings`);
    if (!response.ok) {
      throw new Error('Failed to fetch user listings');
    }
    const data = await response.json();
    return data.listings || [];
  },
};