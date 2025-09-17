import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateHousingRequestDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsOptional()
  @IsString()
  generatedDescription?: string;

  @IsOptional()
  @IsString()
  metadata?: string; // JSON string

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsString()
  status?: string;
}