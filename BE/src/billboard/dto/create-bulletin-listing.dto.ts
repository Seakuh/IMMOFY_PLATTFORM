import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateBulletinListingDto {
  @IsString()
  formData: string; // JSON string from FormData

  @IsOptional()
  @IsString()
  userId?: string;
}

// Interface for the parsed form data
export interface BulletinFormData {
  title: string;
  description: string;
  content?: string;
  category: string;
  type: string;
  price?: number;
  priceType?: string;
  location: string;
  city?: string;
  zipCode?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  size?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  furnished?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  balcony?: boolean;
  garden?: boolean;
  parking?: boolean;
  elevator?: boolean;
  accessible?: boolean;
  amenities?: string[];
  tags?: string[];
  availableFrom?: string;
  availableUntil?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  deposit?: number;
  utilities?: number;
  heatingType?: string;
  deadline?: string;
  maxInvitations?: number;
}

export interface BulletinListing {
  success: boolean;
  message: string;
  billboard: {
    id: string;
    title: string;
    description: string;
    content?: string;
    hashtags: string[];
    images: string[];
    location: string;
    price?: number;
    createdAt: string;
    [key: string]: any;
  };
}