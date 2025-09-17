
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  relatedListingId?: string;

  @IsOptional()
  @IsString()
  relatedHousingRequestId?: string;
}
