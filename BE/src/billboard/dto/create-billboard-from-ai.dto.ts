import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { BillboardCategory, BillboardType, BillboardStatus } from '../entities/billboard.entity';

export class CreateBillboardFromAiDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsEnum(BillboardCategory)
  category: BillboardCategory;

  @IsEnum(BillboardType)
  type: BillboardType;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  priceType?: string;

  @IsOptional()
  @IsNumber()
  size?: number;

  @IsOptional()
  @IsNumber()
  rooms?: number;

  @IsOptional()
  @IsNumber()
  bedrooms?: number;

  @IsOptional()
  @IsNumber()
  bathrooms?: number;

  @IsOptional()
  @IsBoolean()
  furnished?: boolean;

  @IsOptional()
  @IsBoolean()
  balcony?: boolean;

  @IsOptional()
  @IsBoolean()
  garden?: boolean;

  @IsOptional()
  @IsBoolean()
  parking?: boolean;

  @IsOptional()
  @IsBoolean()
  elevator?: boolean;

  @IsOptional()
  @IsBoolean()
  petsAllowed?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  floor?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}