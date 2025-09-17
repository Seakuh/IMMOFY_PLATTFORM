import { IsOptional, IsEnum, IsNumber, IsString, IsBoolean, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BillboardCategory, BillboardType, BillboardStatus } from '../entities/billboard.entity';

export class BillboardFilterDto {
  @IsOptional()
  @IsEnum(BillboardCategory)
  category?: BillboardCategory;

  @IsOptional()
  @IsEnum(BillboardType)
  type?: BillboardType;

  @IsOptional()
  @IsEnum(BillboardStatus)
  status?: BillboardStatus;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxSize?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  minRooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  maxRooms?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  petsAllowed?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  balcony?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  garden?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  elevator?: boolean;

  @IsOptional()
  @IsString()
  search?: string; // Full-text search

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  radius?: number; // Search radius in km

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat?: number; // For geo search

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng?: number; // For geo search
}