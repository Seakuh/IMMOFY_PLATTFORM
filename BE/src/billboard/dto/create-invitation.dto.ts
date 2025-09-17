import { IsString, IsOptional, MaxLength } from 'class-validator';

export class CreateInvitationDto {
  @IsString()
  inviteeId: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000, { message: 'Invitation message must not exceed 1000 characters' })
  message?: string;
}