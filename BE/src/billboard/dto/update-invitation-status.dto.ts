import { IsEnum } from 'class-validator';
import { InvitationStatus } from '../entities/billboard-invitation.entity';

export class UpdateInvitationStatusDto {
  @IsEnum(InvitationStatus, { message: 'Status must be one of: pending, accepted, rejected, expired' })
  status: InvitationStatus;
}