// src/chatbot/dto/user-data.dto.ts
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class UserDataDto {
  @IsNumber()
  age: number;

  @IsString()
  location: string;

  @IsOptional()
  @IsString()
  lifeStage?: string;

  @IsOptional()
  @IsNumber()
  roomSize?: number;

  @IsOptional()
  @IsNumber()
  apartmentSize?: number;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  preferences?: string;

  @IsOptional()
  @IsBoolean()
  hasPets?: boolean;

  @IsOptional()
  @IsString()
  accessibility?: string;

  // Seeker fields
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  headline?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;

  @IsOptional()
  @IsNumber()
  budgetMin?: number;

  @IsOptional()
  @IsNumber()
  budgetMax?: number;

  @IsOptional()
  @IsString({ each: true })
  locations?: string[];

  @IsOptional()
  @IsString()
  moveInFrom?: string;

  @IsOptional()
  @IsNumber()
  roomsMin?: number;

  @IsOptional()
  @IsBoolean()
  pets?: boolean;

  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;
}
