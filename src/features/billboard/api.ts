import { BulletinListing, BulletinFormData, BulletinFilters, BulletinResponse } from '../bulletin/types';
import { 
  BillboardComment, 
  CommentFormData, 
  CommentsResponse, 
  ReactionsResponse,
  ReactionName 
} from './commentTypes';

const API_BASE = '/billboard';

export interface AIAnalysisResponse {
  success: boolean;
  analysis: {
    title: string;
    description: string;
    location?: string;
    estimatedPrice?: number;
    rooms?: number;
    size?: number;
    propertyType?: 'apartment' | 'house' | 'room' | 'shared' | 'office' | 'parking' | 'storage' | 'other';
    furnished?: boolean;
    features?: string[];
    requirements?: string[];
    energy_efficiency?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
    heating_type?: string;
    floor?: number;
    buildingYear?: number;
    balcony?: boolean;
    garden?: boolean;
    parking?: boolean;
    elevator?: boolean;
    cellar?: boolean;
  };
  processingTime: number;
  imageMetadata: {
    width: number;
    height: number;
    format: string;
    size: number;
    colors: string[];
    brightness: number;
    hasText: boolean;
    detectedText: string[];
  };
  error?: string;
  message?: string;
}

export const billboardApi = {
  // Get all billboard listings with optional filters
  getAllListings: async (filters?: BulletinFilters): Promise<BulletinResponse> => {
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
      throw new Error('Failed to fetch billboard listings');
    }
    return response.json();
  },

  // Get a single billboard listing by ID
  getListing: async (id: string): Promise<BulletinListing> => {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch billboard listing');
    }
    return response.json();
  },

  // AI Image Analysis
  analyzeImage: async (imageFile: File): Promise<AIAnalysisResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await fetch('/ai/analyze-image', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Image analysis failed');
    }
    return response.json();
  },

  // Create a new billboard listing with AI analysis
  createListing: async (data: {
    imageFile: File;
    aiAnalysis: AIAnalysisResponse['analysis'];
    userOverrides?: Partial<BulletinFormData>;
    userId?: string;
  }): Promise<BulletinListing> => {
    const formData = new FormData();
    
    // Add the image
    formData.append('image', data.imageFile);
    
    // Add AI analysis data
    formData.append('aiData', JSON.stringify(data.aiAnalysis));
    
    // Add user overrides
    if (data.userOverrides) {
      formData.append('userOverrides', JSON.stringify(data.userOverrides));
    }
    
    // Add user ID if authenticated
    if (data.userId) {
      formData.append('userId', data.userId);
    }

    const response = await fetch(`${API_BASE}`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to create billboard listing');
    }
    return response.json();
  },

  // Update a billboard listing
  updateListing: async (id: string, data: {
    imageFile?: File;
    updates: Partial<BulletinFormData>;
    userId?: string;
  }): Promise<BulletinListing> => {
    const formData = new FormData();
    
    // Add new image if provided
    if (data.imageFile) {
      formData.append('image', data.imageFile);
    }
    
    // Add updates
    formData.append('updates', JSON.stringify(data.updates));
    
    // Add user ID if authenticated
    if (data.userId) {
      formData.append('userId', data.userId);
    }

    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to update billboard listing');
    }
    return response.json();
  },

  // Delete a billboard listing
  deleteListing: async (id: string, userId?: string): Promise<void> => {
    const body = userId ? JSON.stringify({ userId }) : undefined;
    
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
      headers: userId ? { 'Content-Type': 'application/json' } : {},
      body,
    });

    if (!response.ok) {
      throw new Error('Failed to delete billboard listing');
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

  // Like/Unlike a listing
  toggleLike: async (id: string, userId: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await fetch(`${API_BASE}/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }
    return response.json();
  },

  // Get user's own listings (if authenticated)
  getMyListings: async (userId: string): Promise<BulletinListing[]> => {
    const response = await fetch(`${API_BASE}/my-listings?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user listings');
    }
    const data = await response.json();
    return data.listings || [];
  },

  // Search listings
  searchListings: async (query: string, filters?: BulletinFilters): Promise<BulletinResponse> => {
    const params = new URLSearchParams({ search: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const response = await fetch(`${API_BASE}/search?${params}`);
    if (!response.ok) {
      throw new Error('Failed to search billboard listings');
    }
    return response.json();
  },

  // === COMMENT FUNCTIONS ===
  
  // Get comments for a listing
  getComments: async (listingId: string, page = 1, limit = 20): Promise<CommentsResponse> => {
    const response = await fetch(`${API_BASE}/${listingId}/comments?page=${page}&limit=${limit}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  // Post a new comment
  postComment: async (listingId: string, data: CommentFormData, userId?: string): Promise<BillboardComment> => {
    const response = await fetch(`${API_BASE}/${listingId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        userId: userId || 'anonymous',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to post comment');
    }
    return response.json();
  },

  // Update a comment
  updateComment: async (commentId: string, comment: string, userId?: string): Promise<BillboardComment> => {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }
    return response.json();
  },

  // Delete a comment
  deleteComment: async (commentId: string, userId?: string): Promise<void> => {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
  },

  // Like/Unlike a comment
  toggleCommentLike: async (commentId: string, userId: string): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to toggle comment like');
    }
    return response.json();
  },

  // === REACTION FUNCTIONS ===

  // Get reactions for a listing
  getReactions: async (listingId: string, userId?: string): Promise<ReactionsResponse> => {
    const params = userId ? `?userId=${userId}` : '';
    const response = await fetch(`${API_BASE}/${listingId}/reactions${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch reactions');
    }
    return response.json();
  },

  // Add or update reaction
  addReaction: async (listingId: string, reactionType: ReactionName, userId: string): Promise<ReactionsResponse> => {
    const response = await fetch(`${API_BASE}/${listingId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reactionType, userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to add reaction');
    }
    return response.json();
  },

  // Remove reaction
  removeReaction: async (listingId: string, userId: string): Promise<ReactionsResponse> => {
    const response = await fetch(`${API_BASE}/${listingId}/reactions`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      throw new Error('Failed to remove reaction');
    }
    return response.json();
  },
};