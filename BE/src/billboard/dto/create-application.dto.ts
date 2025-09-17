import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateApplicationDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Application message must not exceed 1000 characters' })
  message?: string;
}