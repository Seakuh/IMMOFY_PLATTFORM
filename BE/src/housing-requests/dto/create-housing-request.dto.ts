import { IsString, IsEmail, IsOptional, IsArray } from 'class-validator';

export class CreateHousingRequestDto {
  @IsString()
  prompt: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string

  @IsOptional()
  @IsString()
  name?: string; // Optional name of the person making the request

  @IsOptional()
  @IsArray()
  images?: any[]; // File array wird vom Multer-Middleware verarbeitet
}

export interface OnboardingResponse {
  success: boolean;
  message: string;
  submissionId: string;
  housingRequest?: {
    id: string;
    filteredData?: any;
    uploadedImages?: string[];
  };
}