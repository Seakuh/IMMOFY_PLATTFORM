import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateListingDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  link: string;

  @IsString()
  @IsOptional()
  prompt?: string;
}
