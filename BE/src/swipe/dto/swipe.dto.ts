import { IsString, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

export enum SwipeType {
  HOUSING_REQUEST = 'housing-request',
  APARTMENT = 'apartment',
}

export class SwipeDto {
  @IsString()
  itemId: string;

  @IsEnum(SwipeDirection)
  direction: SwipeDirection;

  @IsEnum(SwipeType)
  itemType: SwipeType;

  @IsString()
  userId: string;
}

export class GetSwipeItemsDto {
  @IsString()
  userId: string;

  @IsEnum(SwipeType)
  itemType: SwipeType;

  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsNumber()
  minRooms?: number;
}

export interface SwipeItem {
  id: string;
  title?: string;
  description: string;
  images?: string[];
  location?: string;
  price?: number;
  rooms?: number;
  features?: string[];
  itemType: SwipeType;
  filteredData?: any;
  generatedDescription?: string;
}

export interface SwipeResponse {
  success: boolean;
  match?: boolean; // true if both parties swiped right
  matchData?: {
    itemId: string;
    otherUserId: string;
    message?: string;
  };
}