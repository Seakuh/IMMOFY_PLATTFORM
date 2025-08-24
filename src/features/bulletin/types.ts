export interface BulletinListing {
  id: string;
  title: string;
  description: string;
  availableFrom: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  
  // Additional fields for a comprehensive listing
  price?: number;
  location?: string;
  rooms?: number;
  size?: number; // in sqm
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  deposit?: number;
  utilities?: number;
  contactEmail?: string;
  contactPhone?: string;
  availableTo?: string; // end date if temporary
  propertyType?: 'apartment' | 'house' | 'room' | 'shared' | 'office' | 'parking' | 'storage' | 'other';
  features?: string[]; // e.g., ["balcony", "dishwasher", "elevator"]
  requirements?: string[]; // e.g., ["non-smoker", "professional", "references"]
  energy_efficiency?: 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
  heating_type?: string; // e.g., "central", "gas", "electric"
  
  // Status and engagement
  isActive: boolean;
  views: number;
  interested_count: number;
  priority?: 'low' | 'medium' | 'high';
  
  // User info (if logged in)
  userId?: string;
  userName?: string;
  userAvatar?: string;
}

export interface BulletinFormData {
  title: string;
  description: string;
  availableFrom: string;
  images: File[] | string[];
  price?: number;
  location?: string;
  rooms?: number;
  size?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  deposit?: number;
  utilities?: number;
  contactEmail?: string;
  contactPhone?: string;
  availableTo?: string;
  propertyType?: BulletinListing['propertyType'];
  features?: string[];
  requirements?: string[];
  energy_efficiency?: BulletinListing['energy_efficiency'];
  heating_type?: string;
  priority?: BulletinListing['priority'];
}

export interface BulletinFilters {
  search?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rooms?: number;
  propertyType?: BulletinListing['propertyType'];
  furnished?: boolean;
  petsAllowed?: boolean;
  availableFrom?: string;
  availableTo?: string;
  sort?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'relevance' | 'priority';
  page?: number;
  limit?: number;
}

export interface BulletinResponse {
  listings: BulletinListing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}