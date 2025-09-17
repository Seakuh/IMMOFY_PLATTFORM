import { IsString, IsOptional, IsArray, IsEmail } from 'class-validator';

export class UploadListingDto {
  @IsString()
  prompt: string; // Description or text about the listing

  @IsOptional()
  @IsString()
  platform?: string; // Platform where found (e.g., "Immobilienscout24")

  @IsOptional()
  @IsString()
  link?: string; // Link to original listing

  @IsOptional()
  @IsString()
  title?: string; // Title of the listing

  @IsOptional()
  @IsString()
  location?: string; // Location information

  @IsOptional()
  @IsString()
  landlordName?: string; // Landlord name if known

  @IsOptional()
  @IsEmail()
  landlordEmail?: string; // Landlord email if known

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string for additional metadata

  @IsOptional()
  @IsArray()
  images?: any[]; // File array handled by Multer
}

export interface UploadListingResponse {
  success: boolean;
  message: string;
  listingId: string;
  listing?: {
    id: string;
    filteredData?: any;
    uploadedImages?: string[];
    generatedDescription?: string;
  };
}